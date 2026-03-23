import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Factory, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MATERIAL_TYPES } from "@/lib/mockData";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [manufacturerForm, setManufacturerForm] = useState({
    companyName: "",
    address: "",
    city: "",
    state: "",
    email: "",
    password: "",
  });

  const [recyclerForm, setRecyclerForm] = useState({
    organizationName: "",
    address: "",
    city: "",
    state: "",
    email: "",
    password: "",
    materials: [] as string[],
  });

  const [materialPricing, setMaterialPricing] = useState<{
    [material: string]: { minPrice: string; maxPrice: string };
  }>({});

  const [isManufacturerLoading, setIsManufacturerLoading] = useState(false);
  const [isRecyclerLoading, setIsRecyclerLoading] = useState(false);

  /* =========================
     CALL BACKEND GEOCODE
  ========================== */
  const fetchCoordinates = async (fullAddress: string) => {
    const response = await fetch(
      `http://localhost:5000/api/geocode?address=${encodeURIComponent(fullAddress)}`
    );

    if (!response.ok) {
      throw new Error("Unable to fetch location coordinates.");
    }

    return await response.json();
  };

  /* =========================
     MATERIAL TOGGLE
  ========================== */
  const handleMaterialToggle = (material: string) => {
    setRecyclerForm((prev) => {
      const selected = prev.materials.includes(material);

      return {
        ...prev,
        materials: selected
          ? prev.materials.filter((m) => m !== material)
          : [...prev.materials, material],
      };
    });

    setMaterialPricing((prev) => {
      const updated = { ...prev };
      if (updated[material]) delete updated[material];
      else updated[material] = { minPrice: "", maxPrice: "" };
      return updated;
    });
  };

  /* =========================
     MANUFACTURER SIGNUP
  ========================== */
  const handleManufacturerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsManufacturerLoading(true);

    try {
      const fullAddress = `${manufacturerForm.address}, ${manufacturerForm.city}, ${manufacturerForm.state}, India`;

      const { latitude, longitude } = await fetchCoordinates(fullAddress);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        manufacturerForm.email,
        manufacturerForm.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "manufacturers", uid), {
        ...manufacturerForm,
        location: `${manufacturerForm.city}, ${manufacturerForm.state}`,
        latitude,
        longitude,
        role: "manufacturer",
        verificationStatus: "pending",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Manufacturer Account Created" });
      navigate("/manufacturer/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsManufacturerLoading(false);
    }
  };

  /* =========================
     RECYCLER SIGNUP (STRICT)
  ========================== */
  const handleRecyclerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecyclerLoading(true);

    try {
      // 🔥 STRICT VALIDATION

      if (recyclerForm.materials.length === 0) {
        throw new Error("Select at least one material.");
      }

      for (const material of recyclerForm.materials) {
        const pricing = materialPricing[material];

        if (!pricing?.minPrice || !pricing?.maxPrice) {
          throw new Error(`Enter pricing for ${material}`);
        }

        if (Number(pricing.minPrice) > Number(pricing.maxPrice)) {
          throw new Error(
            `${material} min price cannot exceed max price`
          );
        }
      }

      const fullAddress = `${recyclerForm.address}, ${recyclerForm.city}, ${recyclerForm.state}, India`;

      const { latitude, longitude } = await fetchCoordinates(fullAddress);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        recyclerForm.email,
        recyclerForm.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "recyclers", uid), {
        organizationName: recyclerForm.organizationName,
        address: recyclerForm.address,
        city: recyclerForm.city,
        state: recyclerForm.state,
        location: `${recyclerForm.city}, ${recyclerForm.state}`,
        latitude,
        longitude,
        email: recyclerForm.email,
        role: "recycler",
        materialsProcessed: recyclerForm.materials,
        materialPricing: recyclerForm.materials.map((material) => ({
          material,
          minPrice: Number(materialPricing[material].minPrice),
          maxPrice: Number(materialPricing[material].maxPrice),
        })),
        pricingConfigured: true,
        verificationStatus: "pending",
        createdAt: serverTimestamp(),
      });

      toast({ title: "Recycler Account Created" });
      navigate("/recycler/dashboard");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRecyclerLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto max-w-2xl py-12">
        <div className="bg-card rounded-2xl border p-8 shadow-card">
          <Tabs defaultValue="manufacturer">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="manufacturer">
                <Factory className="h-4 w-4 mr-2" /> Manufacturer
              </TabsTrigger>
              <TabsTrigger value="recycler">
                <Building2 className="h-4 w-4 mr-2" /> Recycler
              </TabsTrigger>
            </TabsList>

            {/* ================= MANUFACTURER ================= */}
            <TabsContent value="manufacturer">
              <form onSubmit={handleManufacturerSignup} className="space-y-4">
                <Input placeholder="Company Name" required
                  value={manufacturerForm.companyName}
                  onChange={(e) =>
                    setManufacturerForm({ ...manufacturerForm, companyName: e.target.value })
                  }
                />

                <Input placeholder="Full Address" required
                  value={manufacturerForm.address}
                  onChange={(e) =>
                    setManufacturerForm({ ...manufacturerForm, address: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="City" required
                    value={manufacturerForm.city}
                    onChange={(e) =>
                      setManufacturerForm({ ...manufacturerForm, city: e.target.value })
                    }
                  />
                  <Input placeholder="State" required
                    value={manufacturerForm.state}
                    onChange={(e) =>
                      setManufacturerForm({ ...manufacturerForm, state: e.target.value })
                    }
                  />
                </div>

                <Input type="email" placeholder="Email" required
                  value={manufacturerForm.email}
                  onChange={(e) =>
                    setManufacturerForm({ ...manufacturerForm, email: e.target.value })
                  }
                />

                <Input type="password" placeholder="Password" required
                  value={manufacturerForm.password}
                  onChange={(e) =>
                    setManufacturerForm({ ...manufacturerForm, password: e.target.value })
                  }
                />

                <Button type="submit" className="w-full">
                  Create Manufacturer Account
                </Button>
              </form>
            </TabsContent>

            {/* ================= RECYCLER ================= */}
            <TabsContent value="recycler">
              <form onSubmit={handleRecyclerSignup} className="space-y-4">
                <Input placeholder="Organization Name" required
                  value={recyclerForm.organizationName}
                  onChange={(e) =>
                    setRecyclerForm({ ...recyclerForm, organizationName: e.target.value })
                  }
                />

                <Input placeholder="Full Address" required
                  value={recyclerForm.address}
                  onChange={(e) =>
                    setRecyclerForm({ ...recyclerForm, address: e.target.value })
                  }
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="City" required
                    value={recyclerForm.city}
                    onChange={(e) =>
                      setRecyclerForm({ ...recyclerForm, city: e.target.value })
                    }
                  />
                  <Input placeholder="State" required
                    value={recyclerForm.state}
                    onChange={(e) =>
                      setRecyclerForm({ ...recyclerForm, state: e.target.value })
                    }
                  />
                </div>

                <Input type="email" placeholder="Email" required
                  value={recyclerForm.email}
                  onChange={(e) =>
                    setRecyclerForm({ ...recyclerForm, email: e.target.value })
                  }
                />

                <Input type="password" placeholder="Password" required
                  value={recyclerForm.password}
                  onChange={(e) =>
                    setRecyclerForm({ ...recyclerForm, password: e.target.value })
                  }
                />

                {/* MATERIALS */}
                <Label>Materials Processed</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MATERIAL_TYPES.map((material) => (
                    <div key={material} className="flex items-center space-x-2 p-2 border rounded-lg">
                      <Checkbox
                        checked={recyclerForm.materials.includes(material)}
                        onCheckedChange={() => handleMaterialToggle(material)}
                      />
                      <Label>{material}</Label>
                    </div>
                  ))}
                </div>

                {/* PRICING */}
                {recyclerForm.materials.map((material) => (
                  <div key={material} className="border p-3 rounded-lg space-y-2">
                    <Label>{material} Pricing (₹/kg)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min Price"
                        value={materialPricing[material]?.minPrice || ""}
                        onChange={(e) =>
                          setMaterialPricing((prev) => ({
                            ...prev,
                            [material]: {
                              ...prev[material],
                              minPrice: e.target.value,
                            },
                          }))
                        }
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Max Price"
                        value={materialPricing[material]?.maxPrice || ""}
                        onChange={(e) =>
                          setMaterialPricing((prev) => ({
                            ...prev,
                            [material]: {
                              ...prev[material],
                              maxPrice: e.target.value,
                            },
                          }))
                        }
                        required
                      />
                    </div>
                  </div>
                ))}

                <Button type="submit" className="w-full">
                  Create Recycler Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-primary font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;