import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebase";

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import MaterialBadge from "@/components/shared/MaterialBadge";

import {
  Package,
  Clock,
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  Eye,
  Settings,
  FileText,
} from "lucide-react";

interface RecyclingRequest {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  recyclerId: string;
  recyclerName: string;
  wasteType: string;
  quantity: number;
  unit: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: Timestamp;
  location?: string;
}

const RecyclerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [recycler, setRecycler] = useState<any>(null);
  const [requests, setRequests] = useState<RecyclingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch recycler profile
  useEffect(() => {
    if (!user) return;

    const fetchRecyclerProfile = async () => {
      const snap = await getDocs(
        query(collection(db, "recyclers"), where("__name__", "==", user.uid))
      );

      if (!snap.empty) {
        setRecycler(snap.docs[0].data());
      }
    };

    fetchRecyclerProfile();
  }, [user]);

  // 🔹 Fetch incoming requests for this recycler
  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true);

      const q = query(
        collection(db, "recyclingRequests"),
        where("recyclerId", "==", user.uid)
      );

      const snap = await getDocs(q);

      const data: RecyclingRequest[] = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      setRequests(data);
      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading dashboard...</div>
      </Layout>
    );
  }

  if (!recycler) {
    return (
      <Layout>
        <div className="p-10 text-center text-red-500">
          Recycler profile not found
        </div>
      </Layout>
    );
  }

  const pending = requests.filter((r) => r.status === "pending");
  const accepted = requests.filter((r) => r.status === "accepted");
  const completed = requests.filter((r) => r.status === "completed");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome, {recycler.organizationName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage incoming recycling requests
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link to="/recycler/pricing">
                <Settings className="h-4 w-4 mr-2" />
                Pricing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/recycler/profile">
                <FileText className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* RECYCLER PROFILE CARD */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">
                  {recycler.organizationName}
                </h2>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {recycler.location}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {recycler.materialsProcessed?.map((mat: string) => (
                <span
                  key={mat}
                  className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                >
                  {mat}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Pending Requests"
            value={pending.length}
            subtitle="Awaiting your response"
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="Accepted"
            value={accepted.length}
            subtitle="Ready for processing"
            icon={<CheckCircle className="h-5 w-5" />}
          />
          <StatCard
            title="Completed"
            value={completed.length}
            subtitle="Successfully recycled"
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard
            title="Total Processed"
            value="—"
            subtitle="Will be calculated later"
            icon={<Package className="h-5 w-5" />}
          />
        </div>

        {/* INCOMING REQUESTS */}
        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Incoming Requests</h3>
            <p className="text-sm text-muted-foreground">
              Review recycling requests from manufacturers
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No requests yet
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((req) => (
                <div key={req.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Package className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <MaterialBadge material={req.wasteType || "Unclassified"} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="font-semibold">
                        {req.manufacturerName}
                      </p>
                      <p className="text-sm text-muted-foreground flex gap-4">
                        <span>{req.quantity} {req.unit}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {req.createdAt?.toDate().toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <Button variant="outline" asChild>
                    <Link to={`/recycler/requests/${req.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecyclerDashboard;
