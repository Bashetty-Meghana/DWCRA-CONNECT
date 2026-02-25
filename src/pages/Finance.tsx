import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface Income {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  date: string;
}

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
}

export default function Finance() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        supabase
          .from('income')
          .select('*')
          .eq('user_id', user!.id)
          .order('date', { ascending: false }),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user!.id)
          .order('date', { ascending: false }),
      ]);

      if (incomeRes.data) setIncomes(incomeRes.data);
      if (expenseRes.data) setExpenses(expenseRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIncome = async () => {
    try {
      const { error } = await supabase.from('income').insert({
        user_id: user!.id,
        amount: parseFloat(incomeForm.amount),
        source: incomeForm.source,
        description: incomeForm.description || null,
        date: incomeForm.date,
      });

      if (error) throw error;

      toast({ title: 'Income added successfully' });
      setIncomeDialogOpen(false);
      setIncomeForm({
        amount: '',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      console.error('Error adding income:', error);
      toast({ title: 'Error', description: 'Failed to add income', variant: 'destructive' });
    }
  };

  const addExpense = async () => {
    try {
      const { error } = await supabase.from('expenses').insert({
        user_id: user!.id,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        description: expenseForm.description || null,
        date: expenseForm.date,
      });

      if (error) throw error;

      toast({ title: 'Expense added successfully' });
      setExpenseDialogOpen(false);
      setExpenseForm({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({ title: 'Error', description: 'Failed to add expense', variant: 'destructive' });
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      await supabase.from('income').delete().eq('id', id);
      toast({ title: 'Income deleted' });
      fetchData();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id);
      toast({ title: 'Expense deleted' });
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalIncome - totalExpenses;

  // Chart data
  const monthlyData = () => {
    const months: Record<string, { income: number; expense: number }> = {};
    
    incomes.forEach((i) => {
      const month = i.date.slice(0, 7);
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      months[month].income += Number(i.amount);
    });

    expenses.forEach((e) => {
      const month = e.date.slice(0, 7);
      if (!months[month]) months[month] = { income: 0, expense: 0 };
      months[month].expense += Number(e.amount);
    });

    return Object.entries(months)
      .sort()
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
        income: data.income,
        expense: data.expense,
      }));
  };

  const expenseByCategory = () => {
    const categories: Record<string, number> = {};
    expenses.forEach((e) => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
    });
    
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['hsl(24, 80%, 50%)', 'hsl(150, 30%, 45%)', 'hsl(45, 90%, 55%)', 'hsl(200, 70%, 50%)', 'hsl(350, 70%, 55%)'];

  const expenseCategories = [
    'Raw Materials',
    'Transportation',
    'Packaging',
    'Marketing',
    'Labor',
    'Rent',
    'Utilities',
    'Equipment',
    'Loan Repayment',
    'EMI Payment',
    'Interest Payment',
    'Other',
  ];

  const incomeSources = [
    'Product Sales',
    'Service Fee',
    'Marketplace Orders',
    'SHG Group Income',
    'Direct Sales',
    'Loan Received',
    'Subsidy Received',
    'Other',
  ];

  if (authLoading || !user) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Finance Tracker 💰
            </h1>
            <p className="text-muted-foreground">
              Track your business income and expenses.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIncomeDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
            <Button variant="outline" onClick={() => setExpenseDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
              <Card className="card-warm bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                      <p className="text-3xl font-bold text-success">
                        ₹{totalIncome.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-success/20">
                      <ArrowUpRight className="h-6 w-6 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-warm bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                      <p className="text-3xl font-bold text-destructive">
                        ₹{totalExpenses.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-destructive/20">
                      <ArrowDownRight className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`card-warm ${netProfit >= 0 ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20' : 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                      <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-primary' : 'text-warning'}`}>
                        ₹{netProfit.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${netProfit >= 0 ? 'bg-primary/20' : 'bg-warning/20'}`}>
                      <PiggyBank className={`h-6 w-6 ${netProfit >= 0 ? 'text-primary' : 'text-warning'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card className="card-warm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Monthly Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData()}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="income" fill="hsl(145, 65%, 42%)" name="Income" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" name="Expense" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-warm">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {expenseByCategory().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseByCategory()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {expenseByCategory().map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No expense data yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions */}
            <Tabs defaultValue="income">
              <TabsList className="mb-6">
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Income ({incomes.length})
                </TabsTrigger>
                <TabsTrigger value="expenses" className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Expenses ({expenses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="income">
                {incomes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No income recorded yet. Start tracking your earnings!</p>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incomes.map((income) => (
                          <TableRow key={income.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(income.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">{income.source}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {income.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-bold text-success">
                              +₹{Number(income.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => deleteIncome(income.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="expenses">
                {expenses.length === 0 ? (
                  <Card className="p-8 text-center">
                    <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No expenses recorded yet. Track your spending!</p>
                  </Card>
                ) : (
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(expense.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-medium">{expense.category}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {expense.description || '-'}
                            </TableCell>
                            <TableCell className="text-right font-bold text-destructive">
                              -₹{Number(expense.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => deleteExpense(expense.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Income Dialog */}
        <Dialog open={incomeDialogOpen} onOpenChange={setIncomeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Add Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="inc_amount">Amount (₹) *</Label>
                <Input
                  id="inc_amount"
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="inc_source">Source *</Label>
                <Select
                  value={incomeForm.source}
                  onValueChange={(value) => setIncomeForm({ ...incomeForm, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {incomeSources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inc_description">Description</Label>
                <Input
                  id="inc_description"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
              <div>
                <Label htmlFor="inc_date">Date</Label>
                <Input
                  id="inc_date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIncomeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="success"
                onClick={addIncome}
                disabled={!incomeForm.amount || !incomeForm.source}
              >
                Add Income
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Expense Dialog */}
        <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Add Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="exp_amount">Amount (₹) *</Label>
                <Input
                  id="exp_amount"
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="exp_category">Category *</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exp_description">Description</Label>
                <Input
                  id="exp_description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
              <div>
                <Label htmlFor="exp_date">Date</Label>
                <Input
                  id="exp_date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExpenseDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={addExpense}
                disabled={!expenseForm.amount || !expenseForm.category}
              >
                Add Expense
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
