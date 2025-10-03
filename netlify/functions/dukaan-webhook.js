// netlify/functions/dukaan-webhook.js

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Use dynamic import() to load the ES Module
    const { Netlify } = await import("@netlify/sdk");

    const order = JSON.parse(event.body);
    const netlify = new Netlify({ apiToken: context.netlify.apiToken });

    const orderToInsert = {
      order_id: order.order_id,
      order_date: order.order_date,
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_email: order.customer.email,
      customer_address: order.customer.address,
      payment_mode: order.payment_mode,
      status: order.status,
      grand_total: order.amounts.grand_total,
      products: order.products,
      custom_fields: order.custom_fields
    };
    
    // Insert data into the 'orders' table
    await netlify.db.from('orders').insert(orderToInsert);

    console.log(`Successfully saved order: ${order.order_id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Webhook received and order successfully saved." })
    };

  } catch (err) {
    console.error("Webhook processing error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error processing webhook: ${err.message}` })
    };
  }
};