import { Slider } from "@/components/ui/slider";
import type { BudgetItem as BudgetItemType } from "./types";

interface BudgetItemProps {
  item: BudgetItemType;
  onUpdateAmount: (amount: number) => void;
}

export function BudgetItem({ item, onUpdateAmount }: BudgetItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {item.name}
          {item.is_fixed && (
            <span className="ml-2 text-xs text-muted-foreground">(Fixed)</span>
          )}
        </span>
        <div className="text-sm space-x-4">
          <span>Planned: ${item.planned_amount}</span>
          <span>Actual: ${item.actual_amount || item.amount}</span>
        </div>
      </div>
      <Slider
        defaultValue={[item.amount]}
        max={Math.max(item.planned_amount * 2, 2000)}
        step={10}
        disabled={item.is_fixed}
        onValueChange={([value]) => onUpdateAmount(value)}
      />
    </div>
  );
}