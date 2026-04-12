import 'dotenv/config';
import express, { Request, Response } from "express";
import { connectDB } from "./db/db";
import { userRoute } from "./routes/userRoute";
import cors from 'cors';
// import cookieParser from "cookie-parser";
import cookieParser from "cookie-parser";

const PORT = process.env.PORT || 8080;
const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

connectDB(process.env.DB_URI || "");

app.use(cors({
  origin: 'http://localhost:5173', // Your React/Vite dev server URL
  credentials: true                // Required if you use cookies/sessions
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});
app.use("/auth", userRoute);

app.listen(PORT, () => console.log(`listening on PORT - ${PORT}`));