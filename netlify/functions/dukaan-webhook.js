// netlify/functions/dukaan-webhook.js
import { Netlify } from "@netlify/sdk";

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const order = await req.json();
    const netlify = new Netlify(context.netlify.apiToken);
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
    await netlify.db.from('orders').insert(orderToInsert);
    console.log("Successfully saved order:", order.order_id);
    return new Response(
      JSON.stringify({ message: "Webhook received and order saved." }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: `Error processing webhook: ${err.message}` }),
      { status: 500 }
    );
  }
};

export const config = {
  path: "/.netlify/functions/dukaan-webhook"
};