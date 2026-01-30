require("dotenv").config();
const axios = require("axios");

const token = process.env.ACCESS_TOKEN;
const phoneId = process.env.PHONE_NUMBER_ID;

module.exports = async function sendMessage(to, message) {
  try {
    if (!message) {
      console.warn("⚠️ No se envió mensaje porque la respuesta fue null/undefined");
      return;
    }

    if (typeof message === "string") {
      await axios.post(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return;
    }

    if (message.type === "image") {
      await axios.post(
        `https://graph.facebook.com/v20.0/${phoneId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "image",
          image: {
            link: message.url,
            caption: message.caption || ""
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      return;
    }

    console.warn("⚠️ Tipo de mensaje no soportado:", message);

  } catch (error) {
    console.error("❌ Error enviando mensaje:", error.response?.data || error.message);
  }
};
