const express = require("express");
const companyController = require("../controllers/companyController");
const router = express.Router();

router.get("/", companyController.get);
router.get("/:id", companyController.get_id);
router.post("/", companyController.post);
router.put("/:id", companyController.put);
router.delete("/:id", companyController.delete);

module.exports = router;