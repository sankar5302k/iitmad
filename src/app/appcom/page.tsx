"use client"
import { useSearchParams } from "next/navigation"
import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Check, Minus, Plus, ShoppingCart, Star, Trash2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Suspense } from "react";
// Product type definition
type Product = {
  id: number
  name: string
  category: string
  price: number
  rating: number
  image: string
  badge?: string
}

// Cart item type definition
type CartItem = Product & {
  quantity: number
}

const AppCom = () => {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const username = searchParams?.get("username") || "Guest"

  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [resultOpen, setResultOpen] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [purchaseLoading, setPurchaseLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!image || !username || username === "Guest") {
      alert("Please select an image and ensure you're logged in.")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append("image", image)
    formData.append("username", username)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setResult(data.result)
      setResultOpen(true)
    } catch (error) {
      alert("Upload failed!")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return

    await fetch("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ username, feedback }),
      headers: { "Content-Type": "application/json" },
    })

    alert("Thanks for your feedback!")
    setFeedback("")
  }

  const isInCart = (productId: number) => {
    return cartItems.some((item) => item.id === productId)
  }

  const handleAddToCart = (product: Product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      if (existingItem) {
        // If the item is already in the cart, increase its quantity
        return prevItems.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        // If it's a new item, add it to the cart
        return [...prevItems, { ...product, quantity: 1 }]
      }
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    })
  }

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const handlePurchase = async () => {
    if (cartItems.length === 0) return

    if (username === "Guest") {
      toast({
        title: "Login required",
        description: "Please log in to complete your purchase",
        variant: "destructive",
      })
      return
    }

    setPurchaseLoading(true)

    try {
      const response = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          items: cartItems,
          totalAmount: calculateTotal(),
          purchaseDate: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || "Purchase failed")

      toast({
        title: "Purchase successful!",
        description: `Your order #${data.orderId} has been placed`,
        duration: 5000,
      })

      // Clear cart after successful purchase
      setCartItems([])
      setCartOpen(false)
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setPurchaseLoading(false)
    }
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  // Pet products data
  const products = [
    {
      id: 1,
      name: "Premium Dog Food",
      category: "food",
      price: 29.99,
      rating: 4.8,
      image: "/dp1.jpeg?height=200&width=200",
      badge: "Bestseller",
    },
    {
      id: 2,
      name: "Plush Dog Bed",
      category: "beds",
      price: 49.99,
      rating: 4.7,
      image: "/dp2.jpeg?height=200&width=200",
    },
    {
      id: 3,
      name: "Durable Chew Toy",
      category: "toys",
      price: 12.99,
      rating: 4.5,
      image: "/dp3.jpeg?height=200&width=200",
      badge: "New",
    },
    {
      id: 4,
      name: "Adjustable Collar",
      category: "accessories",
      price: 18.99,
      rating: 4.6,
      image: "/dp2.jpeg?height=200&width=200",
    },
    {
      id: 5,
      name: "Retractable Leash",
      category: "accessories",
      price: 24.99,
      rating: 4.4,
      image: "/dp3.jpeg?height=200&width=200",
    },
    {
      id: 6,
      name: "Dental Treats",
      category: "food",
      price: 15.99,
      rating: 4.9,
      image: "/dp1.jpeg?height=200&width=200",
      badge: "Sale",
    },
  ]

  const filteredProducts = activeTab === "all" ? products : products.filter((product) => product.category === activeTab)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 py-8">
      <h1 className="text-2xl font-bold">Welcome, {username}!</h1>

      {/* Image Upload */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-lg font-semibold">Upload an Image</h2>
        </CardHeader>
        <CardContent>
          <Input type="file" accept="image/*" onChange={handleImageChange} />
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex gap-4">
        <Button asChild>
          <a href={`/dashboard?username=${username}`}>View Dashboard</a>
        </Button>
      </div>

      {/* Image Result Modal */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Analysis Result</DialogTitle>
          </DialogHeader>
          <p>{result ? result : "Processing..."}</p>
        </DialogContent>
      </Dialog>

      {/* 💎 Subscription Plans Modal */}
      <Dialog open={pricingOpen} onOpenChange={setPricingOpen}>
        <DialogTrigger asChild>
          <div className="w-full max-w-md p-4 border rounded-lg shadow-lg cursor-pointer hover:bg-muted/50 transition-colors">
            <h2 className="text-xl font-semibold">💎 Upgrade to Premium</h2>
            <p className="text-gray-500">Get faster processing & detailed insights.</p>
            <Button className="mt-2">See Plans</Button>
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
            <DialogDescription>Select the perfect plan for your pet's needs</DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-4 py-4">
            {/* Basic Plan */}
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-bold">Basic</h3>
                <p className="text-3xl font-bold">
                  $9<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>5 image uploads/day</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Basic analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Email support</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Select
                </Button>
              </CardFooter>
            </Card>

            {/* Premium Plan */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-0 right-0 flex justify-center">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">POPULAR</Badge>
              </div>
              <CardHeader className="pb-2">
                <h3 className="text-lg font-bold">Premium</h3>
                <p className="text-3xl font-bold">
                  $19<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>20 image uploads/day</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Advanced analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Breed identification</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Select</Button>
              </CardFooter>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-bold">Pro</h3>
                <p className="text-3xl font-bold">
                  $29<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Unlimited uploads</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Premium analysis</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>24/7 phone support</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Health monitoring</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Behavior insights</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Select
                </Button>
              </CardFooter>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping Cart Modal */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Your Shopping Cart
            </DialogTitle>
            <DialogDescription>
              {cartItems.length === 0
                ? "Your cart is empty"
                : `You have ${cartCount} item${cartCount !== 1 ? "s" : ""} in your cart`}
            </DialogDescription>
          </DialogHeader>

          {cartItems.length > 0 ? (
            <>
              <div className="space-y-4 my-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-20 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between items-center py-4">
                <div className="font-medium text-lg">Total</div>
                <div className="font-bold text-xl">${calculateTotal()}</div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCartOpen(false)}>
                  Continue Shopping
                </Button>
                <Button onClick={handlePurchase} disabled={purchaseLoading} className="min-w-[120px]">
                  {purchaseLoading ? "Processing..." : "Complete Purchase"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="mb-4">Your cart is empty</p>
              <Button onClick={() => setCartOpen(false)}>Browse Products</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 📢 Feedback Form */}
      <div className="w-full max-w-md p-4 border rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold">📢 Give us your Feedback</h2>
        <Textarea placeholder="Share your thoughts..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <Button onClick={handleSubmitFeedback} className="w-full mt-2">
          Submit
        </Button>
      </div>

      {/* 🎁 Promotional Offer */}
      <div className="w-full max-w-md p-4 border rounded-lg shadow-lg bg-yellow-100 text-center">
        <h2 className="text-lg font-bold">🎉 Limited Time Offer!</h2>
        <p className="text-gray-700">
          Get 10% off your first purchase! Use code: <span className="font-semibold">WELCOME10</span>
        </p>
      </div>

      {/* Pet Store Section */}
      <div className="w-full max-w-5xl mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🛍️ Pet Store</h2>
          <Button variant="outline" className="relative" onClick={() => setCartOpen(true)}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-primary text-primary-foreground">
                {cartCount}
              </Badge>
            )}
          </Button>
        </div>

        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="food">Food</TabsTrigger>
            <TabsTrigger value="toys">Toys</TabsTrigger>
            <TabsTrigger value="beds">Beds</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                {product.badge && (
                  <Badge
                    className={`absolute top-2 right-2 ${
                      product.badge === "Sale" ? "bg-red-500" : product.badge === "New" ? "bg-green-500" : "bg-blue-500"
                    } text-white`}
                  >
                    {product.badge}
                  </Badge>
                )}
              </div>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="font-bold">${product.price}</p>
                </div>
                <div className="flex items-center mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-1">{product.rating}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  variant={isInCart(product.id) ? "secondary" : "default"}
                >
                  {isInCart(product.id) ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AppCom

