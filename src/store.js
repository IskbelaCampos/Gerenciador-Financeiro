const { randomUUID } = require("crypto");

const defaultUser = {
  id: randomUUID(),
  firstName: "Maria",
  lastName: "Exemplo",
  name: "Maria Exemplo",
  email: "maria@exeplo.com",
  password: "123456"
};

const store = {
  users: [defaultUser],
  refreshTokens: new Map(),
  invalidatedAccessTokens: new Set(),
  transactions: [],
  budgets: [],
  alerts: []
};

module.exports = {
  store,
  defaultUser
};
