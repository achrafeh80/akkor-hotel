const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");
const Hotel = require("../models/Hotel");
const jwt = require("jsonwebtoken");

describe("Tests Gestion Hôtels", () => {
  let adminToken;
  let hotelId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/test-hotels");
    
    // Nettoyer la base de données avant les tests
    await User.deleteMany({});
    await Hotel.deleteMany({});
    
    // Créer un utilisateur admin pour les tests
    const adminUser = new User({
      email: "admin@test.com",
      pseudo: "AdminUser",
      password: await require("bcryptjs").hash("adminpass", 10),
      isAdmin: true  // S'assurer que l'utilisateur est admin
    });
    
    await adminUser.save();
    
    // Générer un token valide pour l'admin
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || "secret_for_test");
    
    // Créer un hôtel test (pour que la liste ne soit pas vide)
    const testHotel = new Hotel({
      name: "Hôtel de Test",
      location: "Test City",
      description: "Un hôtel pour les tests",
      price: 100,
      rating: 4.5
    });
    
    await testHotel.save();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Hotel.deleteMany({});
    await mongoose.connection.close();
  });

  it("Créer un hôtel (Admin)", async () => {
    const res = await request(app)
      .post("/api/hotels")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Nouvel Hôtel",
        location: "Paris",
        description: "Un superbe hôtel",
        price: 150,
        rating: 4.7
      });

    expect(res.statusCode).toBe(201);
    expect(res.body._id).toBeDefined();
    hotelId = res.body._id;
  });

  it("Lire la liste des hôtels", async () => {
    const res = await request(app).get("/api/hotels");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("Mettre à jour un hôtel (Admin)", async () => {
    const res = await request(app)
      .put(`/api/hotels/${hotelId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ description: "Description mise à jour" });

    expect(res.statusCode).toBe(200);
    expect(res.body.description).toBe("Description mise à jour");
  });

  it("Supprimer un hôtel (Admin)", async () => {
    const res = await request(app)
      .delete(`/api/hotels/${hotelId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
  });
});