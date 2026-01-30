require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sendMessage = require("./sendMessage");
const builder = require("./bot/builder");
const { getSession } = require("./sessionStore");


const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// =========================================
// GET — VERIFICACIÓN DEL WEBHOOK
// =========================================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verificado correctamente!");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// =========================================
// POST — RECIBIR MENSAJES
// =========================================
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    const messages = changes?.messages;

    if (messages && messages[0]) {
      const msg = messages[0];

      const from = msg.from;
      const text =
        msg.text?.body ||
        msg.button?.text ||
        msg.interactive?.button_reply?.title ||
        msg.interactive?.list_reply?.title ||
        msg.interactive?.nfm_reply?.response_json ||
        "";

      console.log("Mensaje recibido: ", text);

      //const respuesta = await builder.process(from, text);
      const session = getSession(from);
      const respuesta = await builder.process(from, text, session);

      await sendMessage(from, respuesta);
    }
  } catch (err) {
    console.error("Error procesando mensaje:", err);
  }

  res.sendStatus(200);
});

// =========================================
// INICIAR SERVIDOR
// =========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Servidor ejecutándose en puerto " + PORT);
});

