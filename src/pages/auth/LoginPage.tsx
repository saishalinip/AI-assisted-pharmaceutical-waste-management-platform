import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Recycle, ArrowRight, Factory, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";

const LoginPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [manufacturerForm, setManufacturerForm] = useState({
    email: "",
    password: "",
  });

  const [recyclerForm, setRecyclerForm] = useState({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent,
    form: { email: string; password: string }
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);

      toast({
        title: "Login successful",
        description: "Redirecting to your dashboard...",
      });

      // ✅ REQUIRED: trigger role-based redirect
      navigate("/redirect");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 gradient-hero">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg gradient-primary">
                <Recycle className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-semibold text-xl">PharmaRecycle</span>
            </div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
          </div>

          <div className="bg-card rounded-2xl border shadow-card p-8">
            <Tabs defaultValue="manufacturer">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="manufacturer">
                  <Factory className="h-4 w-4 mr-2" /> Manufacturer
                </TabsTrigger>
                <TabsTrigger value="recycler">
                  <Building2 className="h-4 w-4 mr-2" /> Recycler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="manufacturer">
                <form
                  onSubmit={(e) => handleLogin(e, manufacturerForm)}
                  className="space-y-4"
                >
                  <Input
                    type="email"
                    placeholder="Email"
                    value={manufacturerForm.email}
                    onChange={(e) =>
                      setManufacturerForm({
                        ...manufacturerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={manufacturerForm.password}
                    onChange={(e) =>
                      setManufacturerForm({
                        ...manufacturerForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    Login <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="recycler">
                <form
                  onSubmit={(e) => handleLogin(e, recyclerForm)}
                  className="space-y-4"
                >
                  <Input
                    type="email"
                    placeholder="Email"
                    value={recyclerForm.email}
                    onChange={(e) =>
                      setRecyclerForm({
                        ...recyclerForm,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={recyclerForm.password}
                    onChange={(e) =>
                      setRecyclerForm({
                        ...recyclerForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    Login <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
