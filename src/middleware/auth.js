const jwt = require("jsonwebtoken");
const { store } = require("../store");

const JWT_SECRET = process.env.JWT_SECRET || "gerenciador-financeiro-secret";

function issueAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
}

function issueRefreshToken(user) {
  const refreshToken = jwt.sign({ sub: user.id, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
  store.refreshTokens.set(refreshToken, user.id);
  return refreshToken;
}

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Token JWT nao informado." });
  }

  const token = authorization.replace("Bearer ", "");
  if (store.invalidatedAccessTokens.has(token)) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Token JWT invalido." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = store.users.find((item) => item.id === payload.sub);
    if (!user) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "Usuario nao encontrado." });
    }

    req.token = token;
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Token JWT invalido." });
  }
}

module.exports = {
  JWT_SECRET,
  authenticate,
  issueAccessToken,
  issueRefreshToken
};
