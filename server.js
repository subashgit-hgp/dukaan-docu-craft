const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

const invoicesDir = path.join(__dirname, 'invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir);
}

app.use('/invoices', express.static(invoicesDir));

app.post('/webhook', (req, res) => {
  try {
    // THE FIX IS HERE: Get the data from inside the "order" object
    const order = req.body.order;

    // A check to make sure the order object exists
    if (!order) {
      console.error('Webhook received, but "order" object was missing in the body.');
      return res.status(400).json({ success: false, message: 'Invalid payload received from Dukaan.' });
    }

    console.log('Webhook received for order:', order.order_id);

    const filename = `invoice_${order.order_id}.pdf`;
    const filePath = path.join(invoicesDir, filename);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('MyOwnGarden® Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Order ID: ${order.order_id}`);
    doc.text(`Order Date: ${new Date(order.order_date).toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Bill To:');
    doc.text(order.customer.name);
    doc.text(order.customer.address);
    doc.text(`Phone: ${order.customer.phone}`);
    doc.moveDown();

    if (order.custom_fields) {
      doc.text('Additional Information:');
      for (const [key, value] of Object.entries(order.custom_fields)) {
        doc.text(`${key}: ${value}`);
      }
      doc.moveDown();
    }

    doc.text('Order Summary:');
    order.products.forEach(p => {
      doc.text(`${p.name} x ${p.quantity} = ₹${(p.price * p.quantity).toFixed(2)}`);
    });
    doc.moveDown();
    doc.fontSize(14).text(`Grand Total: ₹${order.amounts.grand_total.toFixed(2)}`, { align: 'right' });
    
    doc.end();

    res.status(200).json({ success: true, message: 'Invoice created successfully.' });

  } catch (error) {
    console.error('Failed to process webhook:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});