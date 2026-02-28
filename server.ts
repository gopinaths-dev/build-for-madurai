import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Leaderboard Data
  const leaderboard = [
    { id: 1, name: "Arun", points: 450, rank: 1 },
    { id: 2, name: "Meena", points: 420, rank: 2 },
    { id: 3, name: "Karthik", points: 380, rank: 3 },
    { id: 4, name: "Selvi", points: 310, rank: 4 },
    { id: 5, name: "Vijay", points: 290, rank: 5 },
  ];

  let classTotal = 850;

  // API Routes
  app.get("/api/leaderboard", (req, res) => {
    res.json({
      students: leaderboard,
      classTotal,
      threshold: 1000,
      reward: "Tree Planting Day 🎉"
    });
  });

  app.post("/api/score", async (req, res) => {
    const { score, category, message, studentName } = req.body;
    
    // Update class total if score is positive
    if (score > 0) classTotal += score;

    // Optional: Forward to external API if configured
    const externalApiUrl = (process.env.EXTERNAL_API_URL || "").replace(/\/$/, "");
    if (externalApiUrl) {
      try {
        await fetch(`${externalApiUrl}/api/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(req.body),
        });
      } catch (err) {
        console.error("Failed to forward score to external API:", err);
      }
    }

    res.json({
      score,
      category,
      message,
      badgeUnlocked: score > 0 && Math.random() > 0.7 // Randomly unlock badge for demo
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Green Madurai Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
