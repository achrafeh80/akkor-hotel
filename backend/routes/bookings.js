const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// 🔍 Lire toutes les réservations (admin seulement)
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user', 'email pseudo').populate('hotel', 'name location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 🔍 Lire les réservations de l'utilisateur connecté
router.get('/mybookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('hotel', 'name location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ➕ Créer une réservation
router.post('/', verifyToken, async (req, res) => {
  const { hotel, checkInDate, checkOutDate, guests } = req.body;

  // Vérification des données
  if (!hotel || !checkInDate || !checkOutDate || !guests) {
    console.log('❌ Erreur: Champs manquants', req.body);
    return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
  }

  try {
    console.log('✅ Tentative de réservation avec:', req.body);

    const newBooking = new Booking({
      user: req.user.id,
      hotel,
      checkInDate,
      checkOutDate,
      guests
    });

    await newBooking.save();
    console.log('✅ Réservation créée:', newBooking);

    res.status(201).json(newBooking);
  } catch (err) {
    console.error('❌ Erreur lors de la création de réservation:', err.message);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// ✏️ Mettre à jour une réservation (l'utilisateur ne peut modifier que ses réservations)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Réservation non trouvée' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour de la réservation' });
  }
});

// ❌ Supprimer une réservation
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Réservation non trouvée' });
    if (booking.user.toString() !== req.user.id) return res.status(403).json({ message: 'Accès refusé' });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Réservation supprimée avec succès' });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors de la suppression de la réservation' });
  }
});

module.exports = router;
