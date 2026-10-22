/**
 * Formats a numerical amount into Indian Rupee (INR) currency representation.
 * Follows en-IN numbering convention (lakhs/crores separators).
 * Whole numbers omit fractional digits (e.g., 149 -> ₹149, 1299 -> ₹1,299).
 *
 * @param {number|string} amount
 * @returns {string} Formatted INR currency string
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  
  const hasDecimals = num % 1 !== 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: hasDecimals ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(num);
};

export const formatINR = formatCurrency;
export default formatCurrency;
