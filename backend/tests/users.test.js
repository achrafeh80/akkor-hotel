const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server"); 
const User = require("../models/User");
const Booking = require("../models/Booking");
const jwt = require("jsonwebtoken");

let token;
let userId;

// Avant chaque test, on initialise la base de données
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test", {

  });

  // Création d'un utilisateur de test
  const user = await User.create({
    email: "test@example.com",
    pseudo: "TestUser",
    password: "testpassword",
  });

  userId = user._id;

  // Générer un token JWT
  token = jwt.sign({ id: userId }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
});

// Après chaque test, on supprime les données de test
afterAll(async () => {
  await User.deleteMany();
  await Booking.deleteMany();
  await mongoose.connection.close();
});

// Test de mise à jour du profil utilisateur
test("PUT /api/users/update - Mettre à jour le profil", async () => {
  const res = await request(app)
    .put("/api/users/update")
    .set("Authorization", `Bearer ${token}`)
    .send({ email: "newemail@example.com", pseudo: "NewPseudo" });

  expect(res.statusCode).toBe(200);
  expect(res.body.user.email).toBe("newemail@example.com");
  expect(res.body.user.pseudo).toBe("NewPseudo");
});

// Test de suppression du compte utilisateur
test("DELETE /api/users/delete - Supprimer le compte", async () => {
  const res = await request(app)
    .delete("/api/users/delete")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe("Compte supprimé avec succès");

  // Vérifier que l'utilisateur n'existe plus dans la base de données
  const deletedUser = await User.findById(userId);
  expect(deletedUser).toBeNull();
});
