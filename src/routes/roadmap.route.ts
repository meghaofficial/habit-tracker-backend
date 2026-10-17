import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware";
import {
  createRoadmapItem,
  deleteRoadmapItem,
  getRoadmapList,
  updateRoadmapItem,
} from "../controllers/roadmap.controller";

const router = Router();

router.use(isAuthorized);

router
  .route("/roadmaps")
  .get(getRoadmapList)
  .post(createRoadmapItem)
  .put(updateRoadmapItem);

router.delete("/roadmaps/:id", deleteRoadmapItem);

export const roadmapRoute = router;
