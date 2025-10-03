import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import logo from "@/assets/logo.png";

const CustomerPortal = () => {
  const [orderId, setOrderId] = useState("");

  const handleSearch = () => {
    // TODO: Search for order in database
    console.log("Searching for order:", orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <img src={logo} alt="MyOwnGarden" className="h-20 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-2">Download Your Invoice</h1>
            <p className="text-muted-foreground">Enter your order ID to retrieve your invoice</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order Lookup</CardTitle>
              <CardDescription>Enter your order ID from the confirmation email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., 21413494"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Need help? Contact us at bindhufitnessone@gmail.com</p>
            <p className="mt-2">4/467, BHEL Nagar, Medavakkam, Tamil Nadu</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
