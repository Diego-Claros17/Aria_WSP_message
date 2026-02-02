require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const sendMessage = require("./sendMessage");
const builder = require("./bot/builder");


const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// =========================================
// GET — VERIFICACIÓN DEL WEBHOOK
// =========================================
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = (req.query["hub.verify_token"] || "").trim();
  const challenge = req.query["hub.challenge"];

  const expected = (process.env.VERIFY_TOKEN || "").trim();

  console.log("VERIFY REQUEST:", { mode, token, expected });

  if (mode === "subscribe" && token === expected) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});


// =========================================
// POST — RECIBIR MENSAJES
// =========================================
// ===== Anti-spam in-memory (simple) =====
const repliedMap = new Map(); // key: wa_id, value: timestamp(ms)
const REPLY_TTL_MS = 24 * 60 * 60 * 1000; // 24h

function shouldReplyOncePer24h(waId) {
  const now = Date.now();
  const last = repliedMap.get(waId);

  // Cleanup básico (evita que crezca infinito)
  if (last && now - last > REPLY_TTL_MS) repliedMap.delete(waId);

  if (repliedMap.has(waId)) return false; // ya respondió en 24h
  repliedMap.set(waId, now);
  return true;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const value = entry?.changes?.[0]?.value;
    const msg = value?.messages?.[0];

    // No es mensaje (statuses, etc.)
    if (!msg) return res.sendStatus(200);

    const from = msg.from;
    const type = msg.type;

    console.log("📩 Incoming:", { from, type });

    // 1) Responder solo 1 vez por usuario cada 24h
    if (!shouldReplyOncePer24h(from)) {
      return res.sendStatus(200);
    }

    // 2) Delay “humano” (3–8s aleatorio)
    const delayMs = 3000 + Math.floor(Math.random() * 5000);
    await sleep(delayMs);

    // 3) Mensaje fijo súper seguro + redirección
    const OFFICIAL_NUMBER = "+591 75910012"; 
    const FIXED_MESSAGE =
    "Hola te comunicaste con Tiendas ARIA👋\n"+
    "Este número ya no atiende ventas ni consultas web.\n"+
    `Para atención inmediata, pedidos y stock actualizado, escríbenos aquí 👉 ${OFFICIAL_NUMBER}\n`+
    "Gracias por tu comprensión 💛"
    await sendMessage(from, FIXED_MESSAGE);

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ POST /webhook error:", err?.message || err);
    return res.sendStatus(200);
  }
});


// =========================================
// INICIAR SERVIDOR
// =========================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Servidor ejecutándose en puerto " + PORT);
});

