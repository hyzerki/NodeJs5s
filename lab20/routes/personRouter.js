const express =  require("express");
const personController = require( "../controllers/personController");
const router = express.Router();

router.get("/", personController.get);
router.get("/:id", personController.get_id);
router.post("/", personController.post);
router.put("/:id", personController.put);
router.delete("/:id", personController.delete);

module.exports = router;