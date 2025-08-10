import express from "express";
import cors from "cors";
const app = express();

app.use(cors()); // Autorise toutes les origines

app.get("/api/posts", (req, res) => {
  res.json([{ id: 1, title: "Premier post" }]);
});

app.listen(3000, () => {
  console.log("API server running on http://localhost:3000");
});
