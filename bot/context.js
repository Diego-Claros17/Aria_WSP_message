// bot/context.js
const memory = {};

module.exports = {
  get(userId) {
    return memory[userId] || { state: null };
  },

  set(userId, data) {
    const prev = memory[userId] || { state: null };
    memory[userId] = { ...prev, ...data };
  }
};
