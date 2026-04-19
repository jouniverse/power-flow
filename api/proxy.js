module.exports = async function handler(req, res) {
  const API_KEY = process.env.FINGRID_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "FINGRID_API_KEY not configured" });
  }

  // The original path comes via the _proxyPath query param (set by vercel.json rewrite)
  const proxyPath = req.query._proxyPath || "";
  // Rebuild query string without our internal param
  const params = { ...req.query };
  delete params._proxyPath;
  const qs = new URLSearchParams(params).toString();
  const upstreamURL = `https://data.fingrid.fi/api/${proxyPath}${qs ? "?" + qs : ""}`;

  try {
    const response = await fetch(upstreamURL, {
      headers: {
        "x-api-key": API_KEY,
        "Cache-Control": "no-cache",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    res.setHeader("Content-Type", contentType);
    res.status(response.status).send(await response.text());
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(502).json({ error: "Failed to fetch from Fingrid API" });
  }
};
