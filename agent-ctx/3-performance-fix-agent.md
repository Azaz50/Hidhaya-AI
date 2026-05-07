# Task 3 - Performance Fix Agent Work Record

## Task: Fix Hadith Search API Performance

### Problem
The hadith search API at `/home/z/my-project/src/app/api/hadith/search/route.ts` had three performance issues:

1. **O(n*m) disk re-reading**: When a non-English language was selected, the code re-read ALL hadith files from disk for EACH search result item to find language-specific text. With 8 hadiths and 2 files, this meant 16 file reads per search; with real data (7000+ hadiths), this would be catastrophic.

2. **Redundant `allHadiths.find()`**: Line 103 did `allHadiths.find((ah) => ah.id === h.id && ah.bookName === h.bookName)` but `h` was already an element from `allHadiths` — making this a completely unnecessary O(n) lookup per item.

3. **Fallback keyword search only checked English**: The keyword fallback didn't search language-specific translations.

### Solution
- Modified `FlatHadith` interface to include a `translations` field (`Partial<Record<LangKey, { text: string; narrator: string }>>`) caching all language translations
- Modified `getHadithData()` to populate all language translations (english, Hindi, Urdu, Bengali) during the initial file read
- Modified GET handler to use cached translations for O(1) language lookup — no disk re-reading
- Removed redundant `allHadiths.find()` call
- Fixed fallback keyword search to also check `langText` via cached translations

### Verification
- Lint passes cleanly
- All 4 languages tested via curl: English, Hindi, Urdu, Bengali — all return correct translations
- Fallback keyword search with Hindi text works correctly
- API response format unchanged

### Files Modified
- `/home/z/my-project/src/app/api/hadith/search/route.ts` — complete rewrite of data loading and search logic
