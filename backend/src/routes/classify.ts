import { Router } from "express";
import type { Request, Response } from "express";
import { upload } from "../utils/upload";
import { classifyImage } from "../services/roboflow";
import path from "path";

const router = Router();

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      // 🔥 FIX: Use absolute path
      const imagePath = path.resolve(req.file.path);

      console.log("Image path:", imagePath);

      const result = await classifyImage(imagePath);

      res.json(result);

    } catch (error) {
      console.error("Classification error:", error);
      res.status(500).json({ error: "Classification failed" });
    }
  }
);

export default router;