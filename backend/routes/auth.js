const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const { verifyToken } = require("../middlewares/auth");

router.post('/register', async (req, res) => {
  const { email, pseudo, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Créer un nouvel utilisateur
    user = new User({
      email,
      pseudo,
      password // Le hachage sera géré par le middleware pre-save du modèle User
    });

    // Sauvegarder l'utilisateur
    await user.save();
    
    // Créer et retourner un token JWT
    const payload = {
      id: user.id
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_for_tests',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user.id, email, pseudo } });
      }
    );
  } catch (err) {
    console.error('Erreur lors de l\'inscription:', err.message);
    res.status(500).send('Erreur serveur');
  }
});


// Connexion
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Utiliser directement la méthode bcrypt.compare

    const isMatch = await user.matchPassword(password);

    
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Créer et renvoyer le token
    const payload = { id: user.id };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret_for_tests',
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, user: { id: user.id, email, pseudo: user.pseudo } });
      }
    );
  } catch (err) {
    console.error('Erreur lors de la connexion:', err.message);
    res.status(500).send('Erreur serveur');
  }
});

// Récupérer l'utilisateur connecté
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Erreur serveur");
  }
});

// ✏️ Mettre à jour un utilisateur (seulement soi-même ou admin)
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { email, pseudo } = req.body;

    // Vérification de l'unicité de l'email
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email, pseudo },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: 'Profil mis à jour avec succès', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;