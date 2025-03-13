// bcrypt-test.js
const bcrypt = require('bcryptjs');

// Fonction pour tester bcrypt
async function testBcryptFunctionality() {
  try {
    const testPassword = 'password123';
    
    // Générer un hash
    console.log('Génération du hash...');
    const hash = await bcrypt.hash(testPassword, 10);
    console.log(`Hash généré: ${hash}`);
    
    // Vérifier avec le mot de passe correct
    console.log('Vérification avec mot de passe correct...');
    const correctMatch = await bcrypt.compare(testPassword, hash);
    console.log(`Résultat (correct): ${correctMatch}`);
    
    // Vérifier avec un mauvais mot de passe
    console.log('Vérification avec mauvais mot de passe...');
    const wrongMatch = await bcrypt.compare('wrongpassword', hash);
    console.log(`Résultat (incorrect): ${wrongMatch}`);
    
    return { hash, correctMatch, wrongMatch };
  } catch (error) {
    console.error('Erreur dans le test bcrypt:', error);
    throw error;
  }
}

// Tests avec Jest
describe('Tests de fonctionnalité bcrypt', () => {
  it('devrait correctement hacher et vérifier un mot de passe', async () => {
    const testPassword = 'password123';
    
    // Générer un hash
    console.log('Génération du hash...');
    const hash = await bcrypt.hash(testPassword, 10);
    console.log(`Hash généré: ${hash}`);
    
    // Vérifier que le hash ne contient pas le mot de passe en clair
    expect(hash).not.toContain(testPassword);
    
    // Vérifier avec le mot de passe correct
    console.log('Vérification avec mot de passe correct...');
    const correctMatch = await bcrypt.compare(testPassword, hash);
    console.log(`Résultat (correct): ${correctMatch}`);
    expect(correctMatch).toBe(true);
    
    // Vérifier avec un mauvais mot de passe
    console.log('Vérification avec mauvais mot de passe...');
    const wrongMatch = await bcrypt.compare('wrongpassword', hash);
    console.log(`Résultat (incorrect): ${wrongMatch}`);
    expect(wrongMatch).toBe(false);
  });

  it('devrait générer des hashs différents pour le même mot de passe', async () => {
    const testPassword = 'password123';
    
    // Générer deux hashs pour le même mot de passe
    const hash1 = await bcrypt.hash(testPassword, 10);
    const hash2 = await bcrypt.hash(testPassword, 10);
    
    console.log(`Hash 1: ${hash1}`);
    console.log(`Hash 2: ${hash2}`);
    
    // Vérifier que les hashs sont différents
    expect(hash1).not.toBe(hash2);
    
    // Vérifier que les deux hashs fonctionnent avec le mot de passe
    const match1 = await bcrypt.compare(testPassword, hash1);
    const match2 = await bcrypt.compare(testPassword, hash2);
    
    expect(match1).toBe(true);
    expect(match2).toBe(true);
  });

  it('devrait fonctionner avec des mots de passe complexes', async () => {
    const complexPassword = '!@#$%^&*()_+{}:"<>?~1234567890abcDEF';
    
    const hash = await bcrypt.hash(complexPassword, 10);
    const match = await bcrypt.compare(complexPassword, hash);
    
    expect(match).toBe(true);
  });
});

// Exécuter la fonction directement si le script est lancé en dehors de Jest
if (process.env.NODE_ENV !== 'test') {
  testBcryptFunctionality()
    .then(result => {
      console.log('Test bcrypt terminé:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('Erreur lors du test:', err);
      process.exit(1);
    });
}

module.exports = { testBcryptFunctionality };