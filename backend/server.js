const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { connectDB } = require('./config/db');

// Charger la configuration Swagger
const swaggerDocument = YAML.load('./swagger.yaml');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Documentation Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Connexion DB
connectDB();

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('✅ Connecté à MongoDB'))
.catch(err => console.log('❌ Erreur MongoDB:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/users',require("./routes/users"));
app.use('/api/bookings', require('./routes/bookings'));

// Serveur
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`🚀 Serveur démarré sur le port ${PORT}`));
}

module.exports = app;