import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  const features = [
    {
      icon: BookOpen,
      title: 'Learn & Grow',
      description: 'Access courses on business, finance, and digital skills designed for rural entrepreneurs.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: ShoppingBag,
      title: 'Sell Your Products',
      description: 'List your handmade products on our marketplace and reach buyers across India.',
      color: 'from-primary to-accent',
    },
    {
      icon: Briefcase,
      title: 'Manage Business',
      description: 'Track your products, orders, and business growth all in one place.',
      color: 'from-secondary to-success',
    },
    {
      icon: Users,
      title: 'SHG / DWCRA Groups',
      description: 'Create and manage Self Help Groups. Track group income, savings, and members.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Wallet,
      title: 'Track Finances',
      description: 'Record income and expenses. Track loan EMIs and understand your profits.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Landmark,
      title: 'Loan Schemes & EMI',
      description: 'Explore government loans with interest rates, subsidies, and EMI calculator.',
      color: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Community Support',
      description: 'Connect with other women entrepreneurs and share experiences.',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Women Empowered' },
    { value: '₹5Cr+', label: 'Business Generated' },
    { value: '500+', label: 'Products Listed' },
    { value: '1,000+', label: 'Orders Placed' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <span className="text-xl font-bold text-white">DC</span>
            </div>
            <div>
              <span className="font-heading text-lg font-bold text-foreground">
                DWCRA Connect
              </span>
              <p className="text-xs text-muted-foreground">Rural Women Empowerment</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="hero" asChild disabled={loading || !role}>
                <Link to={role === 'buyer' ? '/marketplace' : '/dashboard'}>
                  {role === 'buyer' ? 'Go to Marketplace' : 'Go to Dashboard'}
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
      <section className="relative overflow-hidden pattern-dots">
        <div className="container py-20 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Empowering Rural Women Entrepreneurs
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Turn Your Skills Into a{' '}
              <span className="text-gradient">Thriving Business</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A complete platform for rural women to learn, sell, and grow their micro-businesses.
              Access courses, marketplace, finance tools, and government schemes - all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild className="pulse-glow">
                <Link to="/auth?mode=signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/marketplace">Explore Marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-secondary/20 to-success/20 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and resources to help you start,
              manage, and grow your business.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="module-card h-full">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-heading text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
              Success Stories
            </h2>
            <p className="text-muted-foreground">
              Hear from women who have transformed their lives through our platform.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Sunita Devi',
                location: 'Madhya Pradesh',
                quote: 'I learned to use WhatsApp for business and now I sell my pickles to customers across 5 states!',
                role: 'Food Products',
              },
              {
                name: 'Kamala Rani',
                location: 'Rajasthan',
                quote: 'The government schemes section helped me get a ₹2 lakh loan for my handicrafts business.',
                role: 'Handicrafts',
              },
              {
                name: 'Meera Ben',
                location: 'Gujarat',
                quote: 'The finance tracker helped me understand my profits. My income has doubled in 6 months!',
                role: 'Textiles',
              },
            ].map((testimonial) => (
              <Card key={testimonial.name} className="card-warm p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <Card className="bg-gradient-to-r from-primary to-accent p-8 lg:p-12 text-center text-white overflow-hidden relative">
            <div className="relative z-10">
              <Heart className="h-12 w-12 mx-auto mb-4 float" />
              <h2 className="font-heading text-3xl lg:text-4xl font-bold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of rural women who are building successful businesses
                and achieving financial independence.
              </p>
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-white/90 font-bold"
                asChild
              >
                <Link to="/auth?mode=signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
              <span className="text-sm font-bold text-white">DC</span>
              </div>
              <span className="font-heading font-semibold text-foreground">
                DWCRA Connect
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Rural Women Micro-Business Support Platform. Empowering Women, Transforming Lives.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
