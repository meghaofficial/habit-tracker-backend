import { Router } from "express";
import { isAuthorized } from "../middlewares/authMiddleware";
import {
  createRoadmapItem,
  deleteRoadmapItem,
  getCategories,
  getFullRoadmapByID,
  getRoadmapByID,
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

router.get("/roadmaps/categories", getCategories);

router.route("/roadmaps/:id").get(getRoadmapByID).delete(deleteRoadmapItem);

router.get("/roadmaps/:id/full", getFullRoadmapByID);

export const roadmapRoute = router;
