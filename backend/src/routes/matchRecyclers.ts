import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "../firebase"; // adjust path if needed
import { calculateDistance } from "../utils/haversine";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { material, latitude, longitude } = req.body;

    if (!material || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        error: "Material, latitude and longitude are required",
      });
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({
        error: "Invalid latitude or longitude",
      });
    }

    // 1️⃣ Fetch recyclers
    const snapshot = await db.collection("recyclers").get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: "No recyclers found",
      });
    }

    const matches: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Only verified recyclers
      if (data.role !== "recycler") return;
      if (data.verificationStatus !== "approved") return;

      // Check material match
      if (
        Array.isArray(data.materialsProcessed) &&
        data.materialsProcessed.includes(material)
      ) {
        const distance = calculateDistance(
          userLat,
          userLng,
          data.latitude,
          data.longitude
        );

        matches.push({
          id: doc.id,
          organizationName: data.organizationName,
          city: data.city,
          state: data.state,
          distance_km: Number(distance.toFixed(2)),
          materialPricing: data.materialPricing || [],
        });
      }
    });

    // 2️⃣ Sort by nearest
    matches.sort((a, b) => a.distance_km - b.distance_km);

    return res.json({
      material,
      totalMatches: matches.length,
      matches,
    });

  } catch (error) {
    console.error("Match recyclers error:", error);
    return res.status(500).json({
      error: "Failed to find matching recyclers",
    });
  }
});

export default router;