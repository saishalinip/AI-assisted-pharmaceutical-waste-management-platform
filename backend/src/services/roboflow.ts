import axios from "axios";
import fs from "fs";

function getApiKey() {
  const key = process.env.ROBOFLOW_API_KEY;
  if (!key) {
    throw new Error("ROBOFLOW_API_KEY is missing in .env");
  }
  return key;
}

function getModels(apiKey: string) {
  return {
    object: `https://classify.roboflow.com/oc-0qddb/2?api_key=${apiKey}`,
    software: `https://classify.roboflow.com/softwaste_classifier/2?api_key=${apiKey}&confidence=0.1`,
    device: `https://classify.roboflow.com/devicewaste_classifier/2?api_key=${apiKey}&confidence=0.1`,
    blister: `https://classify.roboflow.com/blister_classifier/1?api_key=${apiKey}&confidence=0.1`,
  };
}

async function runModel(imagePath: string, url: string) {
  const imageBase64 = fs.readFileSync(imagePath, {
    encoding: "base64",
  });

  const res = await axios.post(url, imageBase64, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
}

export async function classifyImage(imagePath: string) {
  const apiKey = getApiKey();
  const MODELS = getModels(apiKey);

  // 1️⃣ Run Main Object Model
  const objectResult = await runModel(imagePath, MODELS.object);
  const topPrediction = objectResult?.predictions?.[0];

  if (!topPrediction) {
    return { error: "No object detected" };
  }

  const detectedObject = topPrediction.class;
  const confidence = topPrediction.confidence;

  let detailedResult = null;
  const normalizedObject = detectedObject.toLowerCase();

  // 2️⃣ Route to Secondary Model
  if (normalizedObject.includes("blister")) {
    detailedResult = await runModel(imagePath, MODELS.blister);
  } 
  else if (normalizedObject.includes("soft")) {
    detailedResult = await runModel(imagePath, MODELS.software);
  } 
  else if (normalizedObject.includes("device")) {
    detailedResult = await runModel(imagePath, MODELS.device);
  }

  const subPrediction = detailedResult?.predictions?.[0] || null;
  const rawResult = subPrediction?.class || detectedObject;
  const normalized = rawResult.toLowerCase();

  // 🔥 MATERIAL MAPPING (Based On Your Roboflow Classes)
  let finalMaterial = rawResult;

  if (normalized.includes("syringe")) {
    finalMaterial = "Plastic";
  } 
  else if (normalized.includes("ampoule") || normalized.includes("vial")) {
    finalMaterial = "Glass";
  } 
  else if (normalized.includes("aluminium_blister")) {
    finalMaterial = "Aluminium";
  } 
  else if (normalized.includes("pvc_blister")) {
    finalMaterial = "PVC";
  } 
  else if (normalized.includes("cap_pp") || normalized.includes("shoecover_pp")) {
    finalMaterial = "PP";
  } 
  else if (normalized.includes("gloves_latex")) {
    finalMaterial = "Latex";
  } 
  else if (normalized.includes("gloves_nitrile")) {
    finalMaterial = "Nitrile";
  } 
  else if (normalized.includes("gauge_cotton")) {
    finalMaterial = "Cotton";
  }

  return {
    object: detectedObject,
    material: finalMaterial,   // ✅ IMPORTANT (Frontend uses this)
    confidence,
    subType: rawResult,
    subConfidence: subPrediction?.confidence || null,
  };
}