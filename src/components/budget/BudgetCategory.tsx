import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetItem } from "./BudgetItem";
import type { BudgetCategory as BudgetCategoryType } from "./types";

interface BudgetCategoryProps {
  category: BudgetCategoryType;
  onUpdateAmount: (categoryId: string, itemId: string, newAmount: number) => void;
}

export function BudgetCategory({ category, onUpdateAmount }: BudgetCategoryProps) {
  const totalPlanned = category.items.reduce((sum, item) => sum + item.planned_amount, 0);
  const totalActual = category.items.reduce((sum, item) => sum + (item.actual_amount || item.amount), 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center text-lg">
          <span>{category.name}</span>
          <div className="text-sm font-normal space-x-4">
            <span>Planned: ${totalPlanned}</span>
            <span>Actual: ${totalActual}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {category.items.map((item) => (
          <BudgetItem
            key={item.id}
            item={item}
            onUpdateAmount={(amount) => onUpdateAmount(category.id, item.id, amount)}
          />
        ))}
      </CardContent>
    </Card>
  );
}