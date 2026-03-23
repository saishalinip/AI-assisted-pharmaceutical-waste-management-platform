import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, MapPin, Package, Recycle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import StatCard from "@/components/shared/StatCard";

const CompanyProfilePage: React.FC = () => {

  const { user } = useAuth();

  const [manufacturer, setManufacturer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchProfileData = async () => {

      if (!user) return;

      try {

        /* MANUFACTURER PROFILE */

        const manuSnap = await getDoc(
          doc(db, "manufacturers", user.uid)
        );

        if (manuSnap.exists()) {
          setManufacturer(manuSnap.data());
        }

        /* FETCH RECYCLING REQUESTS */

        const requestsQuery = query(
          collection(db, "recyclingRequests"),
          where("manufacturerId", "==", user.uid)
        );

        const requestsSnap = await getDocs(requestsQuery);

        const data = requestsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRequests(data);

      } catch (error) {

        console.error("Profile load error:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchProfileData();

  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="p-10 text-center">Loading profile...</div>
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

  /* CALCULATE STATS */

  const totalUploads = requests.length;

  const totalRequests = requests.length;

  const completedRecyclings =
    requests.filter((r) => r.status === "completed").length;

  return (

    <Layout>

      <div className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Header */}

        <div className="mb-6">

          <Button variant="ghost" size="sm" asChild className="mb-4">

            <Link to="/manufacturer/dashboard">

              <ArrowLeft className="h-4 w-4 mr-2"/>
              Back to Dashboard

            </Link>

          </Button>

          <h1 className="text-2xl font-bold">Company Profile</h1>

          <p className="text-muted-foreground mt-1">
            View your company details and recycling statistics
          </p>

        </div>

        {/* COMPANY INFO */}

        <Card className="mb-6">

          <CardHeader>

            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5"/>
              Company Information
            </CardTitle>

          </CardHeader>

          <CardContent className="space-y-4">

            <div>

              <p className="text-sm text-muted-foreground">
                Company Name
              </p>

              <p className="font-medium text-lg">
                {manufacturer.companyName}
              </p>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Location
              </p>

              <p className="font-medium flex items-center gap-1">
                <MapPin className="h-4 w-4"/>
                {manufacturer.location}
              </p>

            </div>

            <div>

              <p className="text-sm text-muted-foreground">
                Email
              </p>

              <p className="font-medium">
                {manufacturer.email}
              </p>

            </div>

          </CardContent>

        </Card>

        {/* STATISTICS */}

        <Card>

          <CardHeader>

            <CardTitle>Company Statistics</CardTitle>

            <CardDescription>
              Overview of your waste management activity
            </CardDescription>

          </CardHeader>

          <CardContent>

            <div className="grid md:grid-cols-3 gap-4">

              <StatCard
                title="Total Uploads"
                value={totalUploads}
                icon={<Package className="h-5 w-5"/>}
              />

              <StatCard
                title="Total Requests"
                value={totalRequests}
                icon={<Recycle className="h-5 w-5"/>}
              />

              <StatCard
                title="Completed Recyclings"
                value={completedRecyclings}
                icon={<CheckCircle className="h-5 w-5"/>}
              />

            </div>

          </CardContent>

        </Card>

      </div>

    </Layout>

  );

};

export default CompanyProfilePage;