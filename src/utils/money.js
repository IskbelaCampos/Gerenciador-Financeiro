function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function formatMoney(amount, currencySymbol = "€") {
  return `${currencySymbol}${amount.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function buildMoney(amount, currencyCode, currencySymbol) {
  const numericAmount = toNumber(amount);
  return {
    amount: numericAmount.toFixed(2),
    currencyCode,
    currencySymbol,
    formatted: formatMoney(numericAmount, currencySymbol)
  };
}

module.exports = {
  toNumber,
  formatMoney,
  buildMoney
};
