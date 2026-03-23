import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/shared/StatusBadge";
import MaterialBadge from "@/components/shared/MaterialBadge";
import { useToast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  Building2,
  MapPin,
  Package,
  Scale,
  Calendar,
  Check,
  X,
} from "lucide-react";

import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebase";

/* ---------------------------------------
   TYPES
---------------------------------------- */

interface RecyclingRequest {
  id: string;
  manufacturerId: string;
  recyclerId: string;
  wasteType: string;
  quantity: number;
  unit: "kg" | "tons";
  pickupDate?: Timestamp | null;
  notes?: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Timestamp;
}

interface ManufacturerProfile {
  companyName: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
}

/* ---------------------------------------
   COMPONENT
---------------------------------------- */

const RecyclerRequestDetailsPage: React.FC = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const [request, setRequest] = useState<RecyclingRequest | null>(null);
  const [manufacturer, setManufacturer] =
    useState<ManufacturerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------------------------------
     FETCH REQUEST + MANUFACTURER
  ---------------------------------------- */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // 1️⃣ Fetch recycling request
        const requestSnap = await getDoc(doc(db, "recyclingRequests", id));

        if (!requestSnap.exists()) {
          setLoading(false);
          return;
        }

        const requestData: RecyclingRequest = {
          id: requestSnap.id,
          ...(requestSnap.data() as Omit<RecyclingRequest, "id">),
        };

        setRequest(requestData);

        // 2️⃣ Fetch manufacturer profile using manufacturerId
        if (requestData.manufacturerId) {
          const manuSnap = await getDoc(
            doc(db, "manufacturers", requestData.manufacturerId)
          );

          if (manuSnap.exists()) {
            setManufacturer(manuSnap.data() as ManufacturerProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching request details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------------------------------
     UPDATE STATUS
  ---------------------------------------- */
  const updateStatus = async (status: "accepted" | "rejected") => {
    if (!id) return;

    try {
      await updateDoc(doc(db, "recyclingRequests", id), { status });

      setRequest((prev) => (prev ? { ...prev, status } : prev));

      toast({
        title: `Request ${status}`,
        description: `You have ${status} this request.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  /* ---------------------------------------
     LOADING / ERROR STATES
  ---------------------------------------- */

  if (loading) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading request details…</div>
      </Layout>
    );
  }

  if (!request) {
    return (
      <Layout>
        <div className="p-10 text-center">Request not found</div>
      </Layout>
    );
  }

  /* ---------------------------------------
     UI
  ---------------------------------------- */

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/recycler/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recycling Request</h1>
            <p className="text-sm text-muted-foreground">
              Request ID: {request.id}
            </p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Manufacturer Information */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Manufacturer Information
          </h2>

          {manufacturer ? (
            <>
              <p className="font-medium text-lg">
                {manufacturer.companyName}
              </p>

              {manufacturer.location && (
                <p className="flex items-center gap-1 text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {manufacturer.location}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">
              Loading manufacturer details...
            </p>
          )}
        </div>

        {/* Waste Details */}
        <div className="bg-card border rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Waste Details
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Material Type
              </p>
              <MaterialBadge material={request.wasteType} />
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantity</p>
              <p className="flex items-center gap-2 font-medium">
                <Scale className="h-4 w-4 text-muted-foreground" />
                {request.quantity} {request.unit}
              </p>
            </div>

            {request.pickupDate && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Preferred Pickup Date
                </p>
                <p className="flex items-center gap-2 font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {request.pickupDate.toDate().toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {request.notes && request.notes.trim() !== "" && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm whitespace-pre-line">
                {request.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {request.status === "pending" && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              className="text-destructive"
              onClick={() => updateStatus("rejected")}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>

            <Button onClick={() => updateStatus("accepted")}>
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecyclerRequestDetailsPage;