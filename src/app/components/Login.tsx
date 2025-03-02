"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
const Login: React.FC = () => {
  const router = useRouter();
  const [tab, setTab] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent, type: "register" | "login") => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/${type === "register" ? "rg" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || `${type === "register" ? "Registration" : "Login"} failed`);
        throw new Error(errorData.error || `${type === "register" ? "Registration" : "Login"} failed`);
      }

      router.push(`/appcom?username=${encodeURIComponent(userData.username)}`);
    } catch (error) {
      alert(`${type === "register" ? "Registration" : "Login"} Error`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className="flex items-center justify-center min-h-screen bg-white text-black">
      <div className="w-[400px]">
        <Tabs value={tab} onValueChange={(val) => setTab(val as "register" | "login")}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-md p-1">
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-xl font-semibold">Register</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" type="text" value={userData.username} onChange={handleChange} required />
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={userData.password} onChange={handleChange} required />
              </CardContent>
              <CardFooter>
                <Button onClick={(e) => handleSubmit(e, "register")} className="w-full" disabled={loading}>
                  {loading ? "Registering..." : "Register"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-xl font-semibold">Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" type="text" value={userData.username} onChange={handleChange} required />
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={userData.password} onChange={handleChange} required />
              </CardContent>
              <CardFooter>
                <Button onClick={(e) => handleSubmit(e, "login")} className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </Suspense>  );
};

export default Login;
