import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import {
  BookOpen,
  ShoppingBag,
  Briefcase,
  Wallet,
  ArrowRight,
  Users,
  Heart,
  Star,
  Sparkles,
  Landmark,
} from 'lucide-react';

export default function Index() {
  const { user, role, loading } = useAuth();

  const stats = [
    { value: '10,000+', label: 'Women Empowered' },
    { value: '₹5Cr+', label: 'Business Generated' },
    { value: '500+', label: 'Products Listed' },
    { value: '1,000+', label: 'Orders Placed' },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">

          <Link to="/" className="flex items-center gap-2">

            {/* 🌍 Logo */}
            <img
              src="/logo.png"
              alt="DWCRA Logo"
              className="h-10 w-10 object-contain"
            />

            <div>
              <span className="font-heading text-lg font-bold text-foreground">
                DWCRA Connect
              </span>
              <p className="text-xs text-muted-foreground">
                Rural Women Empowerment
              </p>
            </div>

          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="hero" asChild disabled={loading || !role}>
                <Link to={role === 'buyer' ? '/marketplace' : '/dashboard'}>
                  {role === 'buyer'
                    ? 'Go to Marketplace'
                    : 'Go to Dashboard'}
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">
            Empowering Rural Women Entrepreneurs
          </h1>
          <p className="text-muted-foreground mb-8">
            A complete platform to learn, sell, and grow micro-businesses.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container flex items-center justify-between">

          <div className="flex items-center gap-2">

            {/* 🌍 Footer Logo */}
            <img
              src="/logo.png"
              alt="DWCRA Logo"
              className="h-8 w-8 object-contain"
            />

            <span className="font-heading font-semibold">
              DWCRA Connect
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2024 DWCRA Connect. Empowering Women, Transforming Lives.
          </p>

        </div>
      </footer>

    </div>
  );
}