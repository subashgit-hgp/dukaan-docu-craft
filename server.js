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

    // Header and other details from previous code...
    doc.fontSize(20).text('MyOwnGarden®', { align: 'left' });
    doc.fontSize(10).text('4/467, BHEL Nagar, Medavakkam, Chennai, Tamil Nadu 600100, India');
    doc.text('Contact: support@myowngarden.com');
    doc.text('GSTIN - 33BPSPM1550F1ZX');
    doc.moveDown(2);

    // Totals Section (with the fix)
    const itemTotal = parseFloat(order.subtotal_price) || 0;
    const grandTotal = parseFloat(order.total_price) || 0;
    const delivery = Math.max(0, grandTotal - itemTotal); // Ensures delivery is not negative

    // ... (rest of the PDF generation code) ...

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