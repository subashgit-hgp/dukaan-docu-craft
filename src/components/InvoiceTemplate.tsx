import { Card } from "@/components/ui/card";

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

interface InvoiceTemplateProps {
  order: OrderData;
}

export const InvoiceTemplate = ({ order }: InvoiceTemplateProps) => {
  const products = order.products || [];
  
  return (
    <Card className="p-8 max-w-4xl mx-auto bg-white" id="invoice-content">
      {/* Header */}
      <div className="border-b-2 border-primary pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">MyOwnGarden®</h1>
            <p className="text-sm text-gray-600">
              4/467, BHEL Nagar, Medavakkam<br />
              Tamil Nadu, India<br />
              GSTIN: 33BPSPM1550F1ZX<br />
              Email: bindhufitnessone@gmail.com<br />
              Phone: +91-908977378
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
            <p className="text-sm text-gray-600 mt-2">
              Order ID: <span className="font-semibold">{order.id}</span><br />
              Date: {new Date(order.date).toLocaleDateString('en-IN')}<br />
              Status: <span className="font-semibold text-primary">{order.status}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold text-gray-800">{order.customer}</p>
          {order.address && <p className="text-sm text-gray-600 mt-1">{order.address}</p>}
          {order.phone && <p className="text-sm text-gray-600">Phone: {order.phone}</p>}
          {order.email && <p className="text-sm text-gray-600">Email: {order.email}</p>}
        </div>
      </div>

      {/* Products Table */}
      {products.length > 0 && (
        <div className="mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-primary text-white">
                <th className="text-left p-3 rounded-tl-lg">Item Description</th>
                <th className="text-center p-3">Qty</th>
                <th className="text-right p-3">Price</th>
                <th className="text-right p-3 rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 text-gray-800">{product.name}</td>
                  <td className="p-3 text-center text-gray-800">{product.quantity}</td>
                  <td className="p-3 text-right text-gray-800">₹{product.price.toFixed(2)}</td>
                  <td className="p-3 text-right text-gray-800">₹{(product.price * product.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Amount Summary */}
      <div className="flex justify-end mb-6">
        <div className="w-64">
          {order.itemTotal !== undefined && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Item Total:</span>
              <span className="font-semibold">₹{order.itemTotal.toFixed(2)}</span>
            </div>
          )}
          {order.discount !== undefined && order.discount > 0 && (
            <div className="flex justify-between py-2 border-b text-green-600">
              <span>Discount:</span>
              <span className="font-semibold">-₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          {order.delivery !== undefined && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Delivery Charges:</span>
              <span className="font-semibold">₹{order.delivery.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 bg-primary text-white px-3 rounded-lg mt-2">
            <span className="font-bold">Grand Total:</span>
            <span className="font-bold text-xl">₹{order.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="text-center text-sm text-gray-600">
          <p className="font-semibold mb-2">Thank you for your order!</p>
          <p>For any queries, please contact us at bindhufitnessone@gmail.com or +91-908977378</p>
          <p className="mt-4 text-xs text-gray-500">This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </Card>
  );
};
