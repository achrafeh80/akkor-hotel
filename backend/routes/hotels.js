const express = require("express");
const router = express.Router();
const Hotel = require("../models/Hotel");
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

// Obtenir tous les hôtels (public)
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Obtenir un hôtel par ID (public)
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hôtel non trouvé" });
    
    res.json(hotel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Créer un nouvel hôtel (admin seulement)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const newHotel = new Hotel(req.body);
    const hotel = await newHotel.save();
    
    res.status(201).json(hotel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Mettre à jour un hôtel (admin seulement)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!hotel) return res.status(404).json({ message: "Hôtel non trouvé" });
    
    res.json(hotel);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// Supprimer un hôtel (admin seulement)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: "Hôtel non trouvé" });
    
    res.json({ message: "Hôtel supprimé avec succès" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

module.exports = router;