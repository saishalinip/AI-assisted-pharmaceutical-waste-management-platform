import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

const RequestDetailsPage: React.FC = () => {
  const { recyclerId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const wasteType: string = location.state?.wasteType || "Unclassified";

  const [recycler, setRecycler] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<"kg" | "tons">("kg");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!recyclerId) return;

    const fetchRecycler = async () => {
      try {
        const snap = await getDoc(doc(db, "recyclers", recyclerId));
        if (snap.exists()) {
          setRecycler({ uid: recyclerId, ...snap.data() });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecycler();
  }, [recyclerId]);

  const handleSubmit = async () => {
    if (!user || !recycler) return;

    if (!quantity || Number(quantity) <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Please enter a valid quantity.",
        variant: "destructive",
      });
      return;
    }

    if (notes.length > 500) {
      toast({
        title: "Notes too long",
        description: "Notes cannot exceed 500 characters.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "recyclingRequests"), {
        manufacturerId: user.uid,
        manufacturerName: user.displayName || "Manufacturer",
        recyclerId: recycler.uid,
        recyclerName: recycler.organizationName,
        wasteType,
        quantity: Number(quantity),
        unit,
        pickupDate: pickupDate
          ? Timestamp.fromDate(new Date(pickupDate))
          : null,
        notes,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Request Sent",
        description: "Recycling request created successfully.",
      });

      navigate("/manufacturer/requests");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !recycler) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to={`/manufacturer/recycler/${recycler.uid}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create Recycling Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <strong>Recycler:</strong> {recycler.organizationName}
            </div>

            <div>
              <strong>Waste Type:</strong>{" "}
              {wasteType === "Unclassified" ? "Not identified yet" : wasteType}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <Select value={unit} onValueChange={(v) => setUnit(v as any)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="tons">tons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pickup date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Preferred Pickup Date
              </label>
              <Input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Notes (optional, max 500 chars)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </p>
            </div>

            <Button
              className="w-full gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              <Send className="h-4 w-4" />
              Send Recycling Request
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RequestDetailsPage;
