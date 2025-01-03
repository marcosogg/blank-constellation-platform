import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BudgetCategory } from "./BudgetCategory";
import type { BudgetCategory as BudgetCategoryType } from "./types";

const DEFAULT_CATEGORIES = [
  {
    name: "Housing & Utilities",
    items: [
      { name: "Rent/Mortgage", amount: 1500, planned_amount: 1500, is_fixed: true },
      { name: "Utilities", amount: 200, planned_amount: 200, is_fixed: false },
      { name: "Internet", amount: 80, planned_amount: 80, is_fixed: true },
    ],
  },
  {
    name: "Transportation",
    items: [
      { name: "Car Payment", amount: 300, planned_amount: 300, is_fixed: true },
      { name: "Fuel", amount: 150, planned_amount: 200, is_fixed: false },
      { name: "Insurance", amount: 100, planned_amount: 100, is_fixed: true },
    ],
  },
  {
    name: "Food & Groceries",
    items: [
      { name: "Groceries", amount: 400, planned_amount: 500, is_fixed: false },
      { name: "Dining Out", amount: 200, planned_amount: 300, is_fixed: false },
    ],
  },
];

export function BudgetTracker() {
  const [categories, setCategories] = useState<BudgetCategoryType[]>([]);
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
          display_order,
          budget_items (
            id,
            name,
            amount,
            is_fixed,
            planned_amount,
            actual_amount,
            display_order
          )
        `)
        .order('display_order');

      if (!existingCategories?.length) {
        await createInitialBudget();
      } else {
        const sortedCategories = existingCategories.map(cat => ({
          ...cat,
          items: cat.budget_items.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
        }));
        setCategories(sortedCategories);
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
      for (const [categoryIndex, category] of DEFAULT_CATEGORIES.entries()) {
        const { data: categoryData, error: categoryError } = await supabase
          .from("budget_categories")
          .insert({ 
            name: category.name,
            display_order: categoryIndex 
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        const itemsToInsert = category.items.map((item, itemIndex) => ({
          ...item,
          category_id: categoryData.id,
          display_order: itemIndex
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
        .update({ actual_amount: newAmount })
        .eq("id", itemId);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, actual_amount: newAmount } : item
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
        <BudgetCategory
          key={category.id}
          category={category}
          onUpdateAmount={updateItemAmount}
        />
      ))}
    </div>
  );
}