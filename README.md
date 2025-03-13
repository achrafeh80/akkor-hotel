# 🏨 Akkor Hotel - Booking System

## 📌 1️⃣ Introduction
**Akkor Hotel** est une application permettant la réservation d’hôtels en ligne.  
Elle permet aux utilisateurs de **réserver des hôtels**, **gérer leur compte**, et aux administrateurs de **gérer les hôtels et réservations**.

---

## **📌 2️⃣ Installation**
### **🔹 2.1 Prérequis**
Avant de commencer, assure-toi d’avoir installé :
- **Node.js** ≥ 16.x
- **MongoDB** (Installé et en cours d’exécution)
- **NPM** ou **Yarn**

---

### **🔹 2.2 Cloner le projet**
Dans un **terminal**, exécute :
```sh
git clone https://github.com/ton-projet/akkor-hotel.git
cd akkor-hotel
```

---

### **🔹 2.3 Configuration de l’environnement**
Renomme le fichier **`.env.example`** en **`.env`** et configure la connexion à MongoDB.

#### **Exemple de fichier `.env`** :
```env
MONGO_URI=mongodb://localhost:27017/akkor-hotel
JWT_SECRET=supersecret
```

📌 **Si tu utilises une base de données distante, remplace `localhost` par l’URL de ta base MongoDB.**

---

### **🔹 2.4 Installation des dépendances**
Installe les **packages nécessaires** pour le **backend** et le **frontend**.

```sh
cd backend && npm install
cd ../frontend && npm install
```

---

## **📌 3️⃣ Démarrage du projet**
### **🔹 3.1 Lancer MongoDB**
Avant de démarrer l’application, assure-toi que **MongoDB est bien en cours d’exécution**.

Si MongoDB tourne en local :
```sh
mongod
```

---

### **🔹 3.2 Démarrer le backend**
Lance le **serveur Node.js** depuis le dossier `backend` :
```sh
cd backend
npm start
```
Le backend sera accessible sur **`http://localhost:5000`**.

---

### **🔹 3.3 Démarrer le frontend**
Dans un **nouveau terminal**, exécute :
```sh
cd frontend
npm start
```
L’application sera accessible sur **`http://localhost:3000`**.

---

## **📌 4️⃣ API Documentation (Swagger)**
La documentation de l’API est disponible via **Swagger**.

### **🔹 Accéder à la documentation**
1. **Démarrer le backend** (`npm start`)
2. **Ouvrir le lien Swagger dans un navigateur** :
   ```sh
   http://localhost:5000/api/docs
   ```
3. **Tester les routes API directement depuis Swagger.**

📌 **Si tu veux valider ton fichier Swagger (`swagger.yaml`), ouvre** [Swagger Editor](https://editor.swagger.io/).

---

## **📌 5️⃣ Tests Unitaires**
Avant la soumission, **vérifie que les tests passent**.

### **🔹 Exécuter les tests backend**
```sh
cd backend
npm test
```

✅ **Tous les tests doivent être "verts" (`PASS`) avant l’envoi.**


🎉 **Bonne utilisation d'Akkor Hotel !** 🚀
