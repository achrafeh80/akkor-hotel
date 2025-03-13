const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Tests Authentification ', () => {
  let mongoConnection;
  let testUserPassword = 'password123';

  beforeAll(async () => {
    // Connexion à MongoDB sans options dépréciées
    mongoConnection = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/test-auth'
    );

    // Nettoyer la base de données avant les tests
    await User.deleteMany({});

    // 🔹 Créer un utilisateur avec mot de passe en clair (sans bcrypt)
    const testUser = new User({
      email: 'test@example.com',
      pseudo: 'TestUser',
      password: testUserPassword // Stocké en clair, PAS de hachage ici !
    });

    await testUser.save();
    console.log('✅ Utilisateur de test créé avec mot de passe en clair.');

    // Vérifier que l'utilisateur est bien enregistré
    const savedUser = await User.findOne({ email: 'test@example.com' });
    console.log(`🔹 Utilisateur récupéré: ${savedUser?._id}, mot de passe stocké: ${savedUser?.password}`);
  });

  afterAll(async () => {
    // Nettoyage et fermeture de la connexion
    if (mongoConnection) {
      try {
        await User.deleteMany({});
        await mongoose.connection.close();
        console.log('✅ Connexion MongoDB fermée proprement');
      } catch (error) {
        console.error('❌ Erreur lors de la fermeture de la connexion:', error);
      }
    }
  });

  // 🔹 Test de connexion avec mot de passe en clair
  it('Connexion utilisateur avec mot de passe correct ', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: testUserPassword // Utiliser le même mot de passe enregistré
      });

    console.log('🔹 Réponse de login:', {
      status: res.statusCode,
      body: res.body
    });

    // Attendu : succès de la connexion (200)
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // 🔹 Test de création d'utilisateur (sans hachage)
  it('Créer un utilisateur ', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test2@example.com',
        pseudo: 'TestUser2',
        password: 'password123' // Stocké en clair, sans bcrypt
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
  });

  // 🔹 Test de connexion avec mauvais mot de passe
  it('Connexion avec mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Mot de passe incorrect');
  });

  // 🔹 Test de connexion avec un utilisateur inexistant
  it('Connexion avec utilisateur inexistant', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Utilisateur non trouvé');
  });
});
