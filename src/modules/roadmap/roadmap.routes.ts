import { Router } from "express";
import { createRoadmap, getRoadmaps } from "./roadmap.controller";
import { isAuthorized } from "../../shared/middlewares/auth.middleware";
import upload from "../../shared/middlewares/upload.middleware";
const router = Router();

router
  .route("/roadmap")
  .post(isAuthorized, upload.single("iconFile"), createRoadmap)
  .get(isAuthorized, getRoadmaps);

export const roadmapRoute = router;
