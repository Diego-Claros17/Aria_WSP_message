
module.exports = [
  // ==================================================
  // FALLBACK
  // ==================================================

{
  match: () => true,
  nextState: null,
  NUMERO_TELF:"+591 75910012",
  response: () =>
    "Hola te comunicaste con Tiendas ARIA👋\n"+
    "Este número ya no atiende ventas ni consultas web.\n"+
    `Para atención inmediata, pedidos y stock actualizado, escríbenos aquí 👉 ${NUMERO_TELF}`+
    "Gracias por tu comprensión 💛"
}


];
