import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, ArrowRight, Filter } from "lucide-react";

import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

const RecyclerListPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ GET wasteType from previous page
  const wasteType: string | undefined = location.state?.wasteType;

  const [recyclers, setRecyclers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  /* =========================
     HAVERSINE DISTANCE
  ========================== */
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

  /* =========================
     FETCH + DISTANCE LOGIC
  ========================== */
  useEffect(() => {
    const fetchMatchedRecyclers = async () => {
      setLoading(true);

      try {
        const user = auth.currentUser;
        if (!user) return;

        const manufacturerSnap = await getDoc(
          doc(db, "manufacturers", user.uid)
        );

        if (!manufacturerSnap.exists()) return;

        const manufacturerData = manufacturerSnap.data();
        const manufacturerLat = manufacturerData.latitude;
        const manufacturerLon = manufacturerData.longitude;

        if (!manufacturerLat || !manufacturerLon) return;

        const snap = await getDocs(collection(db, "recyclers"));

        const filtered = snap.docs
          .map((doc) => {
            const recycler = doc.data();

            if (recycler.verificationStatus !== "verified") return null;

            if (
              wasteType &&
              !recycler.materialsProcessed
                ?.map((m: string) => m.toLowerCase().trim())
                .includes(wasteType.toLowerCase().trim())
            ) {
              return null;
            }

            if (!recycler.latitude || !recycler.longitude) return null;

            const distance = calculateDistance(
              manufacturerLat,
              manufacturerLon,
              recycler.latitude,
              recycler.longitude
            );

            return {
              uid: doc.id,
              ...recycler,
              distance,
            };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.distance - b.distance);

        setRecyclers(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchedRecyclers();
  }, [wasteType]);

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const allMaterials = Array.from(
    new Set(recyclers.flatMap((r) => r.materialsProcessed || []))
  );

  const filteredRecyclers = recyclers.filter((r) => {
    const matchesSearch =
      r.organizationName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMaterial =
      materialFilter === "all" ||
      r.materialsProcessed?.includes(materialFilter);

    return matchesSearch && matchesMaterial;
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading recyclers...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Nearest Matching Recyclers
            </h1>
            <p className="text-muted-foreground mt-1">
              {wasteType
                ? `Sorted by distance for ${wasteType}`
                : "Browse verified recyclers in your area"}
            </p>
          </div>

          {/* ✅ FIXED Compare Button */}
          {selectedForCompare.length >= 2 && (
            <Button
              onClick={() =>
                navigate("/manufacturer/compare", {
                  state: {
                    recyclerIds: selectedForCompare,
                    wasteType: wasteType,   // ✅ PASS IT
                  },
                })
              }
            >
              Compare ({selectedForCompare.length})
            </Button>
          )}
        </div>

        {filteredRecyclers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No matching recyclers found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecyclers.map((recycler) => (
              <div
                key={recycler.uid}
                className="bg-card rounded-xl border shadow-card"
              >
                <div className="p-6">
                  <h3 className="font-semibold text-lg">
                    {recycler.organizationName}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {recycler.location}
                  </div>

                  <div className="mt-2 text-sm font-semibold text-primary">
                    {recycler.distance.toFixed(2)} km away
                  </div>

                  <div className="flex items-center justify-between pt-5">
                    <div
                      className="flex items-center gap-2 cursor-pointer text-sm"
                      onClick={() => toggleCompare(recycler.uid)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedForCompare.includes(recycler.uid)}
                        readOnly
                      />
                      <span>Compare</span>
                    </div>

                    {/* ✅ FIXED Select Button */}
                    <Button size="sm" asChild>
                      <Link
                        to={`/manufacturer/recycler/${recycler.uid}`}
                        state={{ wasteType }}   // ✅ PASS IT
                      >
                        Select
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecyclerListPage;