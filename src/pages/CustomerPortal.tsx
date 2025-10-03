import { useState } from "react";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { generatePDF } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface OrderData {
  id: string;
  date: string;
  customer: string;
  email?: string;
  phone?: string;
  address?: string;
  amount: number;
  status: string;
  itemTotal?: number;
  discount?: number;
  delivery?: number;
  products?: Array<{ name: string; quantity: number; price: number }>;
}

const CustomerPortal = () => {
  const [orderId, setOrderId] = useState("");
  const [foundOrder, setFoundOrder] = useState<OrderData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSearch = () => {
    if (orderId === "21413494") {
      const order: OrderData = {
        id: "21413494",
        date: "2025-09-25",
        customer: "Subramanian RV",
        email: "bindhufitnessone@gmail.com",
        phone: "+91-908977378",
        address: "17E Petals Apartment, Second Floor, BHEL Nagar, Medavakkam, Tamil Nadu - 600100",
        amount: 440,
        status: "Paid",
        itemTotal: 370,
        discount: 77.29,
        delivery: 120,
        products: [
          { name: "Portulaca Plant Button Rose Baby Pink (MOG 002)", quantity: 1, price: 30 },
          { name: "Kodi Sambangi Plant (Creeper)", quantity: 1, price: 80 },
          { name: "Samanthi Plant - Yellow", quantity: 1, price: 70 },
          { name: "Jasmine Plant (Jasminum)", quantity: 2, price: 95 },
        ],
      };
      setFoundOrder(order);
      toast({
        title: "Order Found!",
        description: `Invoice for order #${orderId} is ready to download.`,
      });
    } else {
      setFoundOrder(null);
      toast({
        title: "Order Not Found",
        description: "Please check your order ID and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!foundOrder) return;
    
    setIsGenerating(true);
    try {
      await generatePDF("invoice-content", `Invoice-${foundOrder.id}.pdf`);
      toast({
        title: "Success!",
        description: "Invoice downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
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

          {foundOrder && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Invoice</h2>
                <Button onClick={handleDownloadPDF} disabled={isGenerating} className="gap-2">
                  <Download className="h-4 w-4" />
                  {isGenerating ? "Generating..." : "Download PDF"}
                </Button>
              </div>
              <InvoiceTemplate order={foundOrder} />
            </div>
          )}

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
