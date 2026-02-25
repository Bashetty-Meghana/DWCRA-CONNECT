import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import {
  Landmark,
  Search,
  Filter,
  IndianRupee,
  Percent,
  Clock,
  Bookmark,
  BookmarkCheck,
  Calculator,
  ExternalLink,
  ChevronRight,
  Building2,
  Users,
  Target,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import EMICalculator from '@/components/EMICalculator';

interface LoanScheme {
  id: string;
  name: string;
  description: string | null;
  ministry: string | null;
  loan_amount_min: number | null;
  loan_amount_max: number | null;
  interest_rate: number;
  subsidy_percentage: number | null;
  tenure_months_min: number | null;
  tenure_months_max: number | null;
  eligibility: string | null;
  applicable_business_types: string[] | null;
  applicable_states: string[] | null;
  for_women: boolean;
  for_shg: boolean;
  application_url: string | null;
  documents_required: string | null;
}

export default function Loans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loanSchemes, setLoanSchemes] = useState<LoanScheme[]>([]);
  const [savedLoans, setSavedLoans] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState<LoanScheme | null>(null);
  const [emiDialogOpen, setEmiDialogOpen] = useState(false);
  const [selectedLoanForEMI, setSelectedLoanForEMI] = useState<LoanScheme | null>(null);

  useEffect(() => {
    fetchLoanSchemes();
    if (user) {
      fetchSavedLoans();
    }
  }, [user]);

  const fetchLoanSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_schemes')
        .select('*')
        .eq('is_active', true)
        .order('interest_rate');

      if (error) throw error;
      setLoanSchemes(data || []);
    } catch (error) {
      console.error('Error fetching loan schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_loan_schemes')
        .select('loan_scheme_id')
        .eq('user_id', user!.id);

      if (error) throw error;
      setSavedLoans(new Set(data?.map((s) => s.loan_scheme_id) || []));
    } catch (error) {
      console.error('Error fetching saved loans:', error);
    }
  };

  const toggleSaveLoan = async (loanId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to save loan schemes',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (savedLoans.has(loanId)) {
        await supabase
          .from('saved_loan_schemes')
          .delete()
          .eq('user_id', user.id)
          .eq('loan_scheme_id', loanId);
        setSavedLoans((prev) => {
          const next = new Set(prev);
          next.delete(loanId);
          return next;
        });
        toast({ title: 'Removed from saved loans' });
      } else {
        await supabase.from('saved_loan_schemes').insert({
          user_id: user.id,
          loan_scheme_id: loanId,
        });
        setSavedLoans((prev) => new Set(prev).add(loanId));
        toast({ title: 'Saved! ⭐', description: 'Loan scheme bookmarked' });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({ title: 'Error', description: 'Failed to save', variant: 'destructive' });
    }
  };

  const openEMICalculator = (scheme: LoanScheme) => {
    setSelectedLoanForEMI(scheme);
    setEmiDialogOpen(true);
    setSelectedScheme(null);
  };

  const businessTypes = [
    { value: 'tailoring', label: 'Tailoring' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'handicrafts', label: 'Handicrafts' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'food_processing', label: 'Food Processing' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'retail', label: 'Retail' },
    { value: 'beauty_parlor', label: 'Beauty Parlor' },
  ];

  const states = [
    'All India',
    'Karnataka',
    'Maharashtra',
    'Tamil Nadu',
    'Andhra Pradesh',
    'Telangana',
    'Uttar Pradesh',
    'Madhya Pradesh',
    'Rajasthan',
    'Gujarat',
    'Bihar',
    'West Bengal',
  ];

  const filteredSchemes = loanSchemes.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.ministry?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBusiness =
      businessTypeFilter === 'all' ||
      scheme.applicable_business_types?.includes(businessTypeFilter);

    const matchesState =
      stateFilter === 'all' ||
      scheme.applicable_states?.includes('All India') ||
      scheme.applicable_states?.includes(stateFilter);

    return matchesSearch && matchesBusiness && matchesState;
  });

  const formatAmount = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(0)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Government Loan Schemes 🏦
          </h1>
          <p className="text-muted-foreground">
            Explore loan schemes with interest rates, subsidies, and EMI calculator.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search loan schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Business Type" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All Business Types</SelectItem>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stateFilter} onValueChange={setStateFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="all">All States</SelectItem>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loan Schemes Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filteredSchemes.length === 0 ? (
          <Card className="p-12 text-center">
            <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No loan schemes found</h3>
            <p className="text-muted-foreground">Try adjusting your filters.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredSchemes.map((scheme) => {
              const isSaved = savedLoans.has(scheme.id);

              return (
                <Card
                  key={scheme.id}
                  className="card-warm cursor-pointer group"
                  onClick={() => setSelectedScheme(scheme)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        {scheme.for_women && (
                          <Badge className="bg-pink-100 text-pink-800" variant="secondary">
                            For Women
                          </Badge>
                        )}
                        {scheme.for_shg && (
                          <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                            SHG Eligible
                          </Badge>
                        )}
                        {scheme.subsidy_percentage && scheme.subsidy_percentage > 0 && (
                          <Badge className="bg-success/10 text-success" variant="secondary">
                            {scheme.subsidy_percentage}% Subsidy
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveLoan(scheme.id);
                        }}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary fill-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5" />
                        )}
                      </Button>
                    </div>

                    <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {scheme.name}
                    </h3>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {scheme.description}
                    </p>

                    {/* Key Details */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <Percent className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-lg font-bold text-primary">{scheme.interest_rate}%</p>
                        <p className="text-xs text-muted-foreground">Interest</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <IndianRupee className="h-4 w-4 mx-auto text-success mb-1" />
                        <p className="text-lg font-bold text-success">
                          {scheme.loan_amount_max ? formatAmount(scheme.loan_amount_max) : 'Varies'}
                        </p>
                        <p className="text-xs text-muted-foreground">Max Loan</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <Clock className="h-4 w-4 mx-auto text-secondary mb-1" />
                        <p className="text-lg font-bold text-secondary">
                          {scheme.tenure_months_max ? `${Math.round(scheme.tenure_months_max / 12)}Y` : 'Flex'}
                        </p>
                        <p className="text-xs text-muted-foreground">Max Tenure</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {scheme.ministry}
                      </span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Loan Detail Dialog */}
        <Dialog open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedScheme && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedScheme.for_women && (
                      <Badge className="bg-pink-100 text-pink-800" variant="secondary">
                        For Women
                      </Badge>
                    )}
                    {selectedScheme.for_shg && (
                      <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                        SHG Eligible
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="font-heading text-xl">
                    {selectedScheme.name}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedScheme.ministry && `By ${selectedScheme.ministry}`}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-center">
                      <Percent className="h-5 w-5 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-primary">{selectedScheme.interest_rate}%</p>
                      <p className="text-xs text-muted-foreground">Interest Rate</p>
                    </div>
                    {selectedScheme.subsidy_percentage && selectedScheme.subsidy_percentage > 0 && (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-success/10 to-success/5 text-center">
                        <Target className="h-5 w-5 mx-auto text-success mb-2" />
                        <p className="text-2xl font-bold text-success">{selectedScheme.subsidy_percentage}%</p>
                        <p className="text-xs text-muted-foreground">Subsidy</p>
                      </div>
                    )}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 text-center">
                      <IndianRupee className="h-5 w-5 mx-auto text-secondary mb-2" />
                      <p className="text-lg font-bold text-secondary">
                        {selectedScheme.loan_amount_min ? formatAmount(selectedScheme.loan_amount_min) : '-'}
                        {' - '}
                        {selectedScheme.loan_amount_max ? formatAmount(selectedScheme.loan_amount_max) : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">Loan Range</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 text-center">
                      <Clock className="h-5 w-5 mx-auto text-warning mb-2" />
                      <p className="text-lg font-bold text-warning">
                        {selectedScheme.tenure_months_min ? `${selectedScheme.tenure_months_min}` : '12'}
                        {' - '}
                        {selectedScheme.tenure_months_max ? `${selectedScheme.tenure_months_max}` : '84'} mo
                      </p>
                      <p className="text-xs text-muted-foreground">Tenure</p>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedScheme.description && (
                    <div>
                      <h4 className="font-semibold mb-2">About</h4>
                      <p className="text-muted-foreground">{selectedScheme.description}</p>
                    </div>
                  )}

                  {/* Eligibility */}
                  {selectedScheme.eligibility && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Eligibility
                      </h4>
                      <p className="text-muted-foreground">{selectedScheme.eligibility}</p>
                    </div>
                  )}

                  {/* Documents */}
                  {selectedScheme.documents_required && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-warning" />
                        Documents Required
                      </h4>
                      <p className="text-muted-foreground">{selectedScheme.documents_required}</p>
                    </div>
                  )}

                  {/* Applicable Business Types */}
                  {selectedScheme.applicable_business_types && selectedScheme.applicable_business_types.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Applicable Business Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedScheme.applicable_business_types.map((type) => (
                          <Badge key={type} variant="outline" className="capitalize">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Applicable States */}
                  {selectedScheme.applicable_states && selectedScheme.applicable_states.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Applicable States</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedScheme.applicable_states.map((state) => (
                          <Badge key={state} variant="outline">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="hero"
                      className="flex-1"
                      onClick={() => openEMICalculator(selectedScheme)}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate EMI
                    </Button>
                    <Button
                      variant={savedLoans.has(selectedScheme.id) ? 'secondary' : 'outline'}
                      onClick={() => toggleSaveLoan(selectedScheme.id)}
                    >
                      {savedLoans.has(selectedScheme.id) ? (
                        <>
                          <BookmarkCheck className="h-4 w-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    {selectedScheme.application_url && (
                      <Button variant="outline" asChild>
                        <a
                          href={selectedScheme.application_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Apply
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* EMI Calculator Dialog */}
        <Dialog open={emiDialogOpen} onOpenChange={setEmiDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">EMI Calculator</DialogTitle>
              <DialogDescription>
                {selectedLoanForEMI?.name}
              </DialogDescription>
            </DialogHeader>
            <EMICalculator
              defaultLoanAmount={selectedLoanForEMI?.loan_amount_max || 100000}
              defaultInterestRate={selectedLoanForEMI?.interest_rate || 10}
              defaultTenureMonths={selectedLoanForEMI?.tenure_months_max || 60}
              loanSchemeId={selectedLoanForEMI?.id}
            />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
