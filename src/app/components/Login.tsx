"use client"
import { useRouter } from "next/navigation"
import type React from "react"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Login: React.FC = () => {
  const router = useRouter()
  const [tab, setTab] = useState<"register" | "login">("register")
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  })

  const [requestTimestamp, setRequestTimestamp] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value)
  }

  const requestOtp = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email }), // Use email instead of username
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to send OTP");
        throw new Error(errorData.error || "Failed to send OTP");
      }
  
      const data = await response.json();
      setRequestTimestamp(data.requestTimestamp);
      setOtpSent(true);
      alert("OTP sent to your email");
    } catch (error) {
      alert("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      if (!requestTimestamp) {
        throw new Error("Request timestamp is missing");
      }
  
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.email, // Use email instead of username
          otp: otp,
          requestTimestamp: requestTimestamp,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Invalid OTP");
        throw new Error(errorData.error || "Invalid OTP");
      }
  
      // If OTP is verified, proceed with registration
      await handleActualRegistration();
    } catch (error) {
      alert("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleActualRegistration = async () => {
    try {
      const response = await fetch("/api/rg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || "Registration failed")
        throw new Error(errorData.error || "Registration failed")
      }

      router.push("/appcom")
    } catch (error) {
      alert("Registration Error")
      throw error // Re-throw to be caught by the parent function
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otpSent) {
      // First step: Request OTP
      await requestOtp()
    } else {
      // Second step: Verify OTP and complete registration
      await verifyOtp()
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        alert(errorData.error || "Invalid credentials")
        return
      }

      router.push("/appcom")
    } catch (error) {
      alert("Login Error")
    } finally {
      setLoading(false)
    }
  }

  const resetRegistration = () => {
    setOtpSent(false)
    setOtp("")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-black">
      <div className="w-[400px]">
        <Tabs
          defaultValue={tab}
          onValueChange={(val) => {
            setTab(val as "register" | "login")
            if (val === "login") {
              resetRegistration()
            }
          }}
        >
          <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-md p-1">
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Suspense fallback={<div>Loading registration...</div>}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-semibold">
                    {otpSent ? "Verify OTP" : "Register"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!otpSent ? (
                    <>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                      />
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                      />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">
                        We've sent a verification code to {userData.email}. Please enter it below.
                      </p>
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        name="otp"
                        value={otp}
                        onChange={handleOtpChange}
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                      />
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                  <Button onClick={handleRegisterSubmit} className="w-full" disabled={loading}>
                    {loading
                      ? otpSent
                        ? "Verifying..."
                        : "Sending OTP..."
                      : otpSent
                        ? "Verify & Register"
                        : "Get Verification Code"}
                  </Button>

                  {otpSent && (
                    <Button variant="outline" onClick={resetRegistration} className="w-full mt-2">
                      Back to Registration
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </Suspense>
          </TabsContent>

          <TabsContent value="login">
            <Suspense fallback={<div>Loading login...</div>}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-center text-xl font-semibold">Login</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={userData.email} onChange={handleChange} required />
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                  />
                </CardContent>
                <CardFooter>
                  <Button onClick={handleLoginSubmit} className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </CardFooter>
              </Card>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Login