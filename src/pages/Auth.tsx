import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowUp, Gift } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'password'>('email');
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Capture referral code from URL
  const referralCode = searchParams.get('ref');

  useEffect(() => {
    // Store referral code in localStorage if present
    if (referralCode) {
      localStorage.setItem('referral_code', referralCode);
    }
  }, [referralCode]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setStep('password');
    }
  };

  const linkReferral = async (userId: string, userEmail: string) => {
    const storedCode = localStorage.getItem('referral_code');
    if (!storedCode) return;

    try {
      const { data, error } = await supabase.rpc('link_referral', {
        referral_code_param: storedCode,
        new_user_uuid: userId,
        new_user_email: userEmail
      });

      if (!error && data) {
        toast({
          title: "Parrainage activé ! 🎁",
          description: "Vous avez été parrainé. Publiez un site et passez Pro pour offrir 10 crédits à votre parrain !",
        });
      }
      
      // Clear the stored referral code
      localStorage.removeItem('referral_code');
    } catch (error) {
      console.error('Error linking referral:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erreur de connexion",
            description: error.message === 'Invalid login credentials' 
              ? "Email ou mot de passe incorrect"
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Bienvenue !",
            description: "Connexion réussie",
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Compte existant",
              description: "Un compte existe déjà avec cet email. Connectez-vous.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Erreur d'inscription",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          // Get the newly created user session
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user?.id) {
            await linkReferral(sessionData.session.user.id, email);
          }
          
          toast({
            title: "Compte créé ! 🎉",
            description: "Vous avez reçu 5 crédits gratuits pour commencer !",
          });
          navigate('/');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" />
          </div>

          {/* Referral Banner */}
          {referralCode && !isLogin && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
              <Gift className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm text-foreground">
                Vous avez été invité ! Créez votre compte pour profiter de Creali.
              </p>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-8">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-foreground font-medium transition-colors relative"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded">Last used</span>
            </button>

            <button 
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary hover:bg-secondary/80 border border-border rounded-xl text-foreground font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email Form */}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-secondary border-border h-12 rounded-xl"
                />
              </div>

              {/* Terms */}
              <p className="text-sm text-muted-foreground">
                By continuing, you agree to the{' '}
                <a href="#" className="text-foreground underline hover:no-underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-foreground underline hover:no-underline">Privacy Policy</a>.
              </p>

              <button
                type="submit"
                className="w-full py-3 bg-foreground text-background font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary border-border h-12 rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled
                  className="bg-secondary/50 border-border h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-secondary border-border h-12 rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-foreground text-background font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign in' : 'Create account'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            </form>
          )}

          {/* Toggle Login/Signup */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button 
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-foreground underline hover:no-underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-foreground underline hover:no-underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative overflow-hidden">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, hsl(220, 20%, 15%) 0%, hsl(220, 20%, 12%) 100%),
              radial-gradient(ellipse 80% 80% at 50% 80%, hsl(270, 70%, 50%, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse 60% 60% at 70% 70%, hsl(330, 80%, 50%, 0.3) 0%, transparent 40%),
              radial-gradient(ellipse 50% 50% at 30% 90%, hsl(200, 80%, 50%, 0.2) 0%, transparent 40%)
            `
          }}
        />
        
        {/* Mockup Prompt Input */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-foreground/95 rounded-2xl px-6 py-4 flex items-center justify-between shadow-2xl">
            <span className="text-background/80 text-lg">Ask Creali to build your landing page.</span>
            <button className="w-10 h-10 flex items-center justify-center bg-muted-foreground/20 rounded-full">
              <ArrowUp className="w-5 h-5 text-background" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;