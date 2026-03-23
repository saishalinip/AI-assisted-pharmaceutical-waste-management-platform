import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import classifyRoute from "./routes/classify";
import geocodeRoute from "./routes/geocode";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/classify", classifyRoute);
app.use("/api/geocode", geocodeRoute);



const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
