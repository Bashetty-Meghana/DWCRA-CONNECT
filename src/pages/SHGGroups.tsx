import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Plus,
  Trash2,
  Wallet,
  PiggyBank,
  TrendingUp,
  MapPin,
  Crown,
  UserPlus,
  Eye,
  IndianRupee,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type ShgBusinessType = 'tailoring' | 'dairy' | 'handicrafts' | 'agriculture' | 'food_processing' | 'textiles' | 'poultry' | 'fishery' | 'beauty_parlor' | 'retail' | 'other';
type ShgMemberRole = 'leader' | 'treasurer' | 'secretary' | 'member';

interface SHGGroup {
  id: string;
  name: string;
  village: string;
  district: string | null;
  state: string | null;
  business_type: ShgBusinessType;
  description: string | null;
  leader_user_id: string;
  is_active: boolean;
  created_at: string;
}

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: ShgMemberRole;
  full_name: string;
  phone: string | null;
  joined_at: string;
  is_active: boolean;
}

interface GroupIncome {
  id: string;
  amount: number;
  source: string;
  description: string | null;
  date: string;
}

interface GroupSavings {
  id: string;
  amount: number;
  contributor_name: string | null;
  description: string | null;
  date: string;
}

export default function SHGGroups() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [groups, setGroups] = useState<SHGGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SHGGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [income, setIncome] = useState<GroupIncome[]>([]);
  const [savings, setSavings] = useState<GroupSavings[]>([]);
  const [loading, setLoading] = useState(true);

  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [addSavingsOpen, setAddSavingsOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<SHGGroup | null>(null);

  const [groupForm, setGroupForm] = useState({
    name: '',
    village: '',
    district: '',
    state: '',
    business_type: 'other' as ShgBusinessType,
    description: '',
  });

  const [memberForm, setMemberForm] = useState({
    full_name: '',
    phone: '',
    role: 'member' as ShgMemberRole,
  });

  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [savingsForm, setSavingsForm] = useState({
    amount: '',
    contributor_name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Buyers should not access SHG tooling
  useEffect(() => {
    if (!authLoading && user && role === 'buyer') {
      navigate('/marketplace', { replace: true });
    }
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('shg_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId: string) => {
    try {
      const [membersRes, incomeRes, savingsRes] = await Promise.all([
        supabase.from('shg_group_members').select('*').eq('group_id', groupId).eq('is_active', true),
        supabase.from('shg_group_income').select('*').eq('group_id', groupId).order('date', { ascending: false }),
        supabase.from('shg_group_savings').select('*').eq('group_id', groupId).order('date', { ascending: false }),
      ]);

      if (membersRes.data) setMembers(membersRes.data);
      if (incomeRes.data) setIncome(incomeRes.data);
      if (savingsRes.data) setSavings(savingsRes.data);
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  const createGroup = async () => {
    if (!user) return;
    try {
      if (!groupForm.name.trim() || !groupForm.village.trim()) {
        toast({
          title: 'Missing details',
          description: 'Please enter Group Name and Village.',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase
        .from('shg_groups')
        .insert({
          ...groupForm,
          leader_user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the leader as a member
      await supabase.from('shg_group_members').insert({
        group_id: data.id,
        user_id: user.id,
        full_name: 'Group Leader',
        role: 'leader',
      });

      toast({ title: 'Group created successfully! 🎉' });
      setCreateGroupOpen(false);
      setGroupForm({ name: '', village: '', district: '', state: '', business_type: 'other', description: '' });
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: 'Error', description: 'Failed to create group', variant: 'destructive' });
    }
  };

  const addMember = async () => {
    if (!selectedGroup || !user) return;
    try {
      const isLeader = selectedGroup.leader_user_id === user.id;
      if (!isLeader) {
        toast({
          title: 'Not allowed',
          description: 'Only the group leader can add members.',
          variant: 'destructive',
        });
        return;
      }

      if (!memberForm.full_name.trim()) {
        toast({
          title: 'Missing name',
          description: 'Please enter member full name.',
          variant: 'destructive',
        });
        return;
      }

      // Generate a unique ID for external members (non-app users)
      // Using crypto.randomUUID() for unique member identification
      const memberId = crypto.randomUUID();
      
      const { error } = await supabase.from('shg_group_members').insert({
        group_id: selectedGroup.id,
        user_id: memberId, // Unique ID for each external member
        full_name: memberForm.full_name,
        phone: memberForm.phone || null,
        role: memberForm.role,
      });

      if (error) throw error;

      toast({ title: 'Member added successfully! 🎉' });
      setAddMemberOpen(false);
      setMemberForm({ full_name: '', phone: '', role: 'member' });
      fetchGroupDetails(selectedGroup.id);
    } catch (error) {
      console.error('Error adding member:', error);
      toast({ title: 'Error', description: 'Failed to add member', variant: 'destructive' });
    }
  };

  const addIncome = async () => {
    if (!selectedGroup || !user) return;
    try {
      const isLeader = selectedGroup.leader_user_id === user.id;
      if (!isLeader) {
        toast({
          title: 'Not allowed',
          description: 'Only the group leader can record income.',
          variant: 'destructive',
        });
        return;
      }

      const amount = Number(incomeForm.amount);
      if (!Number.isFinite(amount) || amount <= 0 || !incomeForm.source.trim()) {
        toast({
          title: 'Invalid income',
          description: 'Please enter a valid amount and income source.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('shg_group_income').insert({
        group_id: selectedGroup.id,
        amount,
        source: incomeForm.source.trim(),
        description: incomeForm.description || null,
        date: incomeForm.date,
        recorded_by: user.id,
      });

      if (error) throw error;

      toast({ title: 'Income recorded!' });
      setAddIncomeOpen(false);
      setIncomeForm({ amount: '', source: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchGroupDetails(selectedGroup.id);
    } catch (error) {
      console.error('Error adding income:', error);
      toast({ title: 'Error', description: 'Failed to add income', variant: 'destructive' });
    }
  };

  const addSavings = async () => {
    if (!selectedGroup || !user) return;
    try {
      const isLeader = selectedGroup.leader_user_id === user.id;
      if (!isLeader) {
        toast({
          title: 'Not allowed',
          description: 'Only the group leader can record savings.',
          variant: 'destructive',
        });
        return;
      }

      const amount = Number(savingsForm.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        toast({
          title: 'Invalid savings',
          description: 'Please enter a valid savings amount.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('shg_group_savings').insert({
        group_id: selectedGroup.id,
        amount,
        contributor_name: savingsForm.contributor_name || null,
        description: savingsForm.description || null,
        date: savingsForm.date,
      });

      if (error) throw error;

      toast({ title: 'Savings recorded!' });
      setAddSavingsOpen(false);
      setSavingsForm({ amount: '', contributor_name: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchGroupDetails(selectedGroup.id);
    } catch (error) {
      console.error('Error adding savings:', error);
      toast({ title: 'Error', description: 'Failed to add savings', variant: 'destructive' });
    }
  };

  const openGroupDetail = (group: SHGGroup) => {
    setSelectedGroup(group);
    fetchGroupDetails(group.id);
    setDetailOpen(true);
  };

  const deleteGroup = async () => {
    if (!groupToDelete || !user) return;
    
    const isLeader = groupToDelete.leader_user_id === user.id;
    if (!isLeader) {
      toast({
        title: 'Not allowed',
        description: 'Only the group leader can delete the group.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Delete related data first
      await Promise.all([
        supabase.from('shg_group_members').delete().eq('group_id', groupToDelete.id),
        supabase.from('shg_group_income').delete().eq('group_id', groupToDelete.id),
        supabase.from('shg_group_savings').delete().eq('group_id', groupToDelete.id),
      ]);

      // Delete the group
      const { error } = await supabase
        .from('shg_groups')
        .delete()
        .eq('id', groupToDelete.id);

      if (error) throw error;

      toast({ title: 'Group deleted successfully' });
      setDeleteGroupOpen(false);
      setGroupToDelete(null);
      setDetailOpen(false);
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({ title: 'Error', description: 'Failed to delete group', variant: 'destructive' });
    }
  };

  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalSavings = savings.reduce((sum, s) => sum + Number(s.amount), 0);

  const businessTypes = [
    { value: 'tailoring', label: 'Tailoring' },
    { value: 'dairy', label: 'Dairy' },
    { value: 'handicrafts', label: 'Handicrafts' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'food_processing', label: 'Food Processing' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'poultry', label: 'Poultry' },
    { value: 'fishery', label: 'Fishery' },
    { value: 'beauty_parlor', label: 'Beauty Parlor' },
    { value: 'retail', label: 'Retail Shop' },
    { value: 'other', label: 'Other' },
  ];

  const memberRoles = [
    { value: 'leader', label: 'Leader' },
    { value: 'treasurer', label: 'Treasurer' },
    { value: 'secretary', label: 'Secretary' },
    { value: 'member', label: 'Member' },
  ];

  const incomeSources = [
    'Product Sales',
    'Marketplace Orders',
    'Group Business',
    'Interest Earned',
    'Government Subsidy',
    'Other',
  ];

  if (authLoading || !user || !role || role === 'buyer') {
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
              SHG / DWCRA Groups 👩‍👩‍👧‍👧
            </h1>
            <p className="text-muted-foreground">
              Manage your Self Help Groups, track income, savings, and members.
            </p>
          </div>
          <Button onClick={() => setCreateGroupOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Groups Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first Self Help Group to start collaborating with other women entrepreneurs.
            </p>
            <Button onClick={() => setCreateGroupOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <Card
                key={group.id}
                className="card-warm cursor-pointer group"
                onClick={() => openGroupDetail(group)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {businessTypes.find((t) => t.value === group.business_type)?.label || 'Other'}
                    </Badge>
                  </div>

                  <h3 className="font-heading text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    {group.village}
                    {group.district && `, ${group.district}`}
                  </div>

                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {group.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(group.created_at).toLocaleDateString()}
                    </span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Group Dialog */}
        <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Create New SHG Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="e.g., Shakti Mahila SHG"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Input
                    id="village"
                    value={groupForm.village}
                    onChange={(e) => setGroupForm({ ...groupForm, village: e.target.value })}
                    placeholder="Village name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={groupForm.district}
                    onChange={(e) => setGroupForm({ ...groupForm, district: e.target.value })}
                    placeholder="District"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={groupForm.state}
                    onChange={(e) => setGroupForm({ ...groupForm, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type</Label>
                  <Select
                    value={groupForm.business_type}
                    onValueChange={(value: ShgBusinessType) =>
                      setGroupForm({ ...groupForm, business_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card">
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Brief description of group activities"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateGroupOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createGroup}
                disabled={!groupForm.name || !groupForm.village}
              >
                Create Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Group Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedGroup && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="font-heading text-xl">{selectedGroup.name}</DialogTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {selectedGroup.village}
                        {selectedGroup.district && `, ${selectedGroup.district}`}
                        {selectedGroup.state && `, ${selectedGroup.state}`}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 my-6">
                  <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                    <CardContent className="p-4 text-center">
                      <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                      <p className="text-2xl font-bold text-primary">{members.length}</p>
                      <p className="text-xs text-muted-foreground">Members</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto text-success mb-2" />
                      <p className="text-2xl font-bold text-success">₹{totalIncome.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Income</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                    <CardContent className="p-4 text-center">
                      <PiggyBank className="h-8 w-8 mx-auto text-secondary mb-2" />
                      <p className="text-2xl font-bold text-secondary">₹{totalSavings.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Total Savings</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="members">
                  <TabsList className="mb-4">
                    <TabsTrigger value="members" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Members
                    </TabsTrigger>
                    <TabsTrigger value="income" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Income
                    </TabsTrigger>
                    <TabsTrigger value="savings" className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4" />
                      Savings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="members">
                    <div className="flex justify-end mb-4">
                      <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </Button>
                    </div>
                    {members.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No members yet</p>
                      </Card>
                    ) : (
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Joined</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {members.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                  {member.role === 'leader' && <Crown className="h-4 w-4 text-warning" />}
                                  {member.full_name}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">{member.role}</Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{member.phone || '-'}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {new Date(member.joined_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="income">
                    <div className="flex justify-end mb-4">
                      <Button size="sm" onClick={() => setAddIncomeOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Income
                      </Button>
                    </div>
                    {income.length === 0 ? (
                      <Card className="p-8 text-center">
                        <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No income recorded yet</p>
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
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {income.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium">{item.source}</TableCell>
                                <TableCell className="text-muted-foreground">{item.description || '-'}</TableCell>
                                <TableCell className="text-right font-bold text-success">
                                  +₹{Number(item.amount).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="savings">
                    <div className="flex justify-end mb-4">
                      <Button size="sm" onClick={() => setAddSavingsOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Savings
                      </Button>
                    </div>
                    {savings.length === 0 ? (
                      <Card className="p-8 text-center">
                        <PiggyBank className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No savings recorded yet</p>
                      </Card>
                    ) : (
                      <Card>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Contributor</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {savings.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium">{item.contributor_name || 'Group'}</TableCell>
                                <TableCell className="text-muted-foreground">{item.description || '-'}</TableCell>
                                <TableCell className="text-right font-bold text-secondary">
                                  +₹{Number(item.amount).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Delete Group Button - Only for Leader */}
                {selectedGroup && selectedGroup.leader_user_id === user?.id && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        setGroupToDelete(selectedGroup);
                        setDeleteGroupOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </Button>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Group Confirmation */}
        <AlertDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete SHG Group?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{groupToDelete?.name}" including all members, income records, and savings. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setGroupToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Delete Group
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Member Dialog */}
        <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Group Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member_name">Full Name *</Label>
                <Input
                  id="member_name"
                  value={memberForm.full_name}
                  onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                  placeholder="Member's full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member_phone">Phone</Label>
                <Input
                  id="member_phone"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member_role">Role</Label>
                <Select
                  value={memberForm.role}
                  onValueChange={(value: ShgMemberRole) => setMemberForm({ ...memberForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {memberRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Cancel</Button>
              <Button onClick={addMember} disabled={!memberForm.full_name}>Add Member</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Income Dialog */}
        <Dialog open={addIncomeOpen} onOpenChange={setAddIncomeOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Group Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="income_amount">Amount (₹) *</Label>
                <Input
                  id="income_amount"
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income_source">Source *</Label>
                <Select
                  value={incomeForm.source}
                  onValueChange={(value) => setIncomeForm({ ...incomeForm, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {incomeSources.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income_date">Date</Label>
                <Input
                  id="income_date"
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="income_description">Description</Label>
                <Input
                  id="income_description"
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="Optional details"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddIncomeOpen(false)}>Cancel</Button>
              <Button onClick={addIncome} disabled={!incomeForm.amount || !incomeForm.source}>Add Income</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Savings Dialog */}
        <Dialog open={addSavingsOpen} onOpenChange={setAddSavingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Group Savings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="savings_amount">Amount (₹) *</Label>
                <Input
                  id="savings_amount"
                  type="number"
                  value={savingsForm.amount}
                  onChange={(e) => setSavingsForm({ ...savingsForm, amount: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings_contributor">Contributor Name</Label>
                <Input
                  id="savings_contributor"
                  value={savingsForm.contributor_name}
                  onChange={(e) => setSavingsForm({ ...savingsForm, contributor_name: e.target.value })}
                  placeholder="Member name or 'All Members'"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings_date">Date</Label>
                <Input
                  id="savings_date"
                  type="date"
                  value={savingsForm.date}
                  onChange={(e) => setSavingsForm({ ...savingsForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings_description">Description</Label>
                <Input
                  id="savings_description"
                  value={savingsForm.description}
                  onChange={(e) => setSavingsForm({ ...savingsForm, description: e.target.value })}
                  placeholder="e.g., Monthly contribution"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddSavingsOpen(false)}>Cancel</Button>
              <Button onClick={addSavings} disabled={!savingsForm.amount}>Add Savings</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
