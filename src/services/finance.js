const { randomUUID } = require("crypto");
const { expenseCategories } = require("../constants");
const { store } = require("../store");
const { getMonthFromDate } = require("../utils/dates");
const { buildMoney, toNumber } = require("../utils/money");

function findBudgetById(userId, budgetId) {
  return store.budgets.find((budget) => budget.id === budgetId && budget.userId === userId);
}

function getBudgetTransactions(userId, category, month) {
  return store.transactions.filter((transaction) => {
    return (
      transaction.userId === userId &&
      transaction.transactionType === "EXPENSE" &&
      transaction.category === category &&
      getMonthFromDate(transaction.transactionDate) === month
    );
  });
}

function calculateConsumedAmount(userId, category, month) {
  return getBudgetTransactions(userId, category, month).reduce((sum, transaction) => {
    return sum + Number(transaction.money.amount);
  }, 0);
}

function determineThresholdStatus(percentage) {
  if (percentage >= 100) {
    return "EXCEEDED";
  }

  if (percentage >= 90) {
    return "REACHED_90";
  }

  if (percentage >= 50) {
    return "REACHED_50";
  }

  return "BELOW_50";
}

function syncBudgetAlerts(budget) {
  const thresholds = [50, 90];

  for (const threshold of thresholds) {
    const existingAlert = store.alerts.find(
      (alert) => alert.budgetId === budget.id && alert.threshold === threshold
    );

    if (budget.consumedPercentage >= threshold) {
      if (!existingAlert) {
        store.alerts.push({
          id: randomUUID(),
          budgetId: budget.id,
          category: budget.category,
          month: budget.month,
          threshold,
          message: `Voce atingiu ${threshold}% do budget da categoria ${budget.category}.`,
          status: "ACTIVE",
          createdAt: new Date().toISOString()
        });
      }
    } else if (existingAlert) {
      store.alerts = store.alerts.filter((alert) => alert.id !== existingAlert.id);
    }
  }
}

function recalculateBudget(budget) {
  const plannedAmount = Number(budget.planned.amount);
  const consumedAmount = calculateConsumedAmount(budget.userId, budget.category, budget.month);
  const remainingAmount = Math.max(plannedAmount - consumedAmount, 0);
  const percentage = plannedAmount === 0 ? 0 : Number(((consumedAmount / plannedAmount) * 100).toFixed(2));

  budget.consumed = buildMoney(consumedAmount, budget.planned.currencyCode, budget.planned.currencySymbol);
  budget.remaining = buildMoney(remainingAmount, budget.planned.currencyCode, budget.planned.currencySymbol);
  budget.consumedPercentage = percentage;
  budget.thresholdStatus = determineThresholdStatus(percentage);
  budget.updatedAt = new Date().toISOString();

  syncBudgetAlerts(budget);

  return budget;
}

function recalculateBudgetsForTransaction(transaction) {
  if (transaction.transactionType !== "EXPENSE") {
    return;
  }

  const month = getMonthFromDate(transaction.transactionDate);
  const budgets = store.budgets.filter((budget) => {
    return budget.userId === transaction.userId && budget.category === transaction.category && budget.month === month;
  });

  budgets.forEach(recalculateBudget);
}

function createBudget(userId, payload) {
  const budget = {
    id: randomUUID(),
    userId,
    category: payload.category,
    month: payload.month,
    planned: buildMoney(payload.amount, payload.currencyCode, payload.currencySymbol),
    consumed: buildMoney(0, payload.currencyCode, payload.currencySymbol),
    remaining: buildMoney(payload.amount, payload.currencyCode, payload.currencySymbol),
    consumedPercentage: 0,
    thresholdStatus: "BELOW_50",
    updatedAt: new Date().toISOString()
  };

  store.budgets.push(budget);
  return recalculateBudget(budget);
}

function updateBudget(userId, budgetId, amount) {
  const budget = findBudgetById(userId, budgetId);
  if (!budget) {
    return null;
  }

  budget.planned = buildMoney(amount, budget.planned.currencyCode, budget.planned.currencySymbol);
  return recalculateBudget(budget);
}

function buildCategorySummary(userId, month) {
  return expenseCategories.map((category) => {
    const total = store.transactions
      .filter((transaction) => {
        return (
          transaction.userId === userId &&
          transaction.transactionType === "EXPENSE" &&
          transaction.category === category &&
          getMonthFromDate(transaction.transactionDate) === month
        );
      })
      .reduce((sum, transaction) => sum + Number(transaction.money.amount), 0);

    const budget = store.budgets.find(
      (item) => item.userId === userId && item.category === category && item.month === month
    );

    return {
      category,
      total: buildMoney(total, budget?.planned.currencyCode || "EUR", budget?.planned.currencySymbol || "€"),
      budget: budget ? budget.planned : undefined,
      consumedPercentage: budget ? budget.consumedPercentage : null
    };
  });
}

function getTotalByType(userId, month, transactionType) {
  return store.transactions
    .filter((transaction) => {
      return (
        transaction.userId === userId &&
        transaction.transactionType === transactionType &&
        getMonthFromDate(transaction.transactionDate) === month
      );
    })
    .reduce((sum, transaction) => sum + Number(transaction.money.amount), 0);
}

function getExpenseTotal(userId, month, category) {
  return store.transactions
    .filter((transaction) => {
      return (
        transaction.userId === userId &&
        transaction.transactionType === "EXPENSE" &&
        getMonthFromDate(transaction.transactionDate) === month &&
        (!category || transaction.category === category)
      );
    })
    .reduce((sum, transaction) => sum + Number(transaction.money.amount), 0);
}

function validateBudgetCategory(category) {
  return expenseCategories.includes(category);
}

function validatePositiveDecimal(value) {
  const numeric = toNumber(value);
  return Number.isFinite(numeric) && numeric >= 0;
}

module.exports = {
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
};
