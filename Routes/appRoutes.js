const express = require("express");
const adminController = require("../Controllers/adminController");
const authController = require("../Controllers/authController");
const queryRoutes = express.Router();

queryRoutes.use(authController.protect("admin"));

queryRoutes.get("/", adminController.getAdminAssignment);
queryRoutes.post("/:id/accept", adminController.assignmentStatusChange("accept"));
queryRoutes.post("/:id/reject", adminController.assignmentStatusChange("reject"));

module.exports = queryRoutes;
