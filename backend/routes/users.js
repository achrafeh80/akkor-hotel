const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const { verifyToken,verifyEmployee } = require('../middlewares/auth');

// 📌 Lire son propre profil
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📌 Lire l’historique des réservations de l'utilisateur
router.get('/mybookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('hotel', 'name location');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// 📌 Lire un utilisateur spécifique (seulement un employé ou admin)
router.get('/:id', verifyToken, verifyEmployee, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ➕ Créer un utilisateur (sans connexion requise)
router.post('/', async (req, res) => {
  const { email, pseudo, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    user = new User({ email, pseudo, password });
    await user.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✏️ Mettre à jour un utilisateur (seulement soi-même ou admin)
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { email, pseudo } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email, pseudo },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: 'Profil mis à jour avec succès', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ❌ Supprimer son propre compte
router.delete('/delete', verifyToken, async (req, res) => {
  try {
    // Supprimer toutes les réservations associées à l'utilisateur
    await Booking.deleteMany({ user: req.user.id });

    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
