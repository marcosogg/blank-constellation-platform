import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Euro, Lock, Unlock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

const BudgetTracker = () => {
  const navigate = useNavigate();
  const initialBudget = {
    'Housing & Utilities': {
      items: {
        'Rent': { budgeted: 0, actual: 0 },
        'Energy/Gas': { budgeted: 0, actual: 0 },
        'Internet': { budgeted: 0, actual: 0 },
        'Phone Plan': { budgeted: 0, actual: 0 },
      }
    },
    'Essential Living': {
      items: {
        'Groceries': { budgeted: 0, actual: 0 },
        'Pharmacy': { budgeted: 0, actual: 0 },
      }
    },
    'Transportation': {
      items: {
        'Monthly Transport Pass': { budgeted: 0, actual: 0 },
      }
    },
    'Food & Dining': {
      items: {
        'Eating Out': { budgeted: 0, actual: 0 },
        'Coffee & Snacks': { budgeted: 0, actual: 0 },
        'Food Delivery': { budgeted: 0, actual: 0 },
      }
    },
    'Technology & Services': {
      items: {
        'Online Subscriptions': { budgeted: 0, actual: 0 },
      }
    },
    'Personal Care': {
      items: {
        'Grooming': { budgeted: 0, actual: 0 },
      }
    },
    'Savings & Investment': {
      items: {
        'Emergency Fund': { budgeted: 0, actual: 0 },
        'Brazil Expenses': { budgeted: 0, actual: 0 },
      }
    }
  };

  const [budget, setBudget] = useState(initialBudget);
  const [lockedItems, setLockedItems] = useState<{ [key: string]: boolean }>({});
  const [income, setIncome] = useState(0);
  const [budgetName, setBudgetName] = useState("");
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [savedBudgets, setSavedBudgets] = useState<{
    [key: string]: { name: string; timestamp: number, data: any };
  }>({});

  useEffect(() => {
    loadSavedBudgets();
  }, []);

  useEffect(() => {
    if (selectedBudget && savedBudgets[selectedBudget]) {
      setBudget(savedBudgets[selectedBudget].data);
    }
  }, [selectedBudget, savedBudgets]);

  const handleValueChange = (category, item, value, type: 'budgeted' | 'actual') => {
    setBudget(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: {
          ...prev[category].items,
          [item]: {
            ...prev[category].items[item],
            [type]: parseFloat(value) || 0
          }
        }
      }
    }));
  };

  const handleLockToggle = (category, item) => {
    setLockedItems(prev => ({
      ...prev,
      [`${category}-${item}`]: !prev[`${category}-${item}`]
    }));
  };

  const handleIncomeChange = (event) => {
    setIncome(parseFloat(event.target.value) || 0);
  };

  const calculateTotals = () => {
    let totalBudgeted = 0;
    let totalActual = 0;
    let fixedTotal = 0;
    let variableTotal = 0;

    Object.values(budget).forEach(category => {
      Object.entries(category.items).forEach(([item, { budgeted, actual }]) => {
        const isLocked = lockedItems[`${category}-${item}`];
        totalBudgeted += budgeted;
        totalActual += actual;
        if (isLocked) {
          fixedTotal += actual;
        } else {
          variableTotal += actual;
        }
      });
    });

    return { totalBudgeted, totalActual, fixedTotal, variableTotal };
  };

  const calculateCategoryTotal = (items, type: 'budgeted' | 'actual') => {
    return Object.values(items).reduce((sum, item) => sum + item[type], 0);
  };

  const handleSaveBudget = () => {
    if (!budgetName) {
      toast({
        title: 'Error',
        description: 'Please enter a budget name.',
        variant: "destructive"
      });
      return;
    }

    const newBudget = {
      name: budgetName,
      timestamp: Date.now(),
      data: budget,
    };

    setSavedBudgets(prev => ({ ...prev, [budgetName]: newBudget }));
    saveBudgetToLocalStorage(budgetName, newBudget);
    toast({
      title: 'Success',
      description: 'Budget saved successfully.',
    });
    setBudgetName("");
  };

  const loadSavedBudgets = async () => {
    try {
      const saved = localStorage.getItem('savedBudgets');
      if (saved) {
        setSavedBudgets(JSON.parse(saved));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error loading saved budgets.',
        variant: "destructive"
      });
    }
  };

  const saveBudgetToLocalStorage = async (budgetName: string, budgetData: any) => {
    try {
      localStorage.setItem('savedBudgets', JSON.stringify({
        ...savedBudgets,
        [budgetName]: budgetData
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error saving budget.',
        variant: 'destructive',
      })
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const totals = calculateTotals();

  const renderProgressBar = (budgeted: number, actual: number) => {
    const progress = budgeted === 0 ? 0 : Math.min((actual / budgeted) * 100, 100);
    let color = 'bg-green-500';
    if (progress >= 90 && progress <= 100) {
      color = 'bg-yellow-500';
    } else if (progress > 100) {
      color = 'bg-red-500';
    }
    return (
      <Progress
        value={progress}
        className={`h-2 rounded-full ${color}`}
      />
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <Card className="w-full max-w-3xl mx-auto bg-white">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Euro className="w-6 h-6" />
              2025 Budget Tracker
            </CardTitle>
            <div className="ml-auto flex gap-2">
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
              <Input
                type="text"
                placeholder='Budget Name'
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
              />
              <Button onClick={handleSaveBudget} variant="outline">
                Save Budget
              </Button>
              <Select onValueChange={setSelectedBudget}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Budget" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(savedBudgets).map((key) => (
                    <SelectItem key={key} value={key}>
                      {savedBudgets[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-32">Monthly Income:</span>
                <Input
                  type="number"
                  value={income}
                  onChange={handleIncomeChange}
                  className="w-48"
                />
              </div>
              {Object.entries(budget).map(([category, { items }]) => {
                const categoryBudgetedTotal = calculateCategoryTotal(items, 'budgeted')
                const categoryActualTotal = calculateCategoryTotal(items, 'actual')
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <Tooltip>
                      <TooltipTrigger>
                        <h3 className="text-lg font-semibold mb-3 text-gray-700 hover:underline">{category}</h3>
                      </TooltipTrigger>
                      <TooltipContent>
                        Total Budgeted: €{categoryBudgetedTotal} - Total Actual: €{categoryActualTotal} - Remaining: €{categoryBudgetedTotal - categoryActualTotal}
                      </TooltipContent>
                    </Tooltip>
                    <div className="space-y-3">
                      {Object.entries(items).map(([item, { budgeted, actual }]) => {
                        const isLocked = lockedItems[`${category}-${item}`];
                        const remaining = budgeted - actual
                        return (
                          <div key={item} className="grid grid-cols-12 gap-4 items-center">
                            <div className="col-span-4 flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isLocked}
                                onChange={() => handleLockToggle(category, item)}
                              />
                              <span className="text-sm text-gray-600">{item}</span>
                              {isLocked ? (
                                <Lock className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Unlock className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="col-span-4">
                              <Label htmlFor={`budgeted-${category}-${item}`} className="text-sm">Budgeted</Label>
                              <Input
                                type="number"
                                id={`budgeted-${category}-${item}`}
                                value={budgeted}
                                onChange={(e) => handleValueChange(category, item, e.target.value, 'budgeted')}
                                className="w-full"
                                disabled={isLocked}
                              />
                              <Label htmlFor={`actual-${category}-${item}`} className="text-sm mt-2">Actual</Label>
                              <Input
                                type="number"
                                id={`actual-${category}-${item}`}
                                value={actual}
                                onChange={(e) => handleValueChange(category, item, e.target.value, 'actual')}
                                className="w-full mt-2"
                                disabled={isLocked}
                              />
                              <Tooltip>
                                <TooltipTrigger>
                                  {renderProgressBar(budgeted, actual)}
                                </TooltipTrigger>
                                <TooltipContent>
                                  Budgeted: €{budgeted} - Actual: €{actual} - Remaining: €{remaining}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            <div className="col-span-2">
                              <span className={`text-sm font-medium ${isLocked ? 'text-blue-600' : ''}`}>
                                €{actual}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <Badge variant="secondary" className={`${isLocked ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                {isLocked ? 'Fixed' : 'Variable'}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                      <div className="grid grid-cols-12 gap-4 pt-2 border-t mt-2">
                        <div className="col-span-4">
                          <span className="text-sm font-medium">Subtotal</span>
                        </div>
                        <div className="col-span-5" />
                        <div className="col-span-3">
                          <span className="text-sm font-medium">€{categoryActualTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 text-sm">
                    <span>Fixed Expenses:</span>
                    <span className="text-blue-600 font-medium">€{totals.fixedTotal}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <span>Variable Expenses:</span>
                    <span className="font-medium">€{totals.variableTotal}</span>
                  </div>
                  <div className="grid grid-cols-2 text-lg font-semibold border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span className={`${totals.totalActual > income ? 'text-red-600' : 'text-green-600'}`}>
                      €{totals.totalActual}
                      {totals.totalActual > income && (
                        <span className="text-sm ml-2">(€{(totals.totalActual - income).toFixed(2)} over budget)</span>
                      )}
                      {totals.totalActual <= income && (
                        <span className="text-sm ml-2">(€{(income - totals.totalActual).toFixed(2)} under budget)</span>
                      )}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Monthly Income: €{income}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default BudgetTracker;
