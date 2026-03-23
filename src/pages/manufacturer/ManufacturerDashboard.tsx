import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/shared/StatCard";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Upload,
  Recycle,
  Clock,
  CheckCircle,
  ArrowRight,
  Package,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

const ManufacturerDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [manufacturer, setManufacturer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  /* =========================
     WAIT FOR AUTH FIRST
  ========================== */
  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchProfileAndListen = async () => {
      try {
        // 🔹 Fetch manufacturer profile
        const manuSnap = await getDoc(
          doc(db, "manufacturers", user.uid)
        );

        if (manuSnap.exists()) {
          setManufacturer(manuSnap.data());
        }

        // 🔹 Real-time listener
        const q = query(
          collection(db, "recyclingRequests"),
          where("manufacturerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setRequests(data);
          setDataLoaded(true);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchProfileAndListen();
  }, [user, authLoading]);

  /* =========================
     LOADING SCREEN
  ========================== */
  if (authLoading || !dataLoaded) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading dashboard...</div>
      </Layout>
    );
  }

  if (!manufacturer) {
    return (
      <Layout>
        <div className="p-10 text-center text-red-500">
          Manufacturer profile not found.
        </div>
      </Layout>
    );
  }

  /* =========================
     STATS
  ========================== */
  const stats = [
    {
      title: "TOTAL UPLOADS",
      value: requests.length,
      subtitle: "Waste materials uploaded",
      icon: <Upload className="h-5 w-5" />,
    },
    {
      title: "PENDING REQUESTS",
      value: requests.filter((r) => r.status === "pending").length,
      subtitle: "Awaiting recycler response",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      title: "COMPLETED",
      value: requests.filter((r) => r.status === "completed").length,
      subtitle: "Successfully recycled",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      title: "ACTIVE RECYCLERS",
      value: new Set(requests.map((r) => r.recyclerId)).size,
      subtitle: "Available in your area",
      icon: <Recycle className="h-5 w-5" />,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Welcome, {manufacturer.companyName}
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Manage your pharmaceutical waste and recycling requests
            </p>
          </div>

          <Button asChild size="lg" className="shadow-md">
            <Link to="/manufacturer/upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Waste
            </Link>
          </Button>
        </div>

        {/* Company Card */}
        <div className="bg-card rounded-xl border border-border/70 p-6 shadow-card mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl gradient-primary shadow-sm">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-foreground">
                  {manufacturer.companyName}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {manufacturer.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/manufacturer/profile">
                  <FileText className="h-4 w-4 mr-1" />
                  View Profile
                </Link>
              </Button>

              <Button variant="outline" size="sm" asChild>
                <Link to="/manufacturer/users">
                  Manage Users
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Quick Actions + Recent Uploads */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border/70 p-6 shadow-card">
            <h3 className="font-bold text-xl mb-5 text-foreground">
              Quick Actions
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-5 justify-start" asChild>
                <Link to="/manufacturer/upload">
                  <Upload className="h-5 w-5 text-primary mr-2" />
                  Upload Waste
                </Link>
              </Button>

              <Button variant="outline" className="h-auto py-5 justify-start" asChild>
                <Link to="/manufacturer/recyclers">
                  <Recycle className="h-5 w-5 text-primary mr-2" />
                  Find Recyclers
                </Link>
              </Button>

              <Button variant="outline" className="h-auto py-5 justify-start" asChild>
                <Link to="/manufacturer/requests">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  View Requests
                </Link>
              </Button>

              <Button variant="outline" className="h-auto py-5 justify-start" asChild>
                <Link to="/manufacturer/records">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  Records
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-card rounded-xl border border-border/70 p-6 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-xl text-foreground">
                Recent Uploads
              </h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/manufacturer/records">
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {requests.slice(0, 3).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-secondary/40"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">
                      {req.wasteType}
                    </div>

                    <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                      <span>
                        {req.quantity} {req.unit}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {req.createdAt?.toDate().toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <StatusBadge status={req.status} size="sm" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ManufacturerDashboard;