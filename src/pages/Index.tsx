import { ArrowRight, FileText, Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <nav className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MyOwnGarden" className="h-12" />
            <div>
              <h2 className="font-bold text-lg text-foreground">MyOwnGarden®</h2>
              <p className="text-xs text-muted-foreground">Invoice Generator</p>
            </div>
          </div>
          <Link to="/admin">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Professional Invoice Generation
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Automated invoice and receipt generation for your Dukaan store orders
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/customer">
              <Button size="lg" className="gap-2">
                Download Invoice <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-4" />
              <CardTitle>A4 Invoices</CardTitle>
              <CardDescription>
                Professional A4 format invoices with all order details and branding
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Easy Download</CardTitle>
              <CardDescription>
                Customers can download their invoices instantly using Order ID
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Automated generation with secure storage and fast delivery
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p className="mb-2">MyOwnGarden® - 4/467, BHEL Nagar, Medavakkam, Tamil Nadu</p>
          <p>GSTIN: 33BPSPM1550F1ZX</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
