require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Endpoint to get AI-powered recommendations
app.get("/api/recommendations", async (req, res) => {
  try {
    const query = req.query.item; // Item name from frontend
    if (!query)
      return res.status(400).json({ error: "Item query is required" });

    // Fetch from Cloudflare API
    const message = {
      messages: [
        {
          role: "system",
          content:
            "You are a shopping assistant. Your response MUST follow this format exactly:\n\n1. Item - Reason\n2. Item - Reason\n3. Item - Reason\n\nNo extra text, greetings, or explanations outside this format.",
        },
        {
          role: "user",
          content: `Suggest 3 related items for: ${query}`,
        },
      ],
    };
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT}/ai/run/@cf/meta/llama-2-7b-chat-fp16`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
        method: "POST",
        body: JSON.stringify(message),
      }
    );

    const data = await response.json();
    res.json(data.result.response); // Send response to frontend
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
