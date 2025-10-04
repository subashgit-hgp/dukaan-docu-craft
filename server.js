const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

app.use(bodyParser.json());

const invoicesDir = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir);
}

app.use('/invoices', express.static(invoicesDir));

app.get('/', (req, res) => {
  res.status(200).send('Server is alive and running!');
});

app.head('/', (req, res) => {
  res.status(200).end();
});

app.post('/webhook', (req, res) => {
  try {
    const order = req.body.order;

    if (!order) {
      console.error('Webhook received, but "order" object was missing.');
      return res.status(400).json({ success: false, message: 'Invalid payload.' });
    }
    
    const orderId = req.body.id || order.id || order.uuid;
    console.log('Webhook received for order:', orderId);

    const filename = `invoice_${orderId}.pdf`;
    const filePath = path.join(invoicesDir, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    
    doc.registerFont('NotoSans', 'NotoSans-Regular.ttf');
    doc.font('NotoSans');

    // Header
    doc.fontSize(20).text('MyOwnGarden®', { align: 'left' });
    doc.fontSize(10).text('4/467, BHEL Nagar, Medavakkam, Chennai, Tamil Nadu 600100, India');
    doc.text('Contact: support@myowngarden.com');
    doc.text('GSTIN - 33BPSPM1550F1ZX');
    doc.moveDown(2);

    // Order and Customer Details
    const detailsTop = doc.y;
    doc.fontSize(12).text('Order details', { underline: true });
    doc.text(`Order ID: ${orderId}`);
    doc.text(`Order Date: ${order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}`);
    doc.text(`Payment: ${order.payment_gateway_names ? order.payment_gateway_names.join(', ') : 'N/A'}`);

    const customerName = order.shipping_address ? order.shipping_address.full_name : 'N/A';
    const customerAddress = order.shipping_address ? `${order.shipping_address.address1}, ${order.shipping_address.city}, ${order.shipping_address.state}, IN, ${order.shipping_address.zip}` : 'N/A';
    const customerPhone = order.shipping_address ? order.shipping_address.phone : 'N/A';
    
    doc.text('Customer details', 300, detailsTop, { underline: true });
    doc.text(customerName, 300);
    doc.text(customerAddress, 300, { width: 250 });
    doc.text(`Mobile: ${customerPhone}`, 300);
    doc.moveDown(3);

    // Order Summary Table
    doc.fontSize(14).text('Order summary');
    doc.moveDown();
    const tableTop = doc.y;
    doc.fontSize(10).font('NotoSans');
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 350, tableTop, { width: 50, align: 'center' });
    doc.text('Price', 420, tableTop, { width: 60, align: 'right' });
    doc.text('Amount', 500, tableTop, { width: 60, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(560, tableTop + 15).stroke();

    let i = 0;
    if (order.line_items && Array.isArray(order.line_items)) {
      order.line_items.forEach(item => {
        const y = tableTop + 25 + (i * 25);
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 0;
        doc.text(item.title || 'Unknown Product', 50, y, { width: 280 });
        doc.text(quantity.toString(), 350, y, { width: 50, align: 'center' });
        doc.text(`₹${price.toFixed(2)}`, 420, y, { width: 60, align: 'right' });
        doc.text(`₹${(price * quantity).toFixed(2)}`, 500, y, { width: 60, align: 'right' });
        i++;
      });
    }
    doc.y = tableTop + 25 + (i * 25);
    doc.moveDown(2);
    
    const itemTotal = order.subtotal_price || 0;
    const grandTotal = order.total_price || 0;
    const delivery = Math.max(0, grandTotal - itemTotal);
    
    doc.fontSize(12).text(`Item Total: ₹${itemTotal.toFixed(2)}`, { align: 'right' });
    if (delivery > 0) {
      doc.text(`Delivery: ₹${delivery.toFixed(2)}`, { align: 'right' });
    }
    doc.moveDown(0.5);
    doc.fontSize(16).text(`Total: ₹${grandTotal.toFixed(2)}`, { align: 'right' });
    doc.moveDown(3);

    if (order.note) {
      doc.fontSize(12).text('Additional details:', { underline: true });
      doc.fontSize(10).text(order.note);
    }
    
    doc.end();
    res.status(200).json({ success: true, message: 'Invoice created successfully.' });

  } catch (error) {
    console.error('Failed to process webhook:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});