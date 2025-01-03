import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetItem } from "./types";
import { BudgetItemSlider } from "./BudgetItemSlider";

type BudgetCategoryProps = {
  id: string;
  name: string;
  items: BudgetItem[];
  onUpdateAmount: (itemId: string, newAmount: number) => void;
};

export function BudgetCategory({ id, name, items, onUpdateAmount }: BudgetCategoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <BudgetItemSlider
            key={item.id}
            item={item}
            onUpdateAmount={(amount) => onUpdateAmount(item.id, amount)}
          />
        ))}
      </CardContent>
    </Card>
  );
}