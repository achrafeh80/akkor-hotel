const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const { connectDB } = require('./config/db');


// Charger les variables d’environnement
dotenv.config();

// ✅ Définition de l'application AVANT d'utiliser `app.use()`
const app = express();

// Middleware pour traiter les JSON et gérer le CORS
app.use(express.json());
app.use(cors());

connectDB();

// ✅ Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.log('❌ Erreur MongoDB:', err));

// ✅ Définition des routes APRES la création de `app`
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/users',require("./routes/users"));
app.use('/api/bookings', require('./routes/bookings'));

// ✅ Lancer le serveur
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
}

module.exports = app;