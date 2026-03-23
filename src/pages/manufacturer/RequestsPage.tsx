import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Eye,
  Calendar,
  Building2,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import StatusBadge from "@/components/shared/StatusBadge";
import MaterialBadge from "@/components/shared/MaterialBadge";

const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // Fetch manufacturer requests
  // ----------------------------
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "recyclingRequests"),
      where("manufacturerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id, // internal use only
          ...doc.data(),
        }));
        setRequests(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/manufacturer/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Recycling Requests
              </h1>
              <p className="text-muted-foreground mt-1">
                Track and manage your recycling requests
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Filter by Status:
              </span>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Requests
                  </SelectItem>
                  <SelectItem value="pending">
                    Pending
                  </SelectItem>
                  <SelectItem value="accepted">
                    Accepted
                  </SelectItem>
                  <SelectItem value="completed">
                    Completed
                  </SelectItem>
                  <SelectItem value="rejected">
                    Rejected
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>
              {filteredRequests.length} request
              {filteredRequests.length !== 1
                ? "s"
                : ""}{" "}
              found
            </CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading requests...
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      {/* LEFT CONTENT */}
                      <div className="space-y-2">
                        {/* Line 1: Waste + Quantity */}
                        <div className="flex items-center gap-3">
                          <MaterialBadge
                            material={request.wasteType}
                          />
                          <span className="text-muted-foreground">
                            {request.quantity}{" "}
                            {request.unit}
                          </span>
                          <StatusBadge
                            status={request.status}
                          />
                        </div>

                        {/* Line 2: Recycler + Date */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {request.recyclerName}
                          </span>

                          {request.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {request.createdAt
                                .toDate()
                                .toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* RIGHT ACTION */}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <Link
                          to={`/manufacturer/requests/${request.id}`}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RequestsPage;
