import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BudgetCategory as BudgetCategoryType, DEFAULT_CATEGORIES } from "./budget/types";
import { BudgetCategory } from "./budget/BudgetCategory";

export function BudgetTracker() {
  const [categories, setCategories] = useState<BudgetCategoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      // First, ensure we have an authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to view budget data",
          variant: "destructive",
        });
        return;
      }

      // Load existing categories for the user
      const { data: existingCategories, error: categoriesError } = await supabase
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
        `)
        .eq('user_id', user.id);

      if (categoriesError) throw categoriesError;

      if (!existingCategories?.length) {
        await createInitialBudget(user.id);
      } else {
        setCategories(
          existingCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            items: cat.budget_items,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading budget data:", error);
      toast({
        title: "Error",
        description: "Failed to load budget data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialBudget = async (userId: string) => {
    try {
      for (const category of DEFAULT_CATEGORIES) {
        // Create category with user_id
        const { data: categoryData, error: categoryError } = await supabase
          .from("budget_categories")
          .insert({ 
            name: category.name, 
            user_id: userId 
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Create budget items for this category
        const itemsToInsert = category.items.map((item) => ({
          ...item,
          category_id: categoryData.id,
        }));

        const { error: itemsError } = await supabase
          .from("budget_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }
      
      // Reload the budget data to show the new categories
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
        <BudgetCategory
          key={category.id}
          id={category.id}
          name={category.name}
          items={category.items}
          onUpdateAmount={(itemId, amount) =>
            updateItemAmount(category.id, itemId, amount)
          }
        />
      ))}
    </div>
  );
}