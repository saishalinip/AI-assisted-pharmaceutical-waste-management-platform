import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  IndianRupee,
  ArrowRight,
  Star,
} from "lucide-react";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const RecyclerDetailPage: React.FC = () => {
  const { id } = useParams(); // recycler UID
  const navigate = useNavigate();
  const location = useLocation();

  const wasteType = location.state?.wasteType; // passed from WasteUpload → RecyclerList
  const [recycler, setRecycler] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchRecycler = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "recyclers", id));
        if (snap.exists()) {
          setRecycler({ uid: id, ...snap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch recycler:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecycler();
  }, [id]);

  const handleProceed = () => {
    navigate(`/manufacturer/request/${recycler.uid}`, {
      state: { wasteType },
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          Loading recycler details...
        </div>
      </Layout>
    );
  }

  if (!recycler) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          Recycler not found
        </div>
      </Layout>
    );
  }

  const pricedMaterials = recycler.materialPricing || [];
  const allMaterials = recycler.materialsProcessed || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/manufacturer/recyclers">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recyclers
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {recycler.organizationName}
              </h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {recycler.location}
              </p>
            </div>
          </div>

          {recycler.rating && (
            <div className="flex items-center gap-1 text-lg font-semibold">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {recycler.rating}
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Materials & Pricing */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Materials & Pricing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Materials processed and price ranges
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {pricedMaterials.map((p: any) => (
                <div
                  key={p.material}
                  className="flex items-center justify-between border rounded-lg px-4 py-2"
                >
                  <span className="font-medium">{p.material}</span>
                  <span className="flex items-center gap-1 text-sm text-primary">
                    <IndianRupee className="h-4 w-4" />
                    {p.minPrice} – {p.maxPrice}/kg
                  </span>
                </div>
              ))}

              <div className="pt-3">
                <p className="text-xs text-muted-foreground mb-1">
                  All Materials Processed
                </p>
                <div className="flex flex-wrap gap-2">
                  {allMaterials.map((m: string) => (
                    <span
                      key={m}
                      className="px-3 py-1 text-xs rounded-full bg-muted"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proceed with Request</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Enter waste details and submit a recycling request
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full gap-2"
                  onClick={handleProceed}
                >
                  Continue to Request
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Materials</span>
                  <span>{allMaterials.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priced Materials</span>
                  <span>{pricedMaterials.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RecyclerDetailPage;
