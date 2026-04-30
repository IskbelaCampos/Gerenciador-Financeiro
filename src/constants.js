const categories = [
  { code: "mercado", label: "Mercado", transactionTypes: ["EXPENSE"] },
  { code: "lazer", label: "Lazer", transactionTypes: ["EXPENSE"] },
  { code: "saude", label: "Saude", transactionTypes: ["EXPENSE"] },
  { code: "outros", label: "Outros", transactionTypes: ["EXPENSE"] },
  { code: "carro", label: "Carro", transactionTypes: ["EXPENSE"] },
  { code: "combustivel", label: "Combustivel", transactionTypes: ["EXPENSE"] },
  { code: "restaurante", label: "Restaurante", transactionTypes: ["EXPENSE"] },
  { code: "contas", label: "Contas", transactionTypes: ["EXPENSE"] },
  { code: "shopping", label: "Shopping", transactionTypes: ["EXPENSE"] },
  { code: "renda", label: "Renda", transactionTypes: ["INCOME"] },
  { code: "poupanca", label: "Poupanca", transactionTypes: ["SAVINGS"] }
];

const expenseCategories = categories
  .filter((category) => category.transactionTypes.includes("EXPENSE"))
  .map((category) => category.code);

const transactionTypes = ["EXPENSE", "INCOME", "SAVINGS"];

module.exports = {
  categories,
  expenseCategories,
  transactionTypes
};
