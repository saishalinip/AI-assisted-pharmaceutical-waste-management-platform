import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import MaterialBadge from "@/components/shared/MaterialBadge";
import { MaterialClassification } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  ArrowRight,
  Info,
  Loader2,
  CheckCircle,
} from "lucide-react";

const WasteUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationProgress, setClassificationProgress] = useState(0);
  const [classificationResult, setClassificationResult] =
    useState<MaterialClassification[] | null>(null);

  // ----------------------------
  // Image Handling
  // ----------------------------
  const addImages = useCallback(
    (files: File[]) => {
      const newImages = [...images, ...files].slice(0, 5);
      setImages(newImages);

      const newPreviews = newImages.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return newPreviews;
      });

      setClassificationResult(null);
    },
    [images]
  );

  const handleImageDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      addImages(files);
    },
    [addImages]
  );

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setClassificationResult(null);
  };

  // ----------------------------
  // Classification (REAL BACKEND CALL)
  // ----------------------------
  const handleClassify = async () => {
    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image.",
        variant: "destructive",
      });
      return;
    }

    setIsClassifying(true);
    setClassificationProgress(0);

    const progressInterval = setInterval(() => {
      setClassificationProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("image", images[0]); // backend supports single image

      const response = await fetch(
        "http://localhost:5000/api/classify",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      clearInterval(progressInterval);
      setClassificationProgress(100);

      // Map backend response to UI format
      const mappedResult: MaterialClassification[] = [
        {
          type: data.material,  // ✅ USE BASE MATERIAL
          confidence: Math.round(data.confidence * 100),
          isPrimary: true,
        },
      ];


      setTimeout(() => {
        setClassificationResult(mappedResult);
        setIsClassifying(false);

        toast({
          title: "Classification Complete",
          description: "Material type identified successfully.",
        });
      }, 300);

    } catch (error) {
      clearInterval(progressInterval);
      setIsClassifying(false);

      toast({
        title: "Classification Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // ----------------------------
  // Proceed
  // ----------------------------
  const handleProceed = () => {
    if (!classificationResult) return;

    const primaryMaterial = classificationResult.find(
      (m) => m.isPrimary
    );

    if (!primaryMaterial) {
      toast({
        title: "No Primary Material",
        description: "Unable to determine primary material.",
        variant: "destructive",
      });
      return;
    }

    navigate("/manufacturer/recyclers", {
      state: {
        wasteType: primaryMaterial.type,
      },
    });
  };

  const primaryMaterial = classificationResult?.find((m) => m.isPrimary);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Upload Waste for Classification
          </h1>
          <p className="text-muted-foreground mt-1">
            Identify the type of pharmaceutical waste using AI
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border p-6 shadow-card">
              <Label className="text-base font-medium mb-4 block">
                Waste Images
              </Label>

              <div
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50"
              >
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    addImages(Array.from(e.target.files || []))
                  }
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">
                    Drag & drop images or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Max 5 images (PNG, JPG)
                  </p>
                </label>
              </div>

              {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Upload ${index + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleClassify}
              disabled={images.length === 0 || isClassifying}
              size="lg"
              className="w-full gap-2"
            >
              {isClassifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Identifying Material...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Identify Material
                </>
              )}
            </Button>

            {isClassifying && (
              <div className="space-y-2">
                <Progress value={classificationProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  Analyzing image with AI model...
                </p>
              </div>
            )}
          </div>

          {/* Result Section */}
          <div className="space-y-6">
            <div
              className={`bg-card rounded-xl border p-6 shadow-card ${
                classificationResult ? "opacity-100" : "opacity-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">
                  Identified Material Type(s)
                </h3>
              </div>

              {classificationResult ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {classificationResult.map((material, index) => (
                      <MaterialBadge
                        key={index}
                        material={material.type}
                        showConfidence
                        confidence={material.confidence}
                        isPrimary={material.isPrimary}
                        size="lg"
                      />
                    ))}
                  </div>

                  {primaryMaterial && (
                    <div className="p-4 rounded-lg bg-primary/5 border">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          Primary Material
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        {primaryMaterial.type}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 p-3 rounded-lg bg-muted text-sm">
                    <Info className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      Identification is based on image analysis and may
                      require verification.
                    </p>
                  </div>

                  <Button
                    onClick={handleProceed}
                    size="lg"
                    className="w-full gap-2"
                  >
                    Find Matching Recyclers
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    Upload images and identify material to continue
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WasteUploadPage;
