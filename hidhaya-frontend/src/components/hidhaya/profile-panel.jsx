import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Crown,
  LogIn,
  Shield,
  Baby,
  Globe,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useHidhayaStore } from '@/store/hidhaya-store';
import { toast } from 'sonner';

export function ProfilePanel() {
  const { user, setUser, setUsage, usage, setShowAuthDialog, language, setLanguage } = useHidhayaStore();
  const [kidsMode, setKidsMode] = useState(user?.kidsMode || false);

  const isGuest = user?.email?.includes('@hidhaya.app') || !user;
  const isPremium = user?.plan === 'premium';

  const handleLanguageChange = async (lang) => {
    // Always update the store (persists to localStorage for guests)
    setLanguage(lang);

    // Also save to backend for registered users
    if (user?._id && !isGuest) {
      try {
        const token = localStorage.getItem('hidhaya_token');
        const res = await fetch('/api/auth/preferences', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ language: lang }),
        });
        const data = await res.json();
        if (data._id) {
          setUser({ ...user, preferences: { ...user.preferences, language: lang } });
        }
      } catch {
        // Language is still saved locally even if backend fails
        console.error('Failed to save language to backend');
      }
    }

    const langNames = { 'en': 'English', 'ur': 'اردو', 'hi': 'हिन्दी', 'bn': 'বাংলা', 'roman_urdu': 'Roman Urdu' };
    toast.success(`Language changed to ${langNames[lang] || lang}`);
  };

  const handleKidsModeToggle = async (checked) => {
    setKidsMode(checked);
    if (user?._id && !isGuest) {
      try {
        const token = localStorage.getItem('hidhaya_token');
        const res = await fetch('/api/auth/preferences', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ kidsMode: checked }),
        });
        const data = await res.json();
        if (data._id) {
          setUser({ ...user, preferences: { ...user.preferences, kidsMode: checked } });
          toast.success(checked ? 'Kids mode enabled' : 'Kids mode disabled');
        }
      } catch {
        toast.error('Failed to update');
      }
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setUsage(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hidhaya_token');
      localStorage.removeItem('hidhaya_user');
      localStorage.removeItem('hidhaya_guest_id');
    }
    toast.success('Signed out');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'ur', label: 'اردو (Urdu)' },
    { value: 'hi', label: 'हिन्दी (Hindi)' },
    { value: 'bn', label: 'বাংলা (Bengali)' },
    { value: 'roman_urdu', label: 'Roman Urdu' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* User Info Card */}
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 bg-[var(--color-accent)]">
                <AvatarFallback className="bg-[var(--color-accent)] text-[var(--color-primary)] font-semibold text-lg">
                  {user?.name ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-lg truncate">
                  {user?.name || 'Guest User'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {user?.email || 'Not signed in'}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {isPremium ? (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800 gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Free
                    </Badge>
                  )}
                  {isGuest && user && (
                    <Badge variant="outline" className="text-xs">
                      Guest
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Daily Usage */}
          {usage && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-medium text-sm">Daily Usage</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Questions today</span>
                  <span className="font-medium">
                    {usage.usedToday} / {usage.limit === -1 ? 'Unlimited' : usage.limit}
                  </span>
                </div>
                {usage.limit !== -1 && (
                  <Progress
                    value={(usage.usedToday / usage.limit) * 100}
                    className="h-2"
                  />
                )}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {usage.remaining === -1
                      ? 'Unlimited remaining'
                      : `${usage.remaining} remaining`}
                  </span>
                  <span>Resets daily</span>
                </div>
              </div>
            </Card>
          )}

          {/* Settings */}
          <Card className="p-5">
            <h4 className="font-medium text-sm mb-4">Settings</h4>

            {/* Language */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm cursor-pointer">Language</Label>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-1 pl-6">
              AI responses and translations will be in your selected language
            </p>

            <Separator className="my-2" />

            {/* Kids Mode */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-muted-foreground" />
                <Label className="text-sm cursor-pointer">Kids Mode</Label>
              </div>
              <Switch
                checked={kidsMode}
                onCheckedChange={handleKidsModeToggle}
                disabled={isGuest}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 pl-6">
              {isGuest
                ? 'Sign in to enable kids mode'
                : 'Simplified answers for young learners'}
            </p>
          </Card>

          {/* Premium Upsell */}
          {!isPremium && (
            <Card className="p-5 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h4 className="font-medium text-amber-800 dark:text-amber-300">
                  Upgrade to Premium
                </h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Get unlimited questions, faster responses, and advanced explanations
              </p>
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white w-full"
                onClick={() => {
                  useHidhayaStore.getState().setShowPremiumPopup(true);
                }}
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade Now - &#8377;99/mo
              </Button>
            </Card>
          )}

          {/* Auth Actions */}
          <Card className="p-5">
            {isGuest ? (
              <Button
                variant="outline"
                className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-2"
                onClick={() => setShowAuthDialog(true)}
              >
                <LogIn className="w-4 h-4" />
                Sign In / Register
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            )}
          </Card>

          {/* App Info */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">Hidhaya App v1.0</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Islamic Guidance powered by AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
