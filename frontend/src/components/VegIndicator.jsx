import React from 'react';

/**
 * Standard Indian food safety dietary marker (Green square + dot for Veg, Brown/Red square + triangle for Non-Veg)
 */
export const VegIndicator = ({ isVegetarian, size = 'md' }) => {
  const isVeg = Boolean(isVegetarian);
  const sizeClasses = size === 'sm' ? 'w-3.5 h-3.5 p-0.5' : 'w-4 h-4 p-0.5';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center justify-center border rounded-[3px] bg-white dark:bg-slate-900 shrink-0 ${sizeClasses} ${
        isVeg ? 'border-emerald-600' : 'border-rose-700'
      }`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      {isVeg ? (
        <span className={`rounded-full bg-emerald-600 ${dotSize}`} />
      ) : (
        <span className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-rose-700" />
      )}
    </span>
  );
};

export default VegIndicator;
