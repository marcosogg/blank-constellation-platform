export type BudgetItem = {
  id: string;
  name: string;
  amount: number;
  is_fixed: boolean;
  planned_amount: number;
  actual_amount: number;
};

export type BudgetCategory = {
  id: string;
  name: string;
  items: BudgetItem[];
};