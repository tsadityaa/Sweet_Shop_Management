import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { dummyCredentials } from '@/lib/dummy-data';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    const result = await login(data);
    setIsSubmitting(false);

    if (result.success) {
      console.log('🔐 Login successful! User:', result.user);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      
      // Small delay to ensure state updates and then navigate
      setTimeout(() => {
        if (result.user?.role === 'admin') {
          console.log('👨‍💼 Redirecting admin to /admin');
          navigate('/admin');
        } else {
          console.log('👤 Redirecting user to dashboard');
          navigate('/');
        }
      }, 200);
    } else {
      toast({
        title: 'Login failed',
        description: result.error || 'Invalid credentials.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
        <div className="max-w-md text-center">
          <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="font-display text-3xl font-bold mb-4">Sweet Shop</h2>
          <p className="text-muted-foreground">
            Discover our delicious collection of handcrafted sweets. 
            From artisan chocolates to traditional candies.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2 lg:hidden">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="font-display text-xl font-bold">Sweet Shop</span>
            </div>
            <CardTitle className="font-display text-2xl" data-testid="text-login-title">
              Welcome back
            </CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            {...field}
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                  data-testid="button-submit-login"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register" className="text-primary font-medium hover:underline" data-testid="link-register">
                Sign up
              </Link>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Demo Credentials:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><strong>Admin:</strong> {dummyCredentials.admin.email} / {dummyCredentials.admin.password}</p>
                <p><strong>User:</strong> {dummyCredentials.user.email} / {dummyCredentials.user.password}</p>
              </div>
            </div>

            {/* Admin Panel Instructions */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
                ✨ Access Admin Panel
              </h3>
              <ol className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Login with the admin credentials above</li>
                <li>After login, "Admin Panel" link appears in header</li>
                <li>Click it to manage inventory and sweets</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
