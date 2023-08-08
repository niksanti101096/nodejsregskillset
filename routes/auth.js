const express = require("express");
const router = express.Router();

const registrationController = require("../controller/authAccount");

router.post("/register", registrationController.register);

router.post("/login", registrationController.login);

router.get("/updateform/:email", registrationController.updateform); // add colon (:) to get the value 

router.post("/updateuser", registrationController.updateuser);

router.get("/deleteusernotif/:email", registrationController.deleteusernotif);

router.get("/logout", registrationController.logout);

router.get("/skillset/:email", registrationController.skillset);

router.get("/gobacklistaccounts", registrationController.gobacklistaccounts);

module.exports = router;
