import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Euro, Lock, Unlock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';

const BudgetTracker = () => {
  const navigate = useNavigate();
  const initialBudget = {
    'Housing & Utilities': {
      items: {
        'Rent': { amount: 1000 },
        'Energy/Gas': { amount: 150 },
        'Internet': { amount: 40 },
        'Phone Plan': { amount: 25 },
      }
    },
    'Essential Living': {
      items: {
        'Groceries': { amount: 150 },
        'Pharmacy': { amount: 50 },
      }
    },
    'Transportation': {
      items: {
        'Monthly Transport Pass': { amount: 40 },
      }
    },
    'Food & Dining': {
      items: {
        'Eating Out': { amount: 300 },
        'Coffee & Snacks': { amount: 100 },
        'Food Delivery': { amount: 100 },
      }
    },
    'Technology & Services': {
      items: {
        'Online Subscriptions': { amount: 80 },
      }
    },
    'Personal Care': {
      items: {
        'Grooming': { amount: 60 },
      }
    },
    'Savings & Investment': {
      items: {
        'Emergency Fund': { amount: 250 },
        'Brazil Expenses': { amount: 200 },
      }
    }
  };

  const [budget, setBudget] = useState(initialBudget);
  const [lockedItems, setLockedItems] = useState<{ [key: string]: boolean }>({});
  const [income, setIncome] = useState(2700); // Initial income

  const handleValueChange = (category, item, value) => {
    setBudget(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        items: {
          ...prev[category].items,
          [item]: {
            ...prev[category].items[item],
            amount: parseFloat(value) || 0
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
    let total = 0;
    let fixedTotal = 0;
    let variableTotal = 0;

    Object.values(budget).forEach(category => {
      Object.entries(category.items).forEach(([item, { amount }]) => {
        const isLocked = lockedItems[`${category}-${item}`];
        total += amount;
        if (isLocked) {
          fixedTotal += amount;
        } else {
          variableTotal += amount;
        }
      });
    });

    return { total, fixedTotal, variableTotal };
  };

  const calculateCategoryTotal = (items) => {
    return Object.values(items).reduce((sum, item) => sum + item.amount, 0);
  };

  const totals = calculateTotals();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <Card className="w-full max-w-3xl mx-auto bg-white">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Euro className="w-6 h-6" />
            2025 Budget Tracker
          </CardTitle>
          <div className="ml-auto">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Income Input */}
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
              const categoryTotal = calculateCategoryTotal(items);
              return (
                <div key={category} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-gray-700">{category}</h3>
                  <div className="space-y-3">
                    {Object.entries(items).map(([item, { amount }]) => {
                      const isLocked = lockedItems[`${category}-${item}`];
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
                            <input
                              type="range"
                              min="0"
                              max={amount > 1000 ? amount * 2 : 1000}
                              value={amount}
                              step="10"
                              onChange={(e) => handleValueChange(category, item, Math.round(e.target.value / 10) * 10)}
                              className={`w-full ${isLocked ? 'accent-blue-500' : 'accent-gray-500'}`}
                              disabled={isLocked}
                            />
                          </div>
                          <div className="col-span-2">
                            <span className={`text-sm font-medium ${isLocked ? 'text-blue-600' : ''}`}>
                              €{amount}
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
                        <span className="text-sm font-medium">€{categoryTotal}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Budget Summary */}
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
                  <span className={`${totals.total > income ? 'text-red-600' : 'text-green-600'}`}>
                    €{totals.total}
                    {totals.total > income && (
                      <span className="text-sm ml-2">(€{(totals.total - income).toFixed(2)} over budget)</span>
                    )}
                    {totals.total <= income && (
                      <span className="text-sm ml-2">(€{(income - totals.total).toFixed(2)} under budget)</span>
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
  );
};

export default BudgetTracker;
