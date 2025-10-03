// A barebones Netlify function with no dependencies

exports.handler = async function(event, context) {
  console.log("--- BAREBONES WEBHOOK TRIGGERED ---");
  console.log("Body:", event.body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success from the simplest function!" })
  };
};