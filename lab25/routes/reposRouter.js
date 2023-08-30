import { Router } from "express";
import reposController from "../controllers/reposController.js";
import commitsRouter from "../routes/commitsRouter.js";
const router = Router({mergeParams: true});

router.get("/", reposController.getRepos);
router.get("/:repoId", reposController.getRepoById);
router.post("/", reposController.createRepo);
router.put("/:repoId", reposController.updateRepo);
router.delete("/:repoId", reposController.deleteRepo);
router.use("/:repoId/commits", commitsRouter);
export default router;