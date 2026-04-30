const { randomUUID } = require("crypto");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yaml");
const { categories, expenseCategories, transactionTypes } = require("./constants");
const { authenticate, issueAccessToken, issueRefreshToken, JWT_SECRET } = require("./middleware/auth");
const { store } = require("./store");
const {
  buildCategorySummary,
  createBudget,
  findBudgetById,
  getExpenseTotal,
  getTotalByType,
  recalculateBudget,
  recalculateBudgetsForTransaction,
  updateBudget,
  validateBudgetCategory,
  validatePositiveDecimal
} = require("./services/finance");
const { getMonthFromDate, getPreviousMonth, isWithinDateRange } = require("./utils/dates");
const { buildMoney } = require("./utils/money");

const app = express();
const openApiPath = path.join(__dirname, "..", "docs", "openapi.yaml");
const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, "utf8"));

app.use(cors());
app.use(express.json());

function sendValidationError(res, details) {
  return res.status(400).json({
    code: "VALIDATION_ERROR",
    message: "Os dados enviados sao invalidos.",
    details
  });
}

function normalizeUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email
  };
}

function buildAuthResponse(user) {
  return {
    accessToken: issueAccessToken(user),
    refreshToken: issueRefreshToken(user),
    tokenType: "Bearer",
    expiresIn: 3600,
    user: normalizeUser(user)
  };
}

function validateRegisterPayload(payload) {
  const details = [];

  if (!payload.firstName || !String(payload.firstName).trim()) {
    details.push({ field: "firstName", issue: "Nome e obrigatorio." });
  }

  if (!payload.lastName || !String(payload.lastName).trim()) {
    details.push({ field: "lastName", issue: "Sobrenome e obrigatorio." });
  }

  if (!payload.email || !String(payload.email).includes("@")) {
    details.push({ field: "email", issue: "Email invalido." });
  }

  if (!payload.password || String(payload.password).length < 6) {
    details.push({ field: "password", issue: "Senha deve ter pelo menos 6 caracteres." });
  }

  return details;
}

function isCategoryCompatible(category, transactionType) {
  const categoryEntry = categories.find((item) => item.code === category);
  return categoryEntry ? categoryEntry.transactionTypes.includes(transactionType) : false;
}

function validateTransactionPayload(payload) {
  const details = [];
  if (!transactionTypes.includes(payload.transactionType)) {
    details.push({ field: "transactionType", issue: "Tipo de lancamento invalido." });
  }

  if (!categories.some((item) => item.code === payload.category)) {
    details.push({ field: "category", issue: "Categoria invalida." });
  }

  if (payload.category && payload.transactionType && !isCategoryCompatible(payload.category, payload.transactionType)) {
    details.push({ field: "category", issue: "Categoria nao compativel com o tipo de lancamento." });
  }

  if (!validatePositiveDecimal(payload.amount)) {
    details.push({ field: "amount", issue: "Valor deve ser decimal positivo." });
  }

  if (!payload.currencyCode) {
    details.push({ field: "currencyCode", issue: "Codigo da moeda e obrigatorio." });
  }

  if (!payload.currencySymbol) {
    details.push({ field: "currencySymbol", issue: "Simbolo da moeda e obrigatorio." });
  }

  if (!payload.transactionDate || !/^\d{4}-\d{2}-\d{2}$/.test(payload.transactionDate)) {
    details.push({ field: "transactionDate", issue: "Data do lancamento deve estar no formato YYYY-MM-DD." });
  }

  return details;
}

function validateBudgetPayload(payload, isPartial = false) {
  const details = [];

  if (!isPartial) {
    if (!validateBudgetCategory(payload.category)) {
      details.push({ field: "category", issue: "Budget deve ser criado para uma categoria de despesa." });
    }

    if (!payload.month || !/^\d{4}-\d{2}$/.test(payload.month)) {
      details.push({ field: "month", issue: "Mes deve estar no formato YYYY-MM." });
    }

    if (!payload.currencyCode) {
      details.push({ field: "currencyCode", issue: "Codigo da moeda e obrigatorio." });
    }

    if (!payload.currencySymbol) {
      details.push({ field: "currencySymbol", issue: "Simbolo da moeda e obrigatorio." });
    }
  }

  if (!validatePositiveDecimal(payload.amount)) {
    details.push({ field: "amount", issue: "Valor do budget deve ser decimal positivo." });
  }

  return details;
}

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/docs/openapi.yaml", (req, res) => {
  res.type("application/yaml");
  res.sendFile(openApiPath);
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.post("/api/v1/auth/register", (req, res) => {
  const details = validateRegisterPayload(req.body || {});
  if (details.length) {
    return sendValidationError(res, details);
  }

  const normalizedEmail = String(req.body.email).trim().toLowerCase();
  const existingUser = store.users.find((item) => item.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Os dados enviados sao invalidos.",
      details: [{ field: "email", issue: "Ja existe usuario cadastrado com este email." }]
    });
  }

  const firstName = String(req.body.firstName).trim();
  const lastName = String(req.body.lastName).trim();
  const user = {
    id: randomUUID(),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: normalizedEmail,
    password: String(req.body.password)
  };

  store.users.push(user);
  return res.status(201).json(buildAuthResponse(user));
});

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const user = store.users.find(
    (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
  );

  if (!user) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Credenciais invalidas." });
  }

  return res.json(buildAuthResponse(user));
});

app.post("/api/v1/auth/refresh", (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || !store.refreshTokens.has(refreshToken)) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Refresh token invalido." });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const user = store.users.find((item) => item.id === payload.sub);
    if (!user) {
      return res.status(401).json({ code: "UNAUTHORIZED", message: "Usuario nao encontrado." });
    }

    return res.json(buildAuthResponse(user));
  } catch (error) {
    store.refreshTokens.delete(refreshToken);
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Refresh token expirado ou invalido." });
  }
});

app.post("/api/v1/auth/logout", authenticate, (req, res) => {
  store.invalidatedAccessTokens.add(req.token);
  const refreshToken = req.body?.refreshToken;
  if (refreshToken) {
    store.refreshTokens.delete(refreshToken);
  }

  return res.status(204).send();
});

app.get("/api/v1/auth/me", authenticate, (req, res) => {
  res.json(normalizeUser(req.user));
});

app.get("/api/v1/categories", authenticate, (req, res) => {
  res.json({ items: categories });
});

app.get("/api/v1/transactions", authenticate, (req, res) => {
  const { startDate, endDate, month, category, transactionType } = req.query;
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);

  const filtered = store.transactions.filter((transaction) => {
    return (
      transaction.userId === req.user.id &&
      (!month || getMonthFromDate(transaction.transactionDate) === month) &&
      (!category || transaction.category === category) &&
      (!transactionType || transaction.transactionType === transactionType) &&
      isWithinDateRange(transaction.transactionDate, startDate, endDate)
    );
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  res.json({ items, page, pageSize, totalItems, totalPages });
});

app.post("/api/v1/transactions", authenticate, (req, res) => {
  const details = validateTransactionPayload(req.body || {});
  if (details.length) {
    return sendValidationError(res, details);
  }

  const transaction = {
    id: randomUUID(),
    userId: req.user.id,
    transactionType: req.body.transactionType,
    category: req.body.category,
    money: buildMoney(req.body.amount, req.body.currencyCode, req.body.currencySymbol),
    description: req.body.description || "",
    transactionDate: req.body.transactionDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.transactions.push(transaction);
  recalculateBudgetsForTransaction(transaction);

  res.status(201).json(transaction);
});

app.get("/api/v1/transactions/:transactionId", authenticate, (req, res) => {
  const transaction = store.transactions.find(
    (item) => item.id === req.params.transactionId && item.userId === req.user.id
  );

  if (!transaction) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Lancamento nao encontrado." });
  }

  return res.json(transaction);
});

app.put("/api/v1/transactions/:transactionId", authenticate, (req, res) => {
  const transaction = store.transactions.find(
    (item) => item.id === req.params.transactionId && item.userId === req.user.id
  );

  if (!transaction) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Lancamento nao encontrado." });
  }

  const details = validateTransactionPayload(req.body || {});
  if (details.length) {
    return sendValidationError(res, details);
  }

  const previousCategory = transaction.category;
  const previousMonth = getMonthFromDate(transaction.transactionDate);

  transaction.transactionType = req.body.transactionType;
  transaction.category = req.body.category;
  transaction.money = buildMoney(req.body.amount, req.body.currencyCode, req.body.currencySymbol);
  transaction.description = req.body.description || "";
  transaction.transactionDate = req.body.transactionDate;
  transaction.updatedAt = new Date().toISOString();

  recalculateBudgetsForTransaction(transaction);
  if (previousCategory !== transaction.category || previousMonth !== getMonthFromDate(transaction.transactionDate)) {
    store.budgets
      .filter((budget) => budget.userId === req.user.id && budget.category === previousCategory && budget.month === previousMonth)
      .forEach(recalculateBudget);
  }

  return res.json(transaction);
});

app.delete("/api/v1/transactions/:transactionId", authenticate, (req, res) => {
  const index = store.transactions.findIndex(
    (item) => item.id === req.params.transactionId && item.userId === req.user.id
  );

  if (index < 0) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Lancamento nao encontrado." });
  }

  const [removed] = store.transactions.splice(index, 1);
  store.budgets
    .filter((budget) => budget.userId === req.user.id && budget.category === removed.category)
    .forEach(recalculateBudget);

  return res.status(204).send();
});

app.get("/api/v1/budgets", authenticate, (req, res) => {
  const { month, category } = req.query;
  const items = store.budgets.filter((budget) => {
    return (
      budget.userId === req.user.id &&
      (!month || budget.month === month) &&
      (!category || budget.category === category)
    );
  });

  res.json({ items });
});

app.post("/api/v1/budgets", authenticate, (req, res) => {
  const details = validateBudgetPayload(req.body || {});
  if (details.length) {
    return sendValidationError(res, details);
  }

  const existing = store.budgets.find(
    (budget) => budget.userId === req.user.id && budget.category === req.body.category && budget.month === req.body.month
  );
  if (existing) {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Ja existe budget cadastrado para esta categoria e mes.",
      details: [{ field: "category", issue: "Budget duplicado." }]
    });
  }

  const budget = createBudget(req.user.id, req.body);
  return res.status(201).json(budget);
});

app.get("/api/v1/budgets/:budgetId", authenticate, (req, res) => {
  const budget = findBudgetById(req.user.id, req.params.budgetId);
  if (!budget) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Budget nao encontrado." });
  }

  return res.json(budget);
});

app.patch("/api/v1/budgets/:budgetId", authenticate, (req, res) => {
  const details = validateBudgetPayload(req.body || {}, true);
  if (details.length) {
    return sendValidationError(res, details);
  }

  const budget = updateBudget(req.user.id, req.params.budgetId, req.body.amount);
  if (!budget) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Budget nao encontrado." });
  }

  return res.json(budget);
});

app.get("/api/v1/alerts/budgets", authenticate, (req, res) => {
  const { month, status } = req.query;
  const items = store.alerts.filter((alert) => {
    const budget = findBudgetById(req.user.id, alert.budgetId);
    return budget && (!month || alert.month === month) && (!status || alert.status === status);
  });

  res.json({ items });
});

app.post("/api/v1/alerts/budgets/:alertId/acknowledge", authenticate, (req, res) => {
  const alert = store.alerts.find((item) => item.id === req.params.alertId);
  const budget = alert ? findBudgetById(req.user.id, alert.budgetId) : null;
  if (!alert || !budget) {
    return res.status(404).json({ code: "NOT_FOUND", message: "Alerta nao encontrado." });
  }

  alert.status = "ACKNOWLEDGED";
  return res.json(alert);
});

app.get("/api/v1/dashboard/overview", authenticate, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const categorySummary = buildCategorySummary(req.user.id, month);
  const totalExpenses = getTotalByType(req.user.id, month, "EXPENSE");
  const totalIncome = getTotalByType(req.user.id, month, "INCOME");
  const totalSavings = getTotalByType(req.user.id, month, "SAVINGS");

  res.json({
    month,
    totalExpenses: buildMoney(totalExpenses, "EUR", "€"),
    totalIncome: buildMoney(totalIncome, "EUR", "€"),
    totalSavings: buildMoney(totalSavings, "EUR", "€"),
    categorySummary
  });
});

app.get("/api/v1/dashboard/categories/summary", authenticate, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  res.json({
    month,
    items: buildCategorySummary(req.user.id, month)
  });
});

app.get("/api/v1/dashboard/comparisons/monthly", authenticate, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const previousMonth = getPreviousMonth(month);
  const currentTotal = getExpenseTotal(req.user.id, month);
  const previousTotal = getExpenseTotal(req.user.id, previousMonth);
  const difference = currentTotal - previousTotal;
  const differencePercentage = previousTotal === 0 ? 100 : Number(((difference / previousTotal) * 100).toFixed(2));

  res.json({
    currentMonth: month,
    previousMonth,
    currentTotal: buildMoney(currentTotal, "EUR", "€"),
    previousTotal: buildMoney(previousTotal, "EUR", "€"),
    difference: buildMoney(difference, "EUR", "€"),
    differencePercentage
  });
});

app.get("/api/v1/dashboard/comparisons/monthly/categories", authenticate, (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const previousMonth = getPreviousMonth(month);
  const items = expenseCategories.map((category) => {
    const currentTotal = getExpenseTotal(req.user.id, month, category);
    const previousTotal = getExpenseTotal(req.user.id, previousMonth, category);
    const difference = currentTotal - previousTotal;
    const differencePercentage = previousTotal === 0 ? 100 : Number(((difference / previousTotal) * 100).toFixed(2));

    return {
      category,
      currentTotal: buildMoney(currentTotal, "EUR", "€"),
      previousTotal: buildMoney(previousTotal, "EUR", "€"),
      difference: buildMoney(difference, "EUR", "€"),
      differencePercentage
    };
  });

  res.json({
    month,
    previousMonth,
    items
  });
});

app.use((req, res) => {
  res.status(404).json({ code: "NOT_FOUND", message: "Rota nao encontrada." });
});

module.exports = app;
