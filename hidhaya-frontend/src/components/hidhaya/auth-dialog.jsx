import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useHidhayaStore } from '@/store/hidhaya-store';
import { Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AuthDialog() {
  const { showAuthDialog, setShowAuthDialog, setUser, setUsage, setLimitReached } = useHidhayaStore();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setLoading(false);
  };

  const handleGuestContinue = async () => {
    setLoading(true);
    try {
      let guestId = '';
      if (typeof window !== 'undefined') {
        guestId = localStorage.getItem('hidhaya_guest_id') || crypto.randomUUID();
        localStorage.setItem('hidhaya_guest_id', guestId);
      }

      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId }),
      });

      const data = await res.json();
      if (data._id || data.guestId) {
        setUser(data);
        // Fetch usage
        const usageRes = await fetch(`/api/chat/usage?guestId=${guestId}`);
        const usageData = await usageRes.json();
        if (usageData.usedToday !== undefined) {
          setUsage(usageData);
        }
        setShowAuthDialog(false);
        resetForm();
        toast.success('Welcome to Hidhaya');
      } else {
        toast.error(data.error || 'Failed to continue');
      }
    } catch {
      toast.error('Unable to connect right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data._id) {
        setUser(data);
        setLimitReached(false);
        const usageRes = await fetch(`/api/chat/usage?userId=${data._id}`);
        const usageData = await usageRes.json();
        if (usageData.usedToday !== undefined) {
          setUsage(usageData);
        }
        setShowAuthDialog(false);
        resetForm();
        toast.success('Welcome back');
      } else {
        toast.error(data.error || 'Login failed. Please check your credentials.');
      }
    } catch {
      toast.error('Unable to connect right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (data._id) {
        setUser(data);
        setLimitReached(false);
        const usageRes = await fetch(`/api/chat/usage?userId=${data._id}`);
        const usageData = await usageRes.json();
        if (usageData.usedToday !== undefined) {
          setUsage(usageData);
        }
        setShowAuthDialog(false);
        resetForm();
        toast.success('Account created Welcome to Hidhaya');
      } else {
        toast.error(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      toast.error('Unable to connect right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl text-emerald-800 dark:text-emerald-300">
            Welcome to Hidhaya
          </DialogTitle>
          <DialogDescription>
            Sign in to save your progress or continue guest
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full mb-4 bg-emerald-50 dark:bg-emerald-950/30">
              <TabsTrigger value="login" className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleEmailLogin}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-background px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button
            variant="outline"
            onClick={handleGuestContinue}
            disabled={loading}
            className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            Continue
          </Button>

          <p className="text-[11px] text-muted-foreground text-center mt-4">
            Guests get 10 questions/day. Sign up for 20/day.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
