const express = require("express");
const applicationController = require("../controllers/applicationController");
const router = express.Router();

router.get("/", applicationController.get);
router.get("/:id", applicationController.get_id);
router.post("/", applicationController.post);
router.put("/:id", applicationController.put);
router.delete("/:id", applicationController.delete);

module.exports = router;