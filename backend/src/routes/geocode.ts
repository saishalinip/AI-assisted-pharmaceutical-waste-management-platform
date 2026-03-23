import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const address = req.query.address as string;

    if (!address || address.trim() === "") {
      return res.status(400).json({ error: "Address is required" });
    }

    console.log("🔍 Geocoding:", address);

    const response = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: address,
          key: process.env.OPENCAGE_API_KEY,
          limit: 1,
        },
        timeout: 10000,
      }
    );

    if (!response.data.results.length) {
      return res.status(404).json({ error: "Location not found" });
    }

    const location = response.data.results[0].geometry;

    return res.json({
      latitude: location.lat,
      longitude: location.lng,
    });

  } catch (error: any) {
    console.error("❌ Geocode error:", error.message);
    return res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;