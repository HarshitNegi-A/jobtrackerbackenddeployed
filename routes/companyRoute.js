const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const companyController = require("../controller/companyController");

router.post("/", auth, companyController.createCompany);
router.get("/", auth, companyController.listCompanies);
router.get("/:id", auth, companyController.getCompany);
router.put("/:id", auth, companyController.updateCompany);
router.delete("/:id", auth, companyController.deleteCompany);

module.exports = router;
