require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3002;
const API_KEY = process.env.FINGRID_API_KEY;

if (!API_KEY) {
  console.error(
    "FINGRID_API_KEY is not set. Create a .env file with FINGRID_API_KEY=<your_key>"
  );
  process.exit(1);
}

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Proxy route: /api/* -> https://data.fingrid.fi/api/*
app.get("/api/{*path}", async (req, res) => {
  // Build upstream URL from the original request URL
  const upstreamURL = `https://data.fingrid.fi${req.originalUrl}`;

  try {
    const response = await fetch(upstreamURL, {
      headers: {
        "x-api-key": API_KEY,
        "Cache-Control": "no-cache",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    res.status(response.status).set("Content-Type", contentType);

    const body = await response.text();
    res.send(body);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({ error: "Failed to fetch from Fingrid API" });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Power Flow server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/dashboard.html`);
});
