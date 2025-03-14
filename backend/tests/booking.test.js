const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');

// Variables pour stocker les IDs créés pendant les tests
let userId;
let hotelId;
let bookingId;
let authToken;

// Configuration avant les tests
beforeAll(async () => {
  // Créer un utilisateur test
  const user = await User.create({
    email: 'test-booking@example.com',
    pseudo: 'testbooking',
    password: 'password123'
  });
  userId = user._id;

  // Créer un hôtel test
  const hotel = await Hotel.create({
    name: 'Hôtel Test',
    location: 'Paris',
    description: 'Un hôtel pour tester les réservations',
    picture_list: ['image1.jpg', 'image2.jpg']
  });
  hotelId = hotel._id;

  // Générer un token d'authentification
  authToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret_for_tests',
    { expiresIn: '1h' }
  );
});

// Nettoyage après les tests
afterAll(async () => {
  // Supprimer les données de test
  await User.findByIdAndDelete(userId);
  await Hotel.findByIdAndDelete(hotelId);
  await Booking.deleteMany({ user: userId });
  
  // Fermer la connexion à la base de données
  await mongoose.connection.close();
});

describe('API de réservation', () => {
  // Test de création d'une réservation
  test('Devrait créer une nouvelle réservation', async () => {
    const bookingData = {
      hotel: hotelId,
      checkInDate: new Date('2025-04-01'),
      checkOutDate: new Date('2025-04-05'),
      guests: 2
    };

    console.log('Données envoyées:', JSON.stringify(bookingData));

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(bookingData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.hotel).toBe(hotelId.toString());
    expect(response.body.user).toBe(userId.toString());
    expect(response.body.guests).toBe(2);
    
    // Sauvegarder l'ID de la réservation pour les tests suivants
    bookingId = response.body._id;
  });

  // Test de récupération des réservations de l'utilisateur
  test('Devrait récupérer toutes les réservations de l\'utilisateur', async () => {
    const response = await request(app)
      .get('/api/bookings/mybookings')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    
    // Vérifier que la réservation créée précédemment est présente
    const foundBooking = response.body.find(booking => booking._id === bookingId);
    expect(foundBooking).toBeTruthy();
  });

  // Test de mise à jour d'une réservation
  test('Devrait mettre à jour une réservation existante', async () => {
    const updateData = {
      checkInDate: '2025-04-02',
      checkOutDate: '2025-04-07',
      guests: 3
    };

    const response = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(bookingId);
    expect(response.body.guests).toBe(3);
    
    // Vérifier que les dates ont été mises à jour
    const checkInDate = new Date(response.body.checkInDate);
    const checkOutDate = new Date(response.body.checkOutDate);
    
    expect(checkInDate.toISOString().split('T')[0]).toBe('2025-04-02');
    expect(checkOutDate.toISOString().split('T')[0]).toBe('2025-04-07');
  });

  // Test d'erreur - tentative de mise à jour d'une réservation inexistante
  test('Devrait renvoyer une erreur 404 pour une réservation inexistante', async () => {
    const fakeBookingId = new mongoose.Types.ObjectId();
    
    const response = await request(app)
      .put(`/api/bookings/${fakeBookingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ guests: 4 });

    expect(response.status).toBe(404);
    expect(response.body.message).toContain('non trouvée');
  });

  // Test d'erreur - tentative de création d'une réservation sans données requises
  test('Devrait renvoyer une erreur 400 pour une réservation incomplète', async () => {
    const incompleteData = {
      hotel: hotelId,
      // checkInDate et checkOutDate manquants
      guests: 2
    };

    const response = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .send(incompleteData);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Tous les champs sont obligatoires');
  });

  // Test de suppression d'une réservation
  test('Devrait supprimer une réservation', async () => {
    const response = await request(app)
      .delete(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('supprimée avec succès');

    // Vérifier que la réservation a bien été supprimée
    const booking = await Booking.findById(bookingId);
    expect(booking).toBeNull();
  });
});