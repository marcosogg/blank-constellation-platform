export type BudgetCategory = {
  id: string;
  name: string;
  items: BudgetItem[];
};

export type BudgetItem = {
  id: string;
  name: string;
  amount: number;
  is_fixed: boolean;
};

export const DEFAULT_CATEGORIES = [
  {
    name: "Housing & Utilities",
    items: [
      { name: "Rent/Mortgage", amount: 1500, is_fixed: true },
      { name: "Utilities", amount: 200, is_fixed: false },
    ],
  },
  {
    name: "Transportation",
    items: [
      { name: "Car Payment", amount: 300, is_fixed: true },
      { name: "Fuel", amount: 150, is_fixed: false },
    ],
  },
  {
    name: "Food & Groceries",
    items: [
      { name: "Groceries", amount: 400, is_fixed: false },
      { name: "Dining Out", amount: 200, is_fixed: false },
    ],
  },
];