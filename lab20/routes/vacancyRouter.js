const express = require("express");
const vacancyController = require("../controllers/vacancyController");
const router = express.Router();

router.get("/", vacancyController.get);
router.get("/:id", vacancyController.get_id);
router.post("/", vacancyController.post);
router.put("/:id", vacancyController.put);
router.delete("/:id", vacancyController.delete);

module.exports = router;