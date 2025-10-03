import { useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvoiceTemplate } from "@/components/InvoiceTemplate";
import { generatePDF } from "@/lib/pdfGenerator";
import { toast } from "@/hooks/use-toast";

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

const mockOrders: OrderData[] = [
  {
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
  },
];

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPDF = async (order: OrderData) => {
    setIsGenerating(true);
    setSelectedOrder(order);
    
    // Wait for the dialog to render
    setTimeout(async () => {
      try {
        await generatePDF("invoice-content", `Invoice-${order.id}.pdf`);
        toast({
          title: "Success!",
          description: "Invoice downloaded successfully.",
        });
        setSelectedOrder(null);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate PDF. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Invoice Dashboard</h1>
          <p className="text-muted-foreground">Manage and download all invoices</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>₹{order.amount}</TableCell>
                    <TableCell>
                      <Badge variant="default">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <FileText className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDownloadPDF(order)}
                          disabled={isGenerating}
                        >
                          <Download className="h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder && !isGenerating} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview - Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && <InvoiceTemplate order={selectedOrder} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
