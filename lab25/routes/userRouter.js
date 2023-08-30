import { Router } from "express";
import userController from "../controllers/userController.js";
const router = Router({mergeParams: true});

router.get("/", userController.getUsers);
router.get("/:userId", userController.getUserById);
export default router;