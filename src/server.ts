import 'dotenv/config';
import express, { Request, Response } from "express";
import { connectDB } from "./db/db";
import { userRoute } from "./routes/authRoute";
import { planRoute } from "./routes/planRoute";
import { subsRoute } from './routes/subscriptionRoute';
import { dashboardRoute } from './routes/dashboardRoute';
import { dateLogRoute } from './routes/dateRoute';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { analysisRoute } from './routes/analysisRoute';
import http from "http";
import { initSocket } from "./socket/socket";

const PORT = process.env.PORT || 8080;
const app = express();

const server = http.createServer(app);
initSocket(server);

await connectDB(process.env.DB_URI || "");

app.use(cors({
  origin: 'http://localhost:5173', // Your React/Vite dev server URL
  credentials: true                // Required if you use cookies/sessions
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (res: Response) => {
  res.send('Hello');
});
app.use("/auth", userRoute);
app.use("/auth/api", [planRoute, subsRoute, dashboardRoute, dateLogRoute, analysisRoute]);

server.listen(PORT, () => {
  console.log(`listening on PORT - ${PORT}`);
});

// app.listen(PORT, () => console.log(`listening on PORT - ${PORT}`));