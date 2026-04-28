import 'dotenv/config';
import express, { Request, Response } from "express";
import { connectDB } from "./db/db";
import { userRoute } from "./routes/authRoute";
import { planRoute } from "./routes/planRoute";
import { subsRoute } from './routes/subscriptionRoute';
import { dashboardRoute } from './routes/dashboardRoute';
import cors from 'cors';
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 8080;
const app = express();

const startServer = async () => {
  try {
    // 1. Wait for DB first
    await connectDB(process.env.DB_URI || "");

    // 2. Setup Middleware & Routes
    app.use(cors({
      origin: 'http://localhost:5173',
      credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get('/', (req, res) => res.send('Hello'));
    app.use("/auth", userRoute);
    app.use("/auth/api", [planRoute, subsRoute, dashboardRoute]);

    // 3. Start Listening
    app.listen(PORT, () => console.log(`🚀 listening on PORT - ${PORT}`));

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// connectDB(process.env.DB_URI || "");

// app.use(cors({
//   origin: 'http://localhost:5173', // Your React/Vite dev server URL
//   credentials: true                // Required if you use cookies/sessions
// }));
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello');
// });
// app.use("/auth", userRoute);
// app.use("/auth/api", [planRoute, subsRoute, dashboardRoute]);

// app.listen(PORT, () => console.log(`listening on PORT - ${PORT}`));