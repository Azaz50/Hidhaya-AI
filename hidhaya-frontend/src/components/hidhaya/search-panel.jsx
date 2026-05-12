import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  BookOpen,
  Library,
  BookmarkPlus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useHidhayaStore } from '@/store/hidhaya-store';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
/** Complete Surah names map for all 114 surahs */
const SURAH_NAMES = {
  1: { english: 'Al-Fatihah', arabic: 'الفاتحة' },
  2: { english: 'Al-Baqarah', arabic: 'البقرة' },
  3: { english: 'Aal-Imran', arabic: 'آل عمران' },
  4: { english: 'An-Nisa', arabic: 'النساء' },
  5: { english: "Al-Ma'idah", arabic: 'المائدة' },
  6: { english: "Al-An'am", arabic: 'الأنعام' },
  7: { english: "Al-A'raf", arabic: 'الأعراف' },
  8: { english: 'Al-Anfal', arabic: 'الأنفال' },
  9: { english: 'At-Taubah', arabic: 'التوبة' },
  10: { english: 'Yunus', arabic: 'يونس' },
  11: { english: 'Hud', arabic: 'هود' },
  12: { english: 'Yusuf', arabic: 'يوسف' },
  13: { english: "Ar-Ra'd", arabic: 'الرعد' },
  14: { english: 'Ibrahim', arabic: 'ابراهيم' },
  15: { english: 'Al-Hijr', arabic: 'الحجر' },
  16: { english: 'An-Nahl', arabic: 'النحل' },
  17: { english: 'Al-Isra', arabic: 'الإسراء' },
  18: { english: 'Al-Kahf', arabic: 'الكهف' },
  19: { english: 'Maryam', arabic: 'مريم' },
  20: { english: 'Taha', arabic: 'طه' },
  21: { english: 'Al-Anbiya', arabic: 'الأنبياء' },
  22: { english: 'Al-Hajj', arabic: 'الحج' },
  23: { english: 'Al-Mu-minun', arabic: 'المؤمنون' },
  24: { english: 'An-Nur', arabic: 'النور' },
  25: { english: 'Al-Furqan', arabic: 'الفرقان' },
  26: { english: 'Ash-Shuara', arabic: 'الشعراء' },
  27: { english: 'An-Naml', arabic: 'النمل' },
  28: { english: 'Al-Qasas', arabic: 'القصص' },
  29: { english: 'Al-Ankabut', arabic: 'العنكبوت' },
  30: { english: 'Ar-Rum', arabic: 'الروم' },
  31: { english: 'Luqman', arabic: 'لقمان' },
  32: { english: 'As-Sajdah', arabic: 'السجدة' },
  33: { english: 'Al-Ahzab', arabic: 'الأحزاب' },
  34: { english: 'Saba', arabic: 'سبأ' },
  35: { english: 'Fatir', arabic: 'فاطر' },
  36: { english: 'Ya-Sin', arabic: 'يس' },
  37: { english: 'As-Saffat', arabic: 'الصافات' },
  38: { english: 'Sad', arabic: 'ص' },
  39: { english: 'Az-Zumar', arabic: 'الزمر' },
  40: { english: 'Ghafir', arabic: 'غافر' },
  41: { english: 'Fussilat', arabic: 'فصلت' },
  42: { english: 'Ash-Shura', arabic: 'الشورى' },
  43: { english: 'Az-Zukhruf', arabic: 'الزخرف' },
  44: { english: 'Ad-Dukhan', arabic: 'الدخان' },
  45: { english: 'Al-Ahqaf', arabic: 'الأحقاف' },
  46: { english: 'Muhammad', arabic: 'محمد' },
  47: { english: 'Al-Fath', arabic: 'الفتح' },
  48: { english: 'Al-Hujurat', arabic: 'الحجرات' },
  49: { english: 'Qaf', arabic: 'ق' },
  50: { english: 'Ad-Dhariyat', arabic: 'الذاريات' },
  51: { english: 'At-Tur', arabic: 'الطور' },
  52: { english: 'An-Najm', arabic: 'النجم' },
  53: { english: 'Al-Qamar', arabic: 'القمر' },
  54: { english: 'Ar-Rahman', arabic: 'الرحمن' },
  55: { english: 'Al-Waqiah', arabic: 'الواقعة' },
  56: { english: 'Al-Hadid', arabic: 'الحديد' },
  57: { english: 'Al-Mujadilah', arabic: 'المجادلة' },
  58: { english: 'Al-Hashr', arabic: 'الحشر' },
  59: { english: 'Al-Mumtahinah', arabic: 'الممتحنة' },
  60: { english: 'As-Saf', arabic: 'الصف' },
  61: { english: 'Al-Jumuah', arabic: 'الجمعة' },
  62: { english: 'Al-Munafiqun', arabic: 'المنافقون' },
  63: { english: 'At-Taghabun', arabic: 'التغابن' },
  64: { english: 'At-Talaq', arabic: 'الطلاق' },
  65: { english: 'At-Tahrin', arabic: 'التحريم' },
  66: { english: 'Al-Mulk', arabic: 'الملك' },
  67: { english: 'Al-Qalam', arabic: 'القلم' },
  68: { english: 'Al-Haqqah', arabic: 'الحاقة' },
  69: { english: 'Al-Maarij', arabic: 'المعارج' },
  70: { english: 'Nuh', arabic: 'نوح' },
  71: { english: 'Al-Jinn', arabic: 'الجن' },
  72: { english: 'Al-Muzzammil', arabic: 'المزمل' },
  73: { english: 'Al-Muddaththir', arabic: 'المدثر' },
  74: { english: 'Al-Qiyamah', arabic: 'القيامة' },
  75: { english: 'Al-Insan', arabic: 'الإنسان' },
  76: { english: 'Al-Mursalat', arabic: 'المرسلات' },
  77: { english: 'An-Naba', arabic: 'النبأ' },
  78: { english: 'An-Naziat', arabic: 'النازعات' },
  79: { english: 'Abasa', arabic: 'عبس' },
  80: { english: 'At-Takwir', arabic: 'التكوير' },
  81: { english: 'Al-Infitar', arabic: 'الإنفطار' },
  82: { english: 'Al-Mutaffifin', arabic: 'المطففين' },
  83: { english: 'Al-Inshiqaq', arabic: 'الإنشقاق' },
  84: { english: 'Al-Buruj', arabic: 'البروج' },
  85: { english: 'At-Tariq', arabic: 'الطارق' },
  86: { english: 'Al-Aala', arabic: 'الأعلى' },
  87: { english: 'Al-Ghashiyah', arabic: 'الغاشية' },
  88: { english: 'Al-Fajr', arabic: 'الفجر' },
  89: { english: 'Al-Balad', arabic: 'البلد' },
  90: { english: 'Ash-Shams', arabic: 'الشمس' },
  91: { english: 'Al-Layl', arabic: 'الليل' },
  92: { english: 'Ad-Duha', arabic: 'الضحى' },
  93: { english: 'Ash-Sharh', arabic: 'الشرح' },
  94: { english: 'At-Tin', arabic: 'التين' },
  95: { english: 'Al-Alaq', arabic: 'العلق' },
  96: { english: 'Al-Qadr', arabic: 'القدر' },
  97: { english: 'Al-Bayyinah', arabic: 'البينة' },
  98: { english: 'Az-Zalzalah', arabic: 'الزلزلة' },
  99: { english: 'Al-Adiyat', arabic: 'العاديات' },
  100: { english: 'Al-Qariah', arabic: 'القارعة' },
  101: { english: 'At-Takathur', arabic: 'التكاثر' },
  102: { english: 'Al-Asr', arabic: 'العصر' },
  103: { english: 'Al-Humazah', arabic: 'الهمزة' },
  104: { english: 'Al-Fil', arabic: 'الفيل' },
  105: { english: 'Quraysh', arabic: 'قريش' },
  106: { english: 'Al-Maun', arabic: 'الماعون' },
  107: { english: 'Al-Kawthar', arabic: 'الكوثَر' },
  108: { english: 'Al-Kafirun', arabic: 'الكافرون' },
  109: { english: 'An-Nasr', arabic: 'النصر' },
  110: { english: 'Al-Masad', arabic: 'المسد' },
  111: { english: 'Al-Ikhlas', arabic: 'الإخلاص' },
  112: { english: 'Al-Falaq', arabic: 'الفلق' },
  113: { english: 'An-Nas', arabic: 'الناس' },
};

function QuranResultCard({
  verse,
  onBookmark,
}) {
  useHidhayaStore();

  const surahInfo = SURAH_NAMES[verse.chapter] || { english: `Surah ${verse.chapter}`, arabic: '' };

  // Get translation based on language
  const getTranslation = () => {
    // API returns 'translation' field
    return verse.translation || verse.english || '';
  };

  const reference = verse.id || verse.reference || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  {surahInfo.english}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  ({surahInfo.arabic})
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {reference}
              </p>
            </div>
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-emerald-600"
                onClick={() => onBookmark(reference, getTranslation())}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Arabic Text */}
          <div className="mb-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg">
            <p className="text-right text-lg leading-loose font-arabic text-foreground" dir="rtl">
              {verse.arabic || ''}
            </p>
          </div>

          {/* Translation */}
          <p className="text-sm text-foreground leading-relaxed">
            {getTranslation()}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

function HadithResultCard({
  hadith,
  onBookmark,
}) {
  useHidhayaStore();

  // Handle both old and new API response formats
  const getTranslation = () => {
    // New API returns 'text' field
    return hadith.text || hadith.english || '';
  };

  const source = hadith.source || hadith.collection || '';
  const narrator = hadith.narrator || '';
  const reference = hadith.id || hadith.reference || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-800 dark:text-amber-300">
                  {source}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-xs text-muted-foreground">
                  {reference}
                </p>
                {narrator && (
                  <span className="text-[10px] text-muted-foreground">
                    Narrator: {narrator}
                  </span>
                )}
              </div>
            </div>
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600"
                onClick={() => onBookmark(reference, getTranslation())}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Arabic Text */}
          <div className="mb-3 p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg">
            <p className="text-right text-base leading-loose text-foreground" dir="rtl">
              {hadith.arabic || ''}
            </p>
          </div>

          {/* Narrator */}
          {narrator && (
            <p className="text-xs text-muted-foreground mb-2">
              Narrated by: <span className="font-medium">{narrator}</span>
            </p>
          )}

          {/* Translation */}
          <p className="text-sm text-foreground leading-relaxed">
            {getTranslation()}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-20 w-full mb-2 rounded-lg" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </Card>
      ))}
    </div>
  );
}

export function SearchPanel({ type }) {
  const { user, searchQuery, setSearchQuery, language } = useHidhayaStore();
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const isQuran = type === 'quran';

  // Map language codes to backend format
  const langMap = {
    'en': 'english',
    'english': 'english',
    'ur': 'urdu',
    'urdu': 'urdu',
    'hi': 'hindi',
    'hindi': 'hindi',
    'bn': 'bengali',
    'bengali': 'bengali',
    'roman_urdu': 'romanUrdu',
  };
  const apiLang = langMap[language] || langMap[language] || 'english';

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);
    try {
      const endpoint = isQuran ? '/api/quran/search' : '/api/hadith/search';
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(q)}&language=${apiLang}`);
      const data = await res.json();
      setResults(data.results || data || []);
      setTotal(data.total || data.results?.length || 0);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, isQuran, apiLang]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBookmark = async (ref, text) => {
    // Get guestId if user not logged in
    const guestId = !user?.id
      ? localStorage.getItem('hidhaya_guest_id')
      : null;

    try {
      const body = {
        type,
        reference: ref,
        text: text || '',
        language: language || 'english',
      };

      // Build query string - guestId should be in query params, not body
      const queryParams = [];
      if (guestId) {
        queryParams.push(`guestId=${encodeURIComponent(guestId)}`);
      }

      const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

      const res = await fetch(`/api/bookmarks${queryString}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data._id) {
        toast.success('Bookmarked');
      } else {
        toast.error(data.message || 'Failed to bookmark');
      }
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Header - fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="flex items-center gap-2 mb-3">
          {isQuran ? (
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
          ) : (
            <Library className="w-5 h-5 text-amber-500" />
          )}
          <h2 className="text-lg font-semibold text-foreground">
            {isQuran ? 'Quran Search' : 'Hadith Search'}
          </h2>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isQuran ? 'Search Quran verses by topic, keyword, or reference (e.g. 2:255)...' : 'Search Hadith by topic, narrator, or keyword...'}
              className={`pl-10 ${
                isQuran
                  ? 'border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30'
                  : 'border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500/30'
              }`}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={loading || !searchQuery.trim()}
            className={`${
              isQuran
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            } text-white`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        {searched && !loading && (
          <p className="text-xs text-muted-foreground mt-2">
            Found {total} result{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results - scrollable area with proper overflow handling */}
      <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
        <div className="p-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <SearchSkeleton />
            ) : results.length > 0 ? (
              <div className="space-y-3">
                {isQuran
                  ? (results).map((verse) => (
                      <QuranResultCard
                        key={verse.id}
                        verse={verse}
                        onBookmark={handleBookmark}
                      />
                    ))
                  : (results).map((hadith) => (
                      <HadithResultCard
                        key={hadith.id}
                        hadith={hadith}
                        onBookmark={handleBookmark}
                      />
                    ))}
              </div>
            ) : searched ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-300 dark:text-emerald-600" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No results found. Try different keywords.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                    isQuran
                      ? 'bg-emerald-50 dark:bg-emerald-900/20'
                      : 'bg-amber-50 dark:bg-amber-900/20'
                  }`}
                >
                  {isQuran ? (
                    <BookOpen className="w-8 h-8 text-emerald-300 dark:text-emerald-600" />
                  ) : (
                    <Library className="w-8 h-8 text-amber-300 dark:text-amber-600" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-1">
                  {isQuran ? 'Search the Holy Quran' : 'Search authentic Hadith'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {isQuran
                    ? 'Find verses by topic, keyword, or reference'
                    : 'Find hadith by topic, narrator, or keyword'}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
