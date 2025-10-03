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
    const fullWebhookBody = req.body;
    const order = fullWebhookBody.order;

    if (!order) {
      console.error('Webhook received, but "order" object was missing.');
      return res.status(400).json({ success: false, message: 'Invalid payload.' });
    }

    // Use 'id' from the top level, as it's the simple order number
    const orderId = fullWebhookBody.id || order.id || order.uuid;
    console.log('Webhook received for order:', orderId);

    const filename = `invoice_${orderId}.pdf`;
    const filePath = path.join(invoicesDir, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // --- PDF Content Generation ---
    doc.fontSize(20).text('MyOwnGarden® Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${orderId}`);
    doc.text(`Order Date: ${order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString()}`);
    doc.moveDown();

    doc.text('Bill To:');
    const customerName = order.shipping_address ? order.shipping_address.full_name : 'N/A';
    const customerAddress = order.shipping_address ? `${order.shipping_address.address1}, ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}` : 'N/A';
    const customerPhone = order.shipping_address ? order.shipping_address.phone : 'N/A';
    doc.text(customerName);
    doc.text(customerAddress);
    doc.text(`Phone: ${customerPhone}`);
    doc.moveDown();

    doc.text('Order Summary:');
    // ** THE FIX IS HERE: Use order.line_items **
    if (order.line_items && Array.isArray(order.line_items)) {
      order.line_items.forEach(item => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 0;
        doc.text(`${item.title || 'Unknown Product'} x ${quantity} = ₹${(price * quantity).toFixed(2)}`);
      });
    } else {
      doc.text('Product details not available in this payload.');
    }
    doc.moveDown();

    const grandTotal = order.total_price || 0;
    doc.fontSize(14).text(`Grand Total: ₹${grandTotal.toFixed(2)}`, { align: 'right' });

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