const flows = require("./flows");
const context = require("./context");

module.exports = {
  async process(userId, text) {
    const userCtx = context.get(userId);
    const state = userCtx.state || null;

    //const flow = flows.find(f => f.match(text, state));
    const flow = flows.find(f => {
      try {
        return !!f.match(text, state, userCtx);
      } catch (e) {
        console.log("[match error]", e.message);
        return false;
      }
    });

    if (!flow) {
      return "No entendí 😅 ¿Puedes repetir?";
    }
    //new section with session
    let next;
    if (typeof flow.nextState === "function") {
      next = await flow.nextState(text, state, userCtx); 
    } else {
      next = flow.nextState;
    }
        
    userCtx.state = next ?? null;
    context.set(userId, userCtx);
    const respuesta = await flow.response(text, state, userCtx);
    context.set(userId, userCtx);

    return respuesta;
  }
};
