import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import dominosLogo from '@/assets/dominos-logo.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/camera', { replace: true });
      } else {
        setError('Login failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@demo.com');
    setPassword('demo');
    setIsLoading(true);
    
    try {
      const success = await login('demo@demo.com', 'demo');
      if (success) {
        navigate('/camera', { replace: true });
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 safe-area-top safe-area-bottom">
      <Card className="w-full max-w-sm border-border bg-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img src={dominosLogo} alt="Domino's Logo" className="h-20 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Pizza Analyzer</h1>
          <p className="text-sm text-muted-foreground">Quality training made simple</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                autoComplete="email"
                autoCapitalize="none"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 mt-4 text-base"
              onClick={handleDemoLogin}
              disabled={isLoading}
            >
              Try Demo
            </Button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            SSO integration ready • Contact IT for access
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
