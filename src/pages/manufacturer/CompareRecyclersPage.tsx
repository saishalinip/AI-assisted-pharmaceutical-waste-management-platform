import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Star,
  IndianRupee,
  Check,
  X,
} from "lucide-react";

import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

const CompareRecyclersPage: React.FC = () => {

  const location = useLocation();

  const recyclerIds: string[] = location.state?.recyclerIds || [];
  const wasteType: string | undefined = location.state?.wasteType;

  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* HAVERSINE DISTANCE */

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {

    const R = 6371;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  /* FETCH RECYCLERS */

  useEffect(() => {

    const fetchRecyclers = async () => {

      setLoading(true);

      try {

        const user = auth.currentUser;
        if (!user) return;

        const manufacturerSnap = await getDoc(
          doc(db, "manufacturers", user.uid)
        );

        const manufacturerData = manufacturerSnap.data();

        const manufacturerLat = Number(manufacturerData?.latitude);
        const manufacturerLon = Number(manufacturerData?.longitude);

        const results = await Promise.all(

          recyclerIds.map(async (id) => {

            const snap = await getDoc(doc(db, "recyclers", id));
            if (!snap.exists()) return null;

            const recycler = snap.data();

            const recyclerLat = Number(recycler.latitude);
            const recyclerLon = Number(recycler.longitude);

            let distance: number | null = null;

            if (
              !isNaN(manufacturerLat) &&
              !isNaN(manufacturerLon) &&
              !isNaN(recyclerLat) &&
              !isNaN(recyclerLon)
            ) {

              distance = calculateDistance(
                manufacturerLat,
                manufacturerLon,
                recyclerLat,
                recyclerLon
              );

            }

            return {
              uid: id,
              ...recycler,
              distance,
            };

          })

        );

        setRecyclers(results.filter(Boolean));

      } catch (error) {

        console.error("Error fetching recyclers:", error);

      }

      setLoading(false);

    };

    if (recyclerIds.length >= 2) fetchRecyclers();
    else setLoading(false);

  }, [recyclerIds]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          Loading comparison...
        </div>
      </Layout>
    );
  }

  if (recyclers.length < 2) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">
            Select Recyclers to Compare
          </h1>

          <Button asChild>
            <Link to="/manufacturer/recyclers">
              Back to Recyclers
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const materials = ["PVC", "PP", "Plastic", "Glass"];

  return (

    <Layout>

      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}

        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/manufacturer/recyclers">
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back to Recyclers
          </Link>
        </Button>

        <h1 className="text-3xl font-bold">
          Compare Recyclers
        </h1>

        <p className="text-muted-foreground mt-1 mb-8">
          Side-by-side comparison of {recyclers.length} recyclers
        </p>

        <div className="overflow-x-auto">

          <div className="min-w-[700px]">

            {/* HEADER ROW */}

            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `200px repeat(${recyclers.length}, 1fr)`
              }}
            >

              <div className="p-4 font-semibold text-muted-foreground">
                Attribute
              </div>

              {recyclers.map((recycler) => (

                <Card key={recycler.uid} className="shadow-sm">

                  <CardHeader>

                    <div className="flex items-center gap-3">

                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary"/>
                      </div>

                      <div>

                        <CardTitle className="text-base">
                          {recycler.organizationName}
                        </CardTitle>

                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3"/>
                          {recycler.location}
                        </p>

                      </div>

                    </div>

                  </CardHeader>

                </Card>

              ))}

            </div>

            {/* DISTANCE */}

            <div
              className="grid gap-4 mt-4"
              style={{
                gridTemplateColumns: `200px repeat(${recyclers.length}, 1fr)`
              }}
            >

              <div className="p-4 text-muted-foreground">
                Distance
              </div>

              {recyclers.map((r) => {

                let displayDistance = "Unknown";

                if (r.distance !== null) {

                  if (r.distance < 0.1) displayDistance = "0 km";
                  else displayDistance = `${r.distance.toFixed(2)} km`;

                }

                return (
                  <Card key={r.uid}>
                    <CardHeader className="text-center">
                      {displayDistance}
                    </CardHeader>
                  </Card>
                );

              })}

            </div>

            {/* RATING */}

            <div
              className="grid gap-4 mt-2"
              style={{
                gridTemplateColumns: `200px repeat(${recyclers.length}, 1fr)`
              }}
            >

              <div className="p-4 text-muted-foreground">
                Rating
              </div>

              {recyclers.map((r) => (
                <Card key={r.uid}>
                  <CardHeader className="text-center flex items-center justify-center gap-1">

                    {r.rating ? (
                      <>
                        <Star className="h-4 w-4 text-yellow-500"/>
                        {r.rating}
                      </>
                    ) : (
                      "New"
                    )}

                  </CardHeader>
                </Card>
              ))}

            </div>

            {/* PRICING CONFIGURED */}

            <div
              className="grid gap-4 mt-2"
              style={{
                gridTemplateColumns: `200px repeat(${recyclers.length}, 1fr)`
              }}
            >

              <div className="p-4 text-muted-foreground">
                Pricing Configured
              </div>

              {recyclers.map((r) => (
                <Card key={r.uid}>
                  <CardHeader className="text-center">

                    {r.pricingConfigured ? (
                      <Check className="text-green-600 mx-auto"/>
                    ) : (
                      <X className="mx-auto"/>
                    )}

                  </CardHeader>
                </Card>
              ))}

            </div>

            {/* MATERIALS */}

            <div className="mt-8 font-semibold">
              Materials & Pricing
            </div>

            {materials.map((material) => (

              <div
                key={material}
                className="grid gap-4 mt-3"
                style={{
                  gridTemplateColumns: `200px repeat(${recyclers.length}, 1fr)`
                }}
              >

                <div className="p-4 text-muted-foreground">
                  {material}
                </div>

                {recyclers.map((r) => {

                  const materialData = r.materialPricing?.find(
                    (m: any) => m.material === material
                  );

                  return (
                    <Card key={r.uid}>
                      <CardHeader className="text-center">

                        {materialData ? (
                          <span className="flex items-center justify-center gap-1 text-green-600">
                            <IndianRupee className="h-4 w-4"/>
                            {materialData.minPrice}-{materialData.maxPrice}/kg
                          </span>
                        ) : (
                          <X className="mx-auto text-muted-foreground"/>
                        )}

                      </CardHeader>
                    </Card>
                  );

                })}

              </div>

            ))}

            {/* BUTTONS */}

            <div
              className="grid gap-4 mt-6"
              style={{
                gridTemplateColumns: `200px repeat(${recyclers.length}, 1fr)`
              }}
            >

              <div></div>

              {recyclers.map((r) => (

                <Button key={r.uid} asChild className="w-full">

                  <Link
                    to={`/manufacturer/recycler/${r.uid}`}
                    state={{ wasteType }}
                  >
                    View Details
                  </Link>

                </Button>

              ))}

            </div>

          </div>

        </div>

      </div>

    </Layout>

  );

};

export default CompareRecyclersPage;