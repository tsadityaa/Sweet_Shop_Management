import { Link, useLocation } from 'wouter';
import { ShoppingBag, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold">Sweet Shop</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" data-testid="link-dashboard">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Shop
              </span>
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" data-testid="link-admin">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Admin Panel
                </span>
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                          {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2 cursor-pointer" data-testid="dropdown-admin">
                          <Settings className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer" data-testid="dropdown-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" data-testid="button-register">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col gap-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="block px-2 py-2 text-sm font-medium hover:bg-muted rounded-md" data-testid="mobile-link-shop">
                  Shop
                </span>
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <span className="block px-2 py-2 text-sm font-medium hover:bg-muted rounded-md" data-testid="mobile-link-admin">
                    Admin Panel
                  </span>
                </Link>
              )}
              {!isAuthenticated && (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <span className="block px-2 py-2 text-sm font-medium hover:bg-muted rounded-md" data-testid="mobile-link-login">
                      Login
                    </span>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <span className="block px-2 py-2 text-sm font-medium hover:bg-muted rounded-md" data-testid="mobile-link-register">
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
