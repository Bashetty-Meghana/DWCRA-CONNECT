import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Calculator, IndianRupee, Percent, Clock, PiggyBank, Save } from 'lucide-react';

interface EMICalculatorProps {
  defaultLoanAmount?: number;
  defaultInterestRate?: number;
  defaultTenureMonths?: number;
  loanSchemeId?: string;
  onCalculate?: (emi: number, totalPayment: number, totalInterest: number) => void;
}

export default function EMICalculator({
  defaultLoanAmount = 100000,
  defaultInterestRate = 10,
  defaultTenureMonths = 36,
  loanSchemeId,
  onCalculate,
}: EMICalculatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loanAmount, setLoanAmount] = useState(defaultLoanAmount);
  const [interestRate, setInterestRate] = useState(defaultInterestRate);
  const [tenureMonths, setTenureMonths] = useState(defaultTenureMonths);
  const [saving, setSaving] = useState(false);

  const [monthlyEMI, setMonthlyEMI] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // EMI Calculation using standard formula: EMI = P × r × (1 + r)^n / ((1 + r)^n – 1)
  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenureMonths]);

  const calculateEMI = () => {
    const P = loanAmount;
    const r = interestRate / 12 / 100; // Monthly interest rate
    const n = tenureMonths;

    if (P <= 0 || r <= 0 || n <= 0) {
      setMonthlyEMI(0);
      setTotalPayment(0);
      setTotalInterest(0);
      return;
    }

    // EMI Formula: EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total = emi * n;
    const interest = total - P;

    setMonthlyEMI(Math.round(emi));
    setTotalPayment(Math.round(total));
    setTotalInterest(Math.round(interest));

    onCalculate?.(Math.round(emi), Math.round(total), Math.round(interest));
  };

  const saveCalculation = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to save calculations',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from('emi_calculations').insert({
        user_id: user.id,
        loan_scheme_id: loanSchemeId || null,
        loan_amount: loanAmount,
        interest_rate: interestRate,
        tenure_months: tenureMonths,
        monthly_emi: monthlyEMI,
        total_payment: totalPayment,
        total_interest: totalInterest,
      });

      if (error) throw error;

      toast({ title: 'Calculation saved! 💾' });
    } catch (error) {
      console.error('Error saving calculation:', error);
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Input Fields */}
      <div className="space-y-6">
        {/* Loan Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              Loan Amount
            </Label>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(loanAmount)}
            </span>
          </div>
          <Slider
            value={[loanAmount]}
            onValueChange={([value]) => setLoanAmount(value)}
            min={10000}
            max={5000000}
            step={10000}
            className="py-2"
          />
          <div className="flex gap-2">
            <Input
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              min={10000}
              max={10000000}
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-secondary" />
              Interest Rate (% per annum)
            </Label>
            <span className="text-sm font-semibold text-secondary">{interestRate}%</span>
          </div>
          <Slider
            value={[interestRate]}
            onValueChange={([value]) => setInterestRate(value)}
            min={1}
            max={25}
            step={0.25}
            className="py-2"
          />
          <Input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            min={1}
            max={30}
            step={0.1}
          />
        </div>

        {/* Tenure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-warning" />
              Loan Tenure
            </Label>
            <span className="text-sm font-semibold text-warning">
              {tenureMonths} months ({(tenureMonths / 12).toFixed(1)} years)
            </span>
          </div>
          <Slider
            value={[tenureMonths]}
            onValueChange={([value]) => setTenureMonths(value)}
            min={6}
            max={120}
            step={6}
            className="py-2"
          />
          <Input
            type="number"
            value={tenureMonths}
            onChange={(e) => setTenureMonths(Number(e.target.value))}
            min={1}
            max={360}
          />
        </div>
      </div>

      {/* Results */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Monthly EMI</p>
            <p className="text-4xl font-bold text-primary">{formatCurrency(monthlyEMI)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Payment</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(totalPayment)}</p>
            </div>
            <div className="p-4 rounded-xl bg-background/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Interest</p>
              <p className="text-xl font-bold text-destructive">{formatCurrency(totalInterest)}</p>
            </div>
          </div>

          {/* Interest Breakdown Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Principal: {((loanAmount / totalPayment) * 100).toFixed(1)}%</span>
              <span>Interest: {((totalInterest / totalPayment) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-muted flex">
              <div
                className="bg-primary transition-all duration-500"
                style={{ width: `${(loanAmount / totalPayment) * 100}%` }}
              />
              <div
                className="bg-destructive transition-all duration-500"
                style={{ width: `${(totalInterest / totalPayment) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={saveCalculation}
        disabled={saving || !monthlyEMI}
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Saving...' : 'Save This Calculation'}
      </Button>
    </div>
  );
}
