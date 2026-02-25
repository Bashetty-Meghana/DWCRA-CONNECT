import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'entrepreneur' | 'buyer'>('entrepreneur');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (isSignUp && !fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          console.error('Sign up error:', error);
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message || 'Failed to create account. Please try again.',
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome!',
            description: 'Your account has been created successfully.',
          });
          navigate('/dashboard');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Sign in error:', error);
          toast({
            title: 'Sign in failed',
            description: error.message || 'Invalid email or password. Please try again.',
            variant: 'destructive',
          });
        } else {
          navigate('/dashboard');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4 pattern-dots">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <Card className="border-2 shadow-warm">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent mb-2">
              <span className="text-2xl font-bold text-white">DC</span>
            </div>
            <CardTitle className="font-heading text-2xl">
              {isSignUp ? 'Join DWCRA Connect' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? 'Start your entrepreneurship journey today'
                : 'Sign in to continue your journey'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={errors.fullName ? 'border-destructive' : ''}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-3">
                  <Label>I want to</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as 'entrepreneur' | 'buyer')}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Label
                      htmlFor="entrepreneur"
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        role === 'entrepreneur'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="entrepreneur" id="entrepreneur" className="sr-only" />
                      <span className="text-2xl">👩‍💼</span>
                      <span className="font-medium text-sm">Sell Products</span>
                      <span className="text-xs text-muted-foreground text-center">
                        I'm an entrepreneur
                      </span>
                    </Label>
                    <Label
                      htmlFor="buyer"
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        role === 'buyer'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <RadioGroupItem value="buyer" id="buyer" className="sr-only" />
                      <span className="text-2xl">🛒</span>
                      <span className="font-medium text-sm">Buy Products</span>
                      <span className="text-xs text-muted-foreground text-center">
                        I want to shop
                      </span>
                    </Label>
                  </RadioGroup>
                </div>
              )}

              <Button type="submit" variant="hero" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isSignUp ? (
                  <>Already have an account? <span className="font-semibold text-primary">Sign In</span></>
                ) : (
                  <>New here? <span className="font-semibold text-primary">Create Account</span></>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
