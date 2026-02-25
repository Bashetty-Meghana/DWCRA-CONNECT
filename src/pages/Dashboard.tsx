import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  BookOpen,
  ShoppingBag,
  Briefcase,
  Wallet,
  TrendingUp,
  ArrowRight,
  Users,
  Star,
  Package,
  Landmark,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  coursesCompleted: number;
  totalCourses: number;
  totalProducts: number;
  totalOrders: number;
  totalIncome: number;
  totalExpenses: number;
}

export default function Dashboard() {
  const { user, profile, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Buyers should not use the dashboard (acts like a regular e-commerce app)
  useEffect(() => {
    if (!authLoading && user && role === 'buyer') {
      navigate('/marketplace', { replace: true });
    }
  }, [authLoading, user, role, navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch courses count
      const { count: totalCourses } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch completed courses
      const { count: coursesCompleted } = await supabase
        .from('learning_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_completed', true);

      // Fetch products (for entrepreneurs)
      const { data: businessData } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let totalProducts = 0;
      let totalOrders = 0;

      if (businessData) {
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessData.id);
        
        totalProducts = productCount || 0;

        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', businessData.id);
        
        totalOrders = orderCount || 0;
      }

      // Fetch income
      const { data: incomeData } = await supabase
        .from('income')
        .select('amount')
        .eq('user_id', user!.id);
      
      const totalIncome = incomeData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      // Fetch expenses
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user!.id);
      
      const totalExpenses = expenseData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

      setStats({
        coursesCompleted: coursesCompleted || 0,
        totalCourses: totalCourses || 0,
        totalProducts,
        totalOrders,
        totalIncome,
        totalExpenses,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Avoid flashing entrepreneur modules while role is still loading
  if (authLoading || !user || !role) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const modules = [
    {
      title: 'Learning Center',
      description: 'Develop new skills with our courses',
      icon: BookOpen,
      href: '/learning',
      color: 'from-blue-500 to-blue-600',
      stat: stats ? `${stats.coursesCompleted}/${stats.totalCourses} courses` : 'Loading...',
      forBuyer: false,
    },
    {
      title: 'Marketplace',
      description: 'Buy & sell rural products',
      icon: ShoppingBag,
      href: '/marketplace',
      color: 'from-primary to-accent',
      stat: 'Explore products',
      forBuyer: true,
    },
    {
      title: 'My Orders',
      description: 'Track your orders',
      icon: Package,
      href: '/my-orders',
      color: 'from-indigo-500 to-purple-500',
      stat: 'View orders',
      forBuyer: true,
    },
    {
      title: 'My Business',
      description: 'Manage your products & orders',
      icon: Briefcase,
      href: '/my-business',
      color: 'from-secondary to-success',
      stat: stats ? `${stats.totalProducts} products` : 'Loading...',
      forBuyer: false,
    },
    {
      title: 'SHG Groups',
      description: 'Manage Self Help Groups',
      icon: Users,
      href: '/shg-groups',
      color: 'from-purple-500 to-pink-500',
      stat: 'Collaborate with women',
      forBuyer: false,
    },
    {
      title: 'Finance Tracker',
      description: 'Track income & expenses',
      icon: Wallet,
      href: '/finance',
      color: 'from-amber-500 to-orange-500',
      stat: stats ? `₹${(stats.totalIncome - stats.totalExpenses).toLocaleString()} net` : 'Loading...',
      forBuyer: false,
    },
    {
      title: 'Loan Schemes',
      description: 'Explore loans & EMI calculator',
      icon: Landmark,
      href: '/loans',
      color: 'from-teal-500 to-cyan-500',
      stat: 'Calculate EMI',
      forBuyer: false,
    },
  ];

  // Filter modules based on role
  const filteredModules = role === 'buyer' 
    ? modules.filter(m => m.forBuyer)
    : modules;

  const quickStats = [
    {
      label: 'Courses Completed',
      value: stats?.coursesCompleted || 0,
      icon: Star,
      color: 'text-blue-500',
    },
    {
      label: 'Products Listed',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-primary',
    },
    {
      label: 'Orders Received',
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'text-secondary',
    },
    {
      label: 'Net Earnings',
      value: `₹${((stats?.totalIncome || 0) - (stats?.totalExpenses || 0)).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Namaste, {profile?.full_name?.split(' ')[0] || 'Friend'}! 🙏
          </h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard. Let's grow your business today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label} className="card-warm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-16" /> : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Module Cards */}
        <h2 className="font-heading text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredModules.map((module) => (
            <Link key={module.href} to={module.href}>
              <Card className="module-card h-full group">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-2`}
                >
                  <module.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="font-heading text-lg">{module.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{module.description}</p>
                <div className="mt-auto pt-4 flex items-center justify-between w-full">
                  <span className="text-xs font-medium text-primary">{module.stat}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Role-based Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg mb-1">
                  {role === 'entrepreneur' ? 'Grow Your Business' : 'Start Shopping'}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {role === 'entrepreneur'
                    ? 'Add your products to the marketplace and start receiving orders from buyers across India.'
                    : 'Explore handmade products from rural women entrepreneurs and support their businesses.'}
                </p>
                <Button variant="hero" size="sm" asChild>
                  <Link to={role === 'entrepreneur' ? '/my-business' : '/marketplace'}>
                    {role === 'entrepreneur' ? 'Add Products' : 'Browse Products'}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
