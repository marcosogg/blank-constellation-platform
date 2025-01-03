import { Slider } from "@/components/ui/slider";
import { BudgetItem } from "./types";

type BudgetItemSliderProps = {
  item: BudgetItem;
  onUpdateAmount: (amount: number) => void;
};

export function BudgetItemSlider({ item, onUpdateAmount }: BudgetItemSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {item.name}
          {item.is_fixed && (
            <span className="ml-2 text-xs text-muted-foreground">(Fixed)</span>
          )}
        </span>
        <span className="text-sm font-medium">${item.amount}</span>
      </div>
      <Slider
        defaultValue={[item.amount]}
        max={item.amount * 2}
        step={10}
        disabled={item.is_fixed}
        onValueChange={([value]) => onUpdateAmount(value)}
      />
    </div>
  );
}