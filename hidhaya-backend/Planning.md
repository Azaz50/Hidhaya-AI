Before implementing any feature or modification, first analyze the existing codebase carefully. Do NOT remove, break, or modify any already working functionality unless absolutely necessary.

Requirements:

* Keep code clean, modular, scalable, and production-ready
* Write efficient and optimized code
* Avoid unnecessary logic, duplicate functions, and unused files
* Maintain backward compatibility with existing working features
* Refactor only when it improves performance or maintainability
* Follow proper folder structure and separation of concerns
* Ensure APIs, UI, authentication, search, and existing features continue working correctly
* Prioritize performance, reliability, security, and readability
* Use reusable services, utilities, and constants wherever possible
* Add proper error handling and fallback responses
* Optimize for large-scale datasets and future scalability
* Avoid loading huge JSON files repeatedly in runtime
* Validate functionality before removing or replacing any code
* Keep the implementation fast, maintainable, and easy to extend in future


Hidhaya AI — Intelligent Islamic Response Quality Improvement PRD
Objective

Fix Hidhaya AI’s unpredictable, weak, and semantically incorrect Islamic responses.

The system currently gives:

generic AI-generated replies
incomplete Islamic understanding
weak topic detection
unrelated Quran/Hadith references
over-explanatory but inaccurate answers
random retrieval behavior

The goal is to transform Hidhaya AI into a:

highly intelligent
semantically aware
context-grounded
authentic
trustworthy
Quran/Hadith-based Islamic AI assistant
1. Current Core Problems
Problem 1 — Random Retrieval

Question:

Allah kon hain?

Current behavior:

returns only “Bismillah”
unrelated hadith about intentions
weak explanation
incomplete Islamic understanding

Reason:

system searches keyword “Allah”
retrieves random references containing “Allah”
AI hallucinates explanation from weak context
Problem 2 — Weak Topic Understanding

Question:

Who is Muhammad ﷺ?

Current behavior:

AI generates long generic answer
retrieval is partially correct but incomplete
explanation feels robotic and unpredictable

Reason:

no Prophet-topic intelligence
no Islamic entity system
no biography/topic mapping
AI over-generates from limited references
2. Root Cause Analysis

Current pipeline is likely:

User Question
↓
Loose keyword search
↓
Random Quran/Hadith match
↓
Gemini generates answer freely
↓
Unpredictable response

This architecture is incorrect for Islamic AI.

3. Required New Intelligent Architecture
New Retrieval-Based Islamic AI Pipeline
User Question
      ↓
Language Detection
      ↓
Query Normalization
      ↓
Islamic Topic Detection
      ↓
Islamic Entity Extraction
      ↓
Semantic Expansion Engine
      ↓
Hybrid Islamic Search Engine
      ↓
Re-ranking Layer
      ↓
Verified Quran/Hadith Context
      ↓
AI Simplification Layer
      ↓
Structured Final Response
4. MOST IMPORTANT RULE
AI MUST NOT THINK FREELY

Gemini/LLM must NEVER independently generate Islamic information.

AI role is ONLY:

simplify
explain
summarize
structure

AI must ONLY use:

retrieved Quran references
retrieved Hadith references
verified Islamic dataset context
5. Strong Islamic Topic Intelligence

Build topic detection BEFORE search.

Example
User Question	Detected Topic
Allah kon hain	Allah / Tawheed
Muhammad ﷺ kon hain	Prophet Muhammad
Ibrahim alaihisalam kon hain	Prophet Ibrahim
shirk kya hai	Shirk
iman kya hai	Faith
sabr kya hai	Patience

Without topic detection, retrieval becomes random.

6. Build Islamic Knowledge Graph

Create strong semantic Islamic entity mapping.

Example
TOPIC_MAP = {
  allah: {
    category: "tawheed",
    synonyms: [
      "allah",
      "khuda",
      "rabb",
      "maalik",
      "creator",
      "rahman",
      "rahim"
    ],
    relatedTopics: [
      "tawheed",
      "asma_ul_husna",
      "rububiyyah"
    ]
  }
}
7. Prophet Intelligence System

Create dedicated Prophet entity system.

Example
PROPHET_MAP = {
  muhammad: {
    aliases: [
      "Muhammad",
      "Muhammad ﷺ",
      "Rasulullah",
      "Prophet Muhammad"
    ],
    topics: [
      "prophethood",
      "revelation",
      "messenger",
      "sunnah"
    ]
  }
}

Same for:

Ibrahim AS
Musa AS
Isa AS
Nuh AS
Yusuf AS
Adam AS
8. Prevent Random Quran/Hadith Matches
Current Problem

Searching:

Allah

matches almost every record.

Result:
random retrieval.

Required Fix

Search must prioritize:

topic relevance
semantic meaning
entity matching
concept similarity

NOT simple keyword frequency.

9. Intelligent Re-ranking System

After retrieval:

Score results using:

semantic similarity
topic confidence
exact phrase match
entity relevance
Quran/Hadith relevance
emotional intent

Keep ONLY top highly relevant references.

10. Structured Islamic Answer Generation

AI responses must follow predictable structure.

Required Response Format
1. Short Direct Answer
2. Quran References
3. Hadith References
4. Simple Explanation
5. Practical Understanding
6. Closing Guidance

Avoid:

unnecessary storytelling
generic motivational AI text
robotic paragraphs
repetitive explanations
11. Example Expected Behavior
Question
Allah kon hain?
Correct Retrieval

Retrieve:

Surah Ikhlas
Ayatul Kursi
Surah Fatihah
Tawheed references

NOT random hadiths.

Correct Final Response Style
Allah Islam mein ek aur be-misaal Rab hain.
Wahi paida karne wale, rizq dene wale aur puri kainaat ke Malik hain.

Quran References:
- Surah Ikhlas 112:1-4
- Surah Baqarah 2:255
- Surah Fatihah 1:2

Simple Explanation:
Allah ek hain, unka koi shareek nahi.
Sirf wahi ibadat ke laiq hain.
12. Example — Prophet Muhammad ﷺ
Question
Who is Muhammad ﷺ?
Correct Retrieval

Retrieve:

Prophet-related Quran verses
first revelation hadith
messenger-related references
Correct Final Response Style
Prophet Muhammad ﷺ are the final Messenger of Allah sent for guidance of humanity.

Quran References:
- Quran 33:40
- Quran 21:107

Hadith References:
- Sahih al-Bukhari — Hadith 3
- Sahih Muslim — Hadith 160

Simple Explanation:
Allah sent Prophet Muhammad ﷺ to teach humanity:
- Tawheed
- good character
- mercy
- justice
- worship of Allah alone
13. Limit AI Creativity

Current issue:
AI over-explains unpredictably.

Required:

concise
grounded
structured
reference-focused

Avoid:

emotional AI filler
repeated motivational text
speculative explanations
14. Strong Semantic Islamic Engine

Implement:

multilingual embeddings
Islamic semantic graphs
transliteration matching
typo tolerance
emotional intent detection
synonym expansion
topic clustering
15. Required Search Architecture

Implement hybrid retrieval:

Exact Match
+
BM25
+
Vector Search
+
Semantic Expansion
+
Re-ranking

Fuse.js alone is insufficient.

16. AI Prompt Control

LLM prompt must strictly enforce:

Use ONLY the provided Quran and Hadith context.

Do NOT invent Islamic information.
Do NOT hallucinate references.
Do NOT generate unsupported explanations.

If context is insufficient,
say clearly that exact references were not found.
17. Performance Requirements

The system must be:

fast
scalable
deterministic
production-ready

Avoid:

full JSON scans
fs.readFile on every request
loading massive datasets repeatedly

Use:

indexing
embeddings
vector retrieval
caching
preprocessing
18. Final Goal

Hidhaya AI should become:

authentic
semantically intelligent
context-aware
multilingual
emotionally balanced
Quran/Hadith grounded
highly trustworthy

Core philosophy:

Authentic Retrieval First
AI Explanation Second

NOT:

Random AI Generation First