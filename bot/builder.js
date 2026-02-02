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
    
        
  
    const respuesta = await flow.response(text, state, userCtx);
   

    return respuesta;
  }
};
