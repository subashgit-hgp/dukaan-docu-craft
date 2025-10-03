// netlify/functions/dukaan-webhook.js

exports.handler = async function(event, context) {
  // This will create a log entry no matter what Dukaan sends.
  console.log("--- DUKAAN WEBHOOK TRIGGERED ---");
  console.log("Received event body:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Simple test function executed successfully." })
  };
};