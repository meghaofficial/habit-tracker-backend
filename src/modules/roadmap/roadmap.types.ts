import { Types } from "mongoose";

export type RoadmapBuildType = "manual" | "ai";

export type RoadmapIconType = "url" | "upload" | "icon";

export type DurationUnit = "days" | "weeks" | "months" | "years";

export interface RoadmapIcon {
  value: string;
  icon_type: RoadmapIconType;
  s3_key?: string;
}

export interface ExpectedCompletionTime {
  value: number | null;
  unit: DurationUnit | null;
}

export interface RoadmapI {
  _id: Types.ObjectId;
  userID: Types.ObjectId;
  build: RoadmapBuildType;
  name: string;
  description: string;
  icon: RoadmapIcon;
  category: string;
  expected_completion_time: ExpectedCompletionTime;
  createdAt: Date;
  updatedAt: Date;
}
