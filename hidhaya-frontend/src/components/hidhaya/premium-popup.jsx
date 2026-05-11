import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHidhayaStore } from '@/store/hidhaya-store';
import { Crown, Sparkles, Zap, BookOpen, Mic, UserCheck, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const features = [
  { icon: Zap, text: 'Unlimited AI questions', desc: 'No daily limits' },
  { icon: Sparkles, text: 'Faster responses', desc: 'Priority processing' },
  { icon: BookOpen, text: 'Advanced explanations', desc: 'Deeper insights' },
  { icon: Mic, text: 'Voice mode', desc: 'Coming soon' },
  { icon: UserCheck, text: 'Personalized plans', desc: 'Tailored for you' },
];

export function PremiumPopup() {
  const { showPremiumPopup, setShowPremiumPopup, setShowAuthDialog, usage } = useHidhayaStore();
  const isGuest = usage?.isGuest ?? true;

  return (
    <Dialog open={showPremiumPopup} onOpenChange={setShowPremiumPopup}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-amber-200 dark:border-amber-800">
        {/* Gold gradient header */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-6 text-6xl">&#9734;</div>
            <div className="absolute bottom-1 right-8 text-4xl">&#9733;</div>
            <div className="absolute top-8 right-20 text-3xl">&#9734;</div>
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6" />
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                PREMIUM
              </Badge>
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Unlock Full Access
            </DialogTitle>
            <DialogDescription className="text-amber-100">
              {isGuest
                ? "You've reached your 10 free questions today"
                : "You've reached your daily question limit"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4">
          {/* Features list */}
          <div className="space-y-3 mb-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{feature.text}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl p-4 text-center mb-4 border border-amber-100 dark:border-amber-900/30">
            <p className="text-sm text-muted-foreground mb-1">Starting at</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">&#8377;199</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
              onClick={() => {
                toast.info('Premium coming soon InshaAllah');
                setShowPremiumPopup(false);
              }}
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade Now
            </Button>

            {/* Login/Register option for guests */}
            {isGuest && (
              <Button
                variant="outline"
                className="w-full border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={() => {
                  setShowPremiumPopup(false);
                  setShowAuthDialog(true);
                }}
              >
                <LogIn className="w-4 h-4 mr-1" />
                Login / Register — Get 20 Questions/Day
              </Button>
            )}

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setShowPremiumPopup(false)}
            >
              Continue Free
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
