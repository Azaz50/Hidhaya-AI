import { useState, useRef, useEffect, useCallback } from 'react';
import { useHidhayaStore } from '@/store/hidhaya-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Square,
  BookOpen,
  Library,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookmarkPlus,
  Lock,
  LogIn,
  Crown,
  Heart,
  Moon,
  Quote,
  Footprints,
  HandHeart,
  Lightbulb,
  Brain,
  Umbrella,
  Shield,
  Sun,
  Users,
  CloudRain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import hidhayaLogo from '@/assets/hidhaya-favicon.png';

const suggestedQuestions = [
  { text: 'How to control anger in Islam?', icon: Shield },
  { text: 'What does Islam say about depression?', icon: Heart },
  { text: 'How to practice sabr (patience)?', icon: Sun },
  { text: 'What is the importance of honesty?', icon: Lightbulb },
  { text: 'Dua for anxiety and worry', icon: CloudRain },
  { text: 'Islam on kindness to parents', icon: Users },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-[var(--color-primary)] animate-pulse" />
        <span className="text-xs text-[var(--color-primary)] font-medium">Hidhaya AI is thinking</span>
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// QURAN REFERENCE CARD — Green Themed Box
// ============================================================

function QuranReferenceCard({
  reference,
  text,
  onBookmark,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-accent)] overflow-hidden shadow-sm">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-2.5 p-3 text-left hover:bg-[var(--color-muted)] transition-colors">
            <div className="w-7 h-7 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            </div>
            <span className="text-sm font-semibold text-[var(--color-foreground)] flex-1">{reference}</span>
            {open ? (
              <ChevronUp className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0">
            <div className="border-t border-[var(--color-border)] pt-2">
              <div className="relative pl-3">
                <Quote className="absolute left-0 top-0.5 w-3 h-3 text-[var(--color-primary)] rotate-180" />
                <p className="text-sm text-[var(--color-foreground)] leading-relaxed italic">{text}</p>
              </div>
              {onBookmark && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 text-[10px] gap-1 text-[var(--color-primary)] hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark();
                  }}
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Bookmark
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ============================================================
// HADITH REFERENCE CARD — Unique Warm Style
// ============================================================

// Full collection names for proper Hadith display
const HADITH_COLLECTION_DISPLAY = {
  'bukhari': 'Sahih al-Bukhari',
  'muslim': 'Sahih Muslim',
  'abudawud': 'Sunan Abu Dawood',
  'tirmidhi': 'Jami al-Tirmidhi',
  'nasai': 'Sunan al-Nasa\'i',
  'ibnmajah': 'Sunan Ibn Majah',
  'malik': 'Muwatta Imam Malik',
  'darimi': 'Sunan al-Darimi',
  'ahmed': 'Musnad Ahmad bin Hanbal'
};

function HadithReferenceCard({
  reference,
  text,
  collection,
  grade,
  onBookmark,
}) {
  const [open, setOpen] = useState(false);

  // Get display name for collection
  const displayCollection = collection
    ? (HADITH_COLLECTION_DISPLAY[collection] || collection)
    : '';

  // Extract Hadith number from reference (e.g., "Sahih al-Bukhari — Hadith 49")
  const hadithNum = reference?.match(/Hadith\s+(\d+)/i)?.[1] || '';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 overflow-hidden shadow-sm">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-2.5 p-3 text-left hover:bg-amber-500/10 transition-colors">
            <div className="w-7 h-7 rounded-md bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Library className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-[var(--color-foreground)]">
                {displayCollection}
              </span>
              {hadithNum && (
                <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                  • Hadith {hadithNum}
                </span>
              )}
              {grade && (
                <span className="text-[10px] text-muted-foreground ml-2">
                  ({grade})
                </span>
              )}
            </div>
            {open ? (
              <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0">
            <div className="border-t border-amber-500/20 pt-2">
              <div className="relative pl-3">
                <Quote className="absolute left-0 top-0.5 w-3 h-3 text-amber-500 rotate-180" />
                <p className="text-sm text-[var(--color-foreground)] leading-relaxed italic">{text}</p>
              </div>
              {onBookmark && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-6 text-[10px] gap-1 text-amber-500 hover:opacity-80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark();
                  }}
                >
                  <BookmarkPlus className="w-3 h-3" />
                  Bookmark
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ============================================================
// SECTION ICON MAP
// ============================================================

const SECTION_ICONS = {
  'title': { icon: Sparkles, color: 'text-[var(--color-primary)]' },
  'short summary': { icon: Lightbulb, color: 'text-[var(--color-primary)]' },
  'quran guidance': { icon: BookOpen, color: 'text-[var(--color-primary)]' },
  'hadith guidance': { icon: Library, color: 'text-amber-500' },
  'simple explanation': { icon: HandHeart, color: 'text-[var(--color-primary)]' },
  'practical steps': { icon: Footprints, color: 'text-[var(--color-primary)]' },
  'closing message': { icon: Heart, color: 'text-rose-500' },
};

function getSectionIcon(sectionTitle) {
  const lower = sectionTitle.toLowerCase();
  for (const [key, val] of Object.entries(SECTION_ICONS)) {
    if (lower.includes(key)) return val;
  }
  return { icon: Sparkles, color: 'text-[var(--color-primary)]' };
}

// ============================================================
// CHAT BUBBLE — Enhanced with section rendering
// ============================================================

function ChatBubble({ message, onBookmark }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end"
      >
        <div className="max-w-[85%] md:max-w-[75%]">
          <div className="bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Parse the AI response into sections based on ✦ markers
  const sections = parseAISections(message.content || '');

  // Fallback: if no sections or empty content, show raw content
  const showRawContent = !message.content || (sections.length === 0) || (sections.length === 1 && !sections[0].title && !sections[0].content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] md:max-w-[75%]">
        <div className="bg-card border border-[var(--color-border)] rounded-2xl rounded-bl-md shadow-sm overflow-hidden">
          {/* AI Header */}
          <div className="px-4 py-3 pb-0">
            <div className="flex items-center gap-2 mb-3">
              <img src={hidhayaLogo} alt="Hidhaya" className="w-8 h-8 object-cover" />
              <span className="text-sm font-semibold text-[var(--color-foreground)]">Hidhaya AI</span>
            </div>
          </div>

          {/* Rendered sections */}
          <div className="px-4 pb-3">
            {showRawContent ? (
              <div className="text-sm whitespace-pre-wrap">
                {message.content || 'Processing...'}
              </div>
            ) : (
              sections.map((section, idx) => (
                <SectionRenderer key={idx} section={section} />
              ))
            )}
          </div>

          {/* References */}
          {message.references && (
            <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-3 space-y-3">
              {message.references.quran.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <BookOpen className="w-3 h-3 text-[var(--color-primary)]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                      Quran References
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {message.references.quran.map((ref, i) => (
                      <QuranReferenceCard
                        key={`q-${i}`}
                        reference={ref.reference}
                        text={ref.text}
                        onBookmark={onBookmark ? () => onBookmark('quran', ref.reference, ref.text) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
              {message.references.hadith.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-1">
                    <Library className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Hadith References
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {message.references.hadith.map((ref, i) => (
                      <HadithReferenceCard
                        key={`h-${i}`}
                        reference={ref.reference}
                        text={ref.text}
                        collection={ref.collection}
                        grade={ref.grade}
                        onBookmark={onBookmark ? () => onBookmark('hadith', ref.reference, ref.text) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// SECTION PARSER — Parse AI response into structured sections
// ============================================================

function parseAISections(content) {
  const sections = [];

  // Split by the ✦ section markers
  const parts = content.split(/\*\*✦\s*/);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // The first part before any ✦ marker is content without a section header
    if (!part.includes('**') && sections.length === 0 && !trimmed.startsWith('✦')) {
      // This is intro content before any section — treat-less section
      if (trimmed.length > 0) {
        sections.push({ title: '', content: trimmed });
      }
      continue;
    }

    // Extract title (everything before the closing **)
    const titleMatch = trimmed.match(/^([^*]+)\*\*/);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const rest = trimmed.slice(titleMatch[0].length).trim();
      sections.push({ title, content: rest });
    } else {
      // No title found — append to previous section or create untitled
      if (sections.length > 0) {
        sections[sections.length - 1].content += '\n' + trimmed;
      } else {
        sections.push({ title: '', content: trimmed });
      }
    }
  }

  // If no sections were parsed, treat the whole content section
  if (sections.length === 0) {
    sections.push({ title: '', content });
  }

  return sections;
}

// ============================================================
// SECTION RENDERER — Render each AI section with styling
// ============================================================

function SectionRenderer({ section }) {
  const { icon: SectionIcon, color } = getSectionIcon(section.title);
  const lowerTitle = section.title.toLowerCase();

  // Determine section style based on type
  const isQuranSection = lowerTitle.includes('quran');
  const isHadithSection = lowerTitle.includes('hadith');
  const isPracticalSection = lowerTitle.includes('practical');
  const isClosingSection = lowerTitle.includes('closing');
  const isTitleSection = lowerTitle.includes('title');

  return (
    <div className={`mb-3 last:mb-0 ${
      isClosingSection ? 'mt-3 pt-3 border-t border-[var(--color-border)]' : ''
    }`}>
      {/* Section header */}
      {section.title && (
        <div className={`flex items-center gap-1.5 mb-1.5 ${
          isTitleSection ? '-mt-1 mb-2' : ''
        }`}>
          <SectionIcon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
          <h3 className={`text-sm font-bold ${
            isQuranSection
              ? 'text-[var(--color-primary)]'
              : isHadithSection
              ? 'text-amber-700 dark:text-amber-400'
              : isClosingSection
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-[var(--color-foreground)]'
          }`}>
            {section.title}
          </h3>
        </div>
      )}

      {/* Section content */}
      <div className={`text-sm leading-relaxed text-foreground whitespace-pre-wrap ${
        section.title ? 'pl-5' : ''
      }`}>
        {isQuranSection ? (
          // Quran section — green themed text
          <div className="space-y-1.5">
            {section.content.split('\n').map((line, i) => renderLine(line, i, 'quran'))}
          </div>
        ) : isHadithSection ? (
          // Hadith section — warm amber themed text
          <div className="space-y-1.5">
            {section.content.split('\n').map((line, i) => renderLine(line, i, 'hadith'))}
          </div>
        ) : isPracticalSection ? (
          // Practical steps — numbered items with emphasis
          <div className="space-y-1.5">
            {section.content.split('\n').map((line, i) => renderPracticalLine(line, i))}
          </div>
        ) : isClosingSection ? (
          // Closing — soft, warm style
          <div className="text-[var(--color-foreground)] italic">
            {section.content.split('\n').map((line, i) => renderLine(line, i, 'closing'))}
          </div>
        ) : (
          // Default rendering
          <div className="space-y-0.5">
            {section.content.split('\n').map((line, i) => renderLine(line, i, 'default'))}
          </div>
        )}
      </div>
    </div>
  );
}

function renderLine(line, i, context) {
  const trimmed = line.trim();
  if (trimmed === '') return <div key={i} className="h-1.5" />;

  // Bullet points
  if (trimmed.startsWith('- ')) {
    const content = trimmed.slice(2);
    return (
      <div key={i} className="flex items-start gap-2">
        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          context === 'quran' ? 'bg-emerald-400' : context === 'hadith' ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className="flex-1">{renderInlineMarkdown(content)}</span>
      </div>
    );
  }

  // Lines starting with "— " (em dash attribution)
  if (trimmed.startsWith('—') || trimmed.startsWith('–')) {
    return (
      <p key={i} className="text-xs text-[var(--color-primary)] dark:text-emerald-400 font-medium pl-4">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  }

  // Bold-only lines
  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
    return <p key={i} className="font-semibold mt-1">{trimmed.replace(/\*\*/g, '')}</p>;
  }

  return <p key={i}>{renderInlineMarkdown(trimmed)}</p>;
}

function renderPracticalLine(line, i) {
  const trimmed = line.trim();
  if (trimmed === '') return <div key={i} className="h-1" />;

  // Numbered items: "1. something" or "1) something"
  const numMatch = trimmed.match(/^(\d+)[.)]\s*(.*)/);
  if (numMatch) {
    return (
      <div key={i} className="flex items-start gap-2">
        <span className="w-5 h-5 rounded-full bg-emerald-100 bg-[var(--color-primary)]900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-[10px] font-bold text-[var(--color-primary)]">{numMatch[1]}</span>
        </span>
        <span className="flex-1 text-foreground">{renderInlineMarkdown(numMatch[2])}</span>
      </div>
    );
  }

  // Bullet points
  if (trimmed.startsWith('- ')) {
    return (
      <div key={i} className="flex items-start gap-2">
        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
        <span className="flex-1">{renderInlineMarkdown(trimmed.slice(2))}</span>
      </div>
    );
  }

  return <p key={i}>{renderInlineMarkdown(trimmed)}</p>;
}

function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={j} className="font-semibold">{part.replace(/\*\*/g, '')}</strong>;
    }
    return <span key={j}>{part}</span>;
  });
}

// ============================================================
// LIMIT REACHED OVERLAY
// ============================================================

function LimitReachedOverlay() {
  const { setShowAuthDialog, setShowPremiumPopup, usage } = useHidhayaStore();
  const isGuest = usage?.isGuest ?? true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full px-6 py-8"
    >
      <div className="max-w-sm w-full text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/40 dark:to-amber-900/40 flex items-center justify-center mx-auto mb-5"
        >
          <Moon className="w-9 h-9 text-[var(--color-primary)]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-[var(--color-foreground)] mb-2"
        >
          Continue Your Islamic Journey
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground mb-6"
        >
          {isGuest
            ? "You've used all 10 free questions for today. Sign in to get more, or upgrade to Premium for unlimited access."
            : "You've used all 20 daily questions. Upgrade to Premium for unlimited access to Islamic guidance."
          }
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-emerald-50 bg-[var(--color-primary)]950/30 rounded-lg p-3 mb-6 border border-emerald-100 dark:border-emerald-900/50"
        >
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-[var(--color-primary)]">Daily limit resets at midnight.</span>{' '}
            Come back tomorrow for more questions, or upgrade now.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          <Button
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30 gap-2 h-11"
            onClick={() => setShowPremiumPopup(true)}
          >
            <Crown className="w-4 h-4" />
            Upgrade to Premium — Unlimited
          </Button>

          {isGuest && (
            <Button
              className="w-full bg-[var(--color-primary)] hover:bg-emerald-700 text-white gap-2 h-11"
              onClick={() => setShowAuthDialog(true)}
            >
              <LogIn className="w-4 h-4" />
              Login / Register — Get 20 Questions/Day
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 space-y-2"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Why upgrade?
          </p>
          <div className="grid grid-cols-1 gap-2 text-left">
            {[
              { icon: Heart, text: 'Unlimited Islamic guidance' },
              { icon: Sparkles, text: 'Deeper AI explanations' },
              { icon: Crown, text: 'Priority responses' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5 text-[var(--color-primary)] flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================
// MAIN CHAT PANEL
// ============================================================

export function ChatPanel() {
  const {
    messages,
    addMessage,
    updateMessage,
    isLoading,
    setIsLoading,
    chatId,
    setChatId,
    user,
    usage,
    limitReached,
    setLimitReached,
    setShowPremiumPopup,
    setShowAuthDialog,
    loadChatHistory,
    language,
  } = useHidhayaStore();

  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const abortControllerRef = useRef(null);

  const remaining = usage?.remaining ?? -1;
  const isPremium = user?.plan === 'premium';
  const isGuest = usage?.isGuest ?? true;

  // Check if limit is reached - disable input
  const isLimitReached = limitReached || (usage !== null && remaining === 0 && !isPremium);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Ensure guestId exists on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('hidhaya_guest_id')) {
      const newGuestId = crypto.randomUUID();
      localStorage.setItem('hidhaya_guest_id', newGuestId);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleBookmark = async (type, ref, text) => {
    if (!user?._id) {
      toast.error('Please sign in to bookmark');
      return;
    }
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || undefined,
          type,
          sourceRef: ref,
          text,
          language: user.language || 'en',
        }),
      });
      const data = await res.json();
      if (data.bookmark) {
        toast.success('Bookmarked');
      } else {
        toast.error(data.error || 'Failed to bookmark');
      }
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  // ============================================================
  // CANCEL GENERATION
  // ============================================================

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    toast.info('Response generation stopped');
  }, [setIsLoading]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading || isLimitReached) return;

    setInput('');

    const userMessage= {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    setIsLoading(true);

    // Create new AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const guestId = typeof window !== 'undefined'
        ? localStorage.getItem('hidhaya_guest_id')
        : undefined;
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('token')
        : undefined;

      // Build headers
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Use streaming endpoint for faster response
      const res = await fetch('/api/chat/ask/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: text,
          chatId: chatId || undefined,
          userId: user?._id || undefined,
          guestId: !user?._id ? guestId : undefined,
          language: language,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      });

      
      // Handle streaming response
      if (!res.ok || !res.body) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      // Create empty AI message that will be updated as stream comes in
      const aiMessageId = crypto.randomUUID();
      let fullResponse = '';
      let references = [];
      let searchMetadata = null;

      addMessage({
        id: aiMessageId,
        role: 'assistant',
        content: '',
        references: { quran: [], hadith: [] },
        timestamp: new Date(),
        isStreaming: true
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              let refs = [];

              if (data.type === 'search_complete') {
                refs = data.references || [];
                searchMetadata = data.searchMetadata;
              } else if (data.type === 'chunk') {
                fullResponse += data.text;
                updateMessage(aiMessageId, { content: fullResponse });
              } else if (data.type === 'complete') {
                updateMessage(aiMessageId, {
                  content: data.response,
                  references: { quran: refs.filter(r => r.type === 'quran'), hadith: refs.filter(r => r.type === 'hadith') },
                  isStreaming: false
                });
              } else if (data.type === 'error') {
                updateMessage(aiMessageId, {
                  content: data.message || "An error occurred",
                  isStreaming: false
                });
              }
            } catch (e) {
              console.error('❌ JSON parse error:', e, 'Line was:', line);
            }
          }
        }
      }

      // Load usage and chat history after completion
      try {
        const gId = localStorage.getItem('hidhaya_guest_id');
        const token = localStorage.getItem('token');
        if (gId) {
          const headers = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const usageRes = await fetch(`/api/chat/usage?guestId=${gId}`, { headers });
          const usageData = await usageRes.json();
          if (usageData.usedToday !== undefined) {
            useHidhayaStore.getState().setUsage(usageData);
          }
          await loadChatHistory();
        }
      } catch (err) {
        console.error('Error loading usage/history:', err);
      }

      setIsLoading(false);
      return;

      if (res.status === 429) {
        setLimitReached(true);
        setShowPremiumPopup(true);
        const aiMessage= {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: isGuest
            ? "You've reached your daily limit of 10 free questions. Please sign in for more questions or upgrade to Premium for unlimited access."
            : "You've reached your daily question limit. Upgrade to Premium for unlimited access to Islamic guidance.",
          timestamp: new Date(),
        };
        addMessage(aiMessage);
        return;
      }
    } catch (err) {
      // Check if the error is from abort
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Request was cancelled by user — no error toast needed
        // The partial response (if any) remains visible
        return;
      }
      
      // NEVER show "Something went wrong" — show a graceful fallback message instead
      // The backend should always return a 200 with a graceful message now,
      // but this handles edge cases where the network itself failed
      const gracefulMessage= {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I apologize, but I'm having difficulty connecting right now. Please check your internet connection and try again. May Allah grant you ease. 🤲",
        references: { quran: [], hadith: [] },
        timestamp: new Date(),
      };
      addMessage(gracefulMessage);
    } finally {
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isLoading) {
        handleCancel();
      } else {
        handleSend();
      }
    }
  };

  const handleSuggestionClick = (question) => {
    if (isLimitReached) return;
    setInput(question);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLimitReached ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-lg"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 bg-[var(--color-primary)]900/30 flex items-center justify-center mx-auto mb-4">
                <img src={hidhayaLogo} alt="Hidhaya" className="object-cover w-full h-full rounded-[10px]" />
              </div>
              <p className="text-lg font-semibold text-[var(--color-primary)] mb-2">As-salamu alaykum</p>
              <h2 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
                Ask anything about Islam
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                Get guidance from Quran and authentic Hadith with Hidhaya-AI answers
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md mx-auto">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => handleSuggestionClick(q.text)}
                    className="flex items-center gap-3 text-left text-sm px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-accent)] hover:bg-[var(--color-muted)] transition-colors text-[var(--color-foreground)]"
                  >
                    <q.icon className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{q.text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : isLimitReached && messages.length === 0 ? (
          <LimitReachedOverlay />
        ) : (
          <div className="p-4 space-y-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} onBookmark={handleBookmark} />
            ))}
            {isLoading && <TypingIndicator />}

            {/* Inline limit reached banner when messages exist */}
            {isLimitReached && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Daily Limit Reached</p>
                    <p className="text-xs text-muted-foreground">
                      {isGuest ? '0 of 10 questions remaining today' : '0 of 20 questions remaining today'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {isGuest && (
                    <Button
                      size="sm"
                      className="bg-[var(--color-primary)] hover:bg-emerald-700 text-white gap-1.5 flex-1"
                      onClick={() => setShowAuthDialog(true)}
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Login / Register
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white gap-1.5 flex-1"
                    onClick={() => setShowPremiumPopup(true)}
                  >
                    <Crown className="w-3.5 h-3.5" />
                    Upgrade to Premium
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Limit resets at midnight. Come back tomorrow for more questions.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-card)] p-3">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLimitReached ? "Daily limit reached — upgrade for more questions" : "Ask about Islam..."}
              className={`min-h-[44px] max-h-[120px] resize-none pr-3 ${
                isLimitReached
                  ? 'opacity-50 cursor-not-allowed bg-muted/50 border-muted'
                  : 'border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30 bg-emerald-50/30 bg-[var(--color-primary)]950/20'
              }`}
              rows={1}
              disabled={isLoading || isLimitReached}
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            {usage && remaining >= 0 && !isPremium && (
              <span className={`text-[10px] whitespace-nowrap ${
                remaining === 0 ? 'text-red-500 font-semibold' : remaining <= 2 ? 'text-amber-500 font-medium' : 'text-muted-foreground'
              }`}>
                {remaining === 0 ? '0 left' : `${remaining} left`}
              </span>
            )}
            <Button
              onClick={isLoading ? handleCancel : handleSend}
              disabled={!isLoading && (!input.trim() || isLimitReached)}
              className={`h-[44px] w-[44px] p-0 rounded-xl transition-all ${
                isLoading
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30'
                  : isLimitReached
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-[var(--color-primary)] hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30'
              }`}
              size="icon"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="stop"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </motion.div>
                ) : isLimitReached ? (
                  <motion.div
                    key="lock"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Lock className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
