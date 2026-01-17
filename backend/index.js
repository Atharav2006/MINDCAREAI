// backend/index.js
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import messageRoutes from "./routes/message.js";

// Force dotenv to load from project root
dotenv.config({ path: "C:/Users/ATHARAV/Documents/mindcare-ai/.env" });

console.log("🔑 API Key value:", process.env.OPENROUTER_API_KEY);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/message", messageRoutes);

// Debug: confirm API key is loaded


// Start server
app.listen(PORT, () => {
  console.log(`MINDCARE backend listening on ${PORT}`);
});