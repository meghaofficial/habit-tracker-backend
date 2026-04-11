import 'dotenv/config';
import express, { Request, Response } from "express";
import { connectDB } from "./db/db";
import { userRoute } from "./routes/userRoute";

const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB(process.env.DB_URI || "");

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});
app.use("/auth", userRoute);

app.listen(PORT, () => console.log(`listening on PORT - ${PORT}`));