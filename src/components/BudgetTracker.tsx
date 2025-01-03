import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

type BudgetCategory = {
  id: string;
  name: string;
  items: BudgetItem[];
};

type BudgetItem = {
  id: string;
  name: string;
  amount: number;
  is_fixed: boolean;
};

const DEFAULT_CATEGORIES = [
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

export function BudgetTracker() {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      const { data: existingCategories } = await supabase
        .from("budget_categories")
        .select(`
          id,
          name,
          budget_items (
            id,
            name,
            amount,
            is_fixed
          )
        `);

      if (!existingCategories?.length) {
        await createInitialBudget();
      } else {
        setCategories(
          existingCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            items: cat.budget_items,
          }))
        );
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading budget data:", error);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive",
      });
    }
  };

  const createInitialBudget = async () => {
    try {
      for (const category of DEFAULT_CATEGORIES) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("budget_categories")
          .insert({ name: category.name })
          .select()
          .single();

        if (categoryError) throw categoryError;

        const itemsToInsert = category.items.map((item) => ({
          ...item,
          category_id: categoryData.id,
        }));

        const { error: itemsError } = await supabase
          .from("budget_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }
      await loadBudgetData();
    } catch (error) {
      console.error("Error creating initial budget:", error);
      toast({
        title: "Error",
        description: "Failed to create initial budget",
        variant: "destructive",
      });
    }
  };

  const updateItemAmount = async (
    categoryId: string,
    itemId: string,
    newAmount: number
  ) => {
    try {
      const { error } = await supabase
        .from("budget_items")
        .update({ amount: newAmount })
        .eq("id", itemId);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, amount: newAmount } : item
              ),
            };
          }
          return cat;
        })
      );

      toast({
        title: "Success",
        description: "Budget amount updated",
      });
    } catch (error) {
      console.error("Error updating budget item:", error);
      toast({
        title: "Error",
        description: "Failed to update budget amount",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading budget data...</div>;
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.items.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {item.name}
                    {item.is_fixed && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Fixed)
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium">${item.amount}</span>
                </div>
                <Slider
                  defaultValue={[item.amount]}
                  max={item.amount * 2}
                  step={10}
                  disabled={item.is_fixed}
                  onValueChange={([value]) => {
                    updateItemAmount(category.id, item.id, value);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}