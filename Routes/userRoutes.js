const express = require("express");
const authController = require("../Controllers/authController");
const userController = require("../Controllers/userController");
const queryRoutes = express.Router();

queryRoutes.post("/register", authController.signup);
queryRoutes.post("/login", authController.login);

queryRoutes.use(authController.protect());

queryRoutes.get("/admins", userController.getAllAdmins);
queryRoutes.post("/upload", userController.uploadAssignment);

module.exports = queryRoutes;
