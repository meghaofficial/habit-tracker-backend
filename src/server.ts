import "dotenv/config";
import express, { Request, Response } from "express";
import { connectDB } from "./db/db";
import { userRoute } from "./modules/auth/auth.routes";
import { planRoute } from "./modules/plan/plan.routes";
import { subsRoute } from "./modules/subscription/subscription.routes";
import { dashboardRoute } from "./modules/dashboard/dashboard.routes";
import { dateLogRoute } from "./modules/datelog/datelog.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { analysisRoute } from "./modules/analysis/analysis.routes";
import http from "http";
import { initSocket } from "./socket/socket";
import { otpRoute } from "./modules/otp/otp.routes";
import { calandarRoute } from "./modules/calander/calander.routes";
import { historyRoute } from "./modules/history/history.routes";
import "./config/webPush";
import { roadmapRoute } from "./modules/roadmap/roadmap.routes";

const PORT = process.env.PORT || 8080;
const app = express();

const server = http.createServer(app);
initSocket(server);

await connectDB(process.env.DB_URI || "");

app.use(
  cors({
    origin: "http://localhost:5173", // Your React/Vite dev server URL
    credentials: true, // Required if you use cookies/sessions
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  return res.send("Hello");
});
app.use("/auth", [userRoute, otpRoute]);
app.use("/auth/api", [
  planRoute,
  subsRoute,
  dashboardRoute,
  dateLogRoute,
  analysisRoute,
  calandarRoute,
  historyRoute,
  roadmapRoute,
]);

server.listen(PORT, () => {
  console.log(`listening on PORT - ${PORT}`);
});
