const express = require("express");
const preferredSkillController = require("../controllers/preferredSkillController");
const router = express.Router();

router.get("/", preferredSkillController.get);
router.get("/:id", preferredSkillController.get_id);
router.post("/", preferredSkillController.post);
router.put("/:id", preferredSkillController.put);
router.delete("/:id", preferredSkillController.delete);

module.exports = router;