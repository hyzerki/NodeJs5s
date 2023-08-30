import { Router } from "express";
import commitsController from "../controllers/commitsController.js";
const router = Router({mergeParams: true});
//todo пофиксить роуты 
router.get("/", commitsController.getCommitsByRepoId);
router.get("/:commitId", commitsController.getCommitByRepoIdAndCommitId);
router.post("/", commitsController.createCommit);
router.put("/:commitId", commitsController.updateCommit);
router.delete("/:commitId", commitsController.deleteCommit);
export default router;