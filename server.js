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

// Respond to GET requests (from a browser)
app.get('/', (req, res) => {
  res.status(200).send('Server is alive and running!');
});

// **THIS IS THE FIX**
// Respond to HEAD requests (from UptimeRobot)
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
    console.log('Webhook received for order:', order.order_id);
    const filename = `invoice_${order.order_id}.pdf`;
    const filePath = path.join(invoicesDir, filename);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));
    // ... (rest of your PDF generation code)
    doc.fontSize(20).text('MyOwnGarden® Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.order_id || 'N/A'}`);
    doc.text(`Order Date: ${order.order_date ? new Date(order.order_date).toLocaleDateString() : new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Bill To:');
    doc.text(order.customer ? order.customer.name : 'N/A');
    doc.text(order.customer ? order.customer.address : 'N/A');
    doc.text(`Phone: ${order.customer ? order.customer.phone : 'N/A'}`);
    doc.moveDown();
    if (order.custom_fields) {
      doc.text('Additional Information:');
      for (const [key, value] of Object.entries(order.custom_fields)) {
        doc.text(`${key}: ${value}`);
      }
      doc.moveDown();
    }
    doc.text('Order Summary:');
    if (order.products && Array.isArray(order.products)) {
      order.products.forEach(p => {
        const price = p.price || 0;
        const quantity = p.quantity || 0;
        doc.text(`${p.name || 'Unknown Product'} x ${quantity} = ₹${(price * quantity).toFixed(2)}`);
      });
    } else {
      doc.text('Product details not available in this payload.');
    }
    doc.moveDown();
    const grandTotal = order.amounts ? order.amounts.grand_total : 0;
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