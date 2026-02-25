import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Role-based navigation
  // NOTE: we intentionally do not render role-gated nav until `role` is loaded
  // to avoid a flash where buyers briefly see entrepreneur modules.
  const navLinks = (() => {
    if (!role) return [];

    if (role === 'buyer') {
      return [
        { href: '/marketplace', label: 'Marketplace' },
        { href: '/my-orders', label: 'My Orders' },
        { href: '/account', label: 'Account' },
      ];
    }

    // entrepreneur/admin
    return [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/learning', label: 'Learning' },
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/my-business', label: 'My Business' },
      { href: '/shg-groups', label: 'SHG Groups' },
      { href: '/finance', label: 'Finance' },
      { href: '/loans', label: 'Loans' },
    ];
  })();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <span className="text-xl font-bold text-white">DC</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-heading text-lg font-bold text-foreground">
              DWCRA Connect
            </span>
            <p className="text-xs text-muted-foreground">Rural Women Empowerment</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {user && role && (
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={profile?.profile_image_url || undefined} alt={profile?.full_name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {profile ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card" align="end">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {profile ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{profile?.full_name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{role}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
       {user && role && mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
