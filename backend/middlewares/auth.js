const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier si un utilisateur est authentifié
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token invalide." });
  }
};

// Middleware pour vérifier si un utilisateur est admin
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.role !== 'admin' && !user.isAdmin) return res.status(403).json({ message: "Accès refusé. Admin requis." });

    next();
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Middleware pour vérifier si un utilisateur est admin ou employé
const verifyEmployee = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!['admin'].includes(user.role && !user.isAdmin)) {
      return res.status(403).json({ message: "Accès refusé. Admin requis." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Middleware pour vérifier si un utilisateur modifie son propre compte ou si c'est un admin
const verifySelfOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.user.id !== req.params.id && user.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé. Vous ne pouvez modifier que votre propre compte." });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = { verifyToken, verifyAdmin, verifyEmployee, verifySelfOrAdmin };
