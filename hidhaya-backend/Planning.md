Implement all features and improvements according to the PRD without breaking or removing any existing working functionality. Before modifying or deleting any code, first verify whether it is already working correctly. Improve the AI retrieval pipeline, semantic Islamic search engine, multilingual understanding, RAG-based Quran & Hadith reference system, response quality, performance, scalability, and language-specific replies while maintaining backward compatibility and stable APIs/UI. Focus on clean architecture, optimized performance, accurate dataset-based references, and production-level reliability.

PRD — Hidhaya AI Intelligent Islamic Understanding & Answering System
Objective

Train and improve Hidhaya AI to become a highly accurate, intelligent, multilingual Islamic AI assistant that:

understands user intent deeply
retrieves correct Quran & Hadith references
explains Islam wisely and clearly
gives emotionally intelligent responses
avoids hallucinations
answers according to the selected language
scales to millions of Quran and Hadith records

The system must prioritize:

Authentic Islamic references + Intelligent explanation + Fast retrieval.

Core Goal

Current issue:

The AI retrieves random or unrelated references and gives weak explanations.

Required improvement:

Hidhaya AI must first UNDERSTAND the question properly before generating an answer.

Required Final AI Flow
User Question
   ↓
Language Detection
   ↓
Query Normalization
   ↓
Intent Detection
   ↓
Islamic Semantic Understanding
   ↓
Topic Classification
   ↓
Hybrid Search Engine
   ↓
Reference Ranking
   ↓
Confidence Scoring
   ↓
Context Builder
   ↓
Gemini AI Explanation Layer
   ↓
Final Structured Response
1. Intelligent Question Understanding

The AI must understand:

meaning
emotion
Islamic intent
topic
related concepts
language variations

Example:

User Query	AI Understanding
Allah kon hain	Allah / Tawheed
shirk kise kahte hai	Shirk / polytheism
sabr kya hai	patience
iman kya hai	faith / belief
bachon ki talim	tarbiyah

The system should understand concepts instead of relying only on exact keywords.

2. Massive Islamic Semantic Engine

Build a large-scale Islamic semantic mapping system.

The engine must support:

synonyms
transliterations
spelling mistakes
root words
emotional intent
semantic relationships
Islamic terminology

Supported languages:

English
Urdu
Hindi
Bengali
Roman Urdu
Arabic

Example:

{
  "sabr": [
    "patience",
    "dhairya",
    "dheeraj",
    "صبر",
    "ধৈর্য"
  ]
}
3. Hybrid Search Architecture

Do NOT rely only on simple keyword search.

Implement:

Layer 1 — Exact Match

Highest priority exact phrase matching.

Layer 2 — BM25 Full Text Search

Fast ranked retrieval for millions of records.

Layer 3 — Semantic Search

Embedding/vector similarity search.

Layer 4 — Fuzzy Search

Handle spelling mistakes and transliterations.

Example:

sherk → shirk
dhiraj → sabr
4. Recommended Technologies
Search Engine

Recommended:

Elasticsearch / OpenSearch

OR

Meilisearch
Vector Database

Recommended:

Qdrant
Embedding Models

Recommended multilingual models:

bge-m3
multilingual-e5-large

These support:

Arabic
Urdu
Hindi
Bengali
English
5. Proper RAG System

Implement Retrieval-Augmented Generation.

Correct flow:

Search local Quran & Hadith datasets
   ↓
Retrieve authentic references
   ↓
Send ONLY retrieved references to Gemini
   ↓
Gemini simplifies and explains

Gemini must NEVER generate references independently.

6. Strict Dataset-Based References

AI must ONLY use references from:

Quran JSON
Hadith JSON

Rules:

never invent references
never hallucinate Hadith
never use external Islamic sources

If no relevant reference exists:

Return:

“No exact reference was found in the current dataset. Please consult a qualified Islamic scholar.”

7. Intelligent Ranking System

Rank references using:

Factor	Priority
exact match	highest
phrase match	high
semantic similarity	high
topic relevance	high
narrator match	medium
fuzzy similarity	low
8. Confidence-Based Responses
HIGH Confidence

Return:

Quran references
Hadith references
structured Islamic explanation
MEDIUM Confidence

Return:

semantic references
simplified understanding
LOW Confidence

Do NOT generate fake references.

Return respectful fallback guidance.

9. Language-Aware Responses

If user selects:

Hindi → answer in Hindi
Urdu → answer in Urdu
Bengali → answer in Bengali
English → answer in English

The response language must strictly follow user settings.

10. AI Response Quality Improvements

Gemini AI should:

simplify Islamic teachings
explain context clearly
answer emotionally and respectfully
maintain authenticity
generate beautiful structured responses

The AI should NOT:

hallucinate
generate random references
give unrelated answers
11. Recommended Response Structure
Title
Short Summary
Quran Guidance
Hadith Guidance
Simple Explanation
Practical Lessons
Closing Advice
References
12. Performance & Scalability

The system must support:

millions of Hadith
full Quran
multilingual translations
semantic indexing
fast retrieval

Requirements:

avoid fs.readFile for runtime searching
use indexed databases
use caching
use async processing
optimize memory usage
13. Final Goal

Hidhaya AI should become:

highly accurate
context-aware
semantic-search powered
multilingual
emotionally intelligent
authentic
trustworthy
scalable
fast
expert-level Islamic AI assistant

with:

Quran & Hadith grounded intelligent Islamic understanding.