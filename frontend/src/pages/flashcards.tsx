import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeSelector from '@/components/ThemeSelector';

interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  category: string;
  difficulty: number; // 0-5 scale for spaced repetition
  nextReview: number; // timestamp
  interval: number; // days until next review
  repetitions: number;
  easeFactor: number; // 1.3-2.5 for SM-2 algorithm
}

interface Deck {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  totalCards: number;
  newCards: number;
  reviewCards: number;
}

interface ReviewSession {
  deckId: string;
  cards: Flashcard[];
  currentIndex: number;
  correctCount: number;
  wrongCount: number;
}

const DECKS: Deck[] = [
  {
    id: 'select-basics',
    name: 'SELECT Basics',
    description: 'Fundamental SELECT statements and column selection',
    category: 'SELECT',
    color: 'from-blue-500 to-cyan-500',
    totalCards: 8,
    newCards: 0,
    reviewCards: 0,
  },
  {
    id: 'where-filtering',
    name: 'WHERE & Filtering',
    description: 'Filtering data with WHERE clauses and conditions',
    category: 'WHERE',
    color: 'from-green-500 to-emerald-500',
    totalCards: 10,
    newCards: 0,
    reviewCards: 0,
  },
  {
    id: 'joins',
    name: 'JOINs',
    description: 'INNER, LEFT, RIGHT, and FULL OUTER JOINs',
    category: 'JOIN',
    color: 'from-purple-500 to-pink-500',
    totalCards: 12,
    newCards: 0,
    reviewCards: 0,
  },
  {
    id: 'aggregation',
    name: 'Aggregation Functions',
    description: 'COUNT, SUM, AVG, MIN, MAX, and GROUP BY',
    category: 'GROUP BY',
    color: 'from-orange-500 to-red-500',
    totalCards: 9,
    newCards: 0,
    reviewCards: 0,
  },
  {
    id: 'subqueries',
    name: 'Subqueries',
    description: 'Nested queries and correlated subqueries',
    category: 'SUBQUERY',
    color: 'from-indigo-500 to-purple-500',
    totalCards: 7,
    newCards: 0,
    reviewCards: 0,
  },
  {
    id: 'advanced',
    name: 'Advanced Concepts',
    description: 'Window functions, CTEs, and advanced queries',
    category: 'ADVANCED',
    color: 'from-pink-500 to-rose-500',
    totalCards: 10,
    newCards: 0,
    reviewCards: 0,
  },
];

const FLASHCARDS: Record<string, Flashcard[]> = {
  'select-basics': [
    { id: 'sb1', deckId: 'select-basics', question: 'What does SELECT * do?', answer: 'Selects all columns from a table', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb2', deckId: 'select-basics', question: 'How do you select specific columns?', answer: 'SELECT column1, column2 FROM table_name', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb3', deckId: 'select-basics', question: 'What does DISTINCT do?', answer: 'Removes duplicate rows from the result set', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb4', deckId: 'select-basics', question: 'How do you alias a column?', answer: 'SELECT column_name AS alias_name FROM table', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb5', deckId: 'select-basics', question: 'What is the purpose of LIMIT?', answer: 'Restricts the number of rows returned in the result set', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb6', deckId: 'select-basics', question: 'How do you concatenate columns?', answer: 'Use || operator or CONCAT() function: SELECT first_name || \' \' || last_name', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb7', deckId: 'select-basics', question: 'What does ORDER BY do?', answer: 'Sorts the result set by one or more columns (ASC or DESC)', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sb8', deckId: 'select-basics', question: 'How do you select from multiple tables?', answer: 'Use JOINs or comma-separated table names in FROM clause', category: 'SELECT', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
  ],
  'where-filtering': [
    { id: 'wf1', deckId: 'where-filtering', question: 'What operators can you use in WHERE?', answer: '=, !=, <, >, <=, >=, BETWEEN, IN, LIKE, IS NULL', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf2', deckId: 'where-filtering', question: 'How does BETWEEN work?', answer: 'WHERE column BETWEEN value1 AND value2 (inclusive)', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf3', deckId: 'where-filtering', question: 'What does IN do?', answer: 'Checks if value matches any value in a list: WHERE column IN (val1, val2, val3)', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf4', deckId: 'where-filtering', question: 'How do you use LIKE wildcards?', answer: '% matches any sequence of characters, _ matches single character', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf5', deckId: 'where-filtering', question: 'What is the difference between AND and OR?', answer: 'AND requires all conditions true; OR requires at least one condition true', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf6', deckId: 'where-filtering', question: 'How do you check for NULL values?', answer: 'Use IS NULL or IS NOT NULL (cannot use = NULL)', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf7', deckId: 'where-filtering', question: 'What does NOT do?', answer: 'Negates a condition: WHERE NOT column = value or WHERE column NOT IN (...)', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf8', deckId: 'where-filtering', question: 'How do you combine multiple conditions?', answer: 'Use parentheses to group: WHERE (condition1 OR condition2) AND condition3', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf9', deckId: 'where-filtering', question: 'What is LIKE case sensitivity?', answer: 'Depends on database collation; use ILIKE in PostgreSQL for case-insensitive', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'wf10', deckId: 'where-filtering', question: 'Can you use WHERE with aggregates?', answer: 'No, use HAVING for aggregate conditions (WHERE filters before grouping)', category: 'WHERE', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
  ],
  'joins': [
    { id: 'j1', deckId: 'joins', question: 'What is INNER JOIN?', answer: 'Returns rows that have matching values in both tables', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j2', deckId: 'joins', question: 'What is LEFT JOIN?', answer: 'Returns all rows from left table, matched rows from right (NULL if no match)', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j3', deckId: 'joins', question: 'What is RIGHT JOIN?', answer: 'Returns all rows from right table, matched rows from left (NULL if no match)', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j4', deckId: 'joins', question: 'What is FULL OUTER JOIN?', answer: 'Returns all rows from both tables, with NULLs for non-matches', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j5', deckId: 'joins', question: 'What is CROSS JOIN?', answer: 'Returns Cartesian product (all possible combinations) of two tables', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j6', deckId: 'joins', question: 'What is SELF JOIN?', answer: 'A table joined with itself, used to compare rows within same table', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j7', deckId: 'joins', question: 'When do you use ON vs USING?', answer: 'ON for complex conditions; USING when column names are identical', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j8', deckId: 'joins', question: 'Can you join more than two tables?', answer: 'Yes, chain multiple JOIN clauses: FROM t1 JOIN t2 ON ... JOIN t3 ON ...', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j9', deckId: 'joins', question: 'What is a NATURAL JOIN?', answer: 'Automatically joins on all columns with same names in both tables', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j10', deckId: 'joins', question: 'Performance tip for JOINs?', answer: 'Index the columns used in ON conditions; filter early with WHERE', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j11', deckId: 'joins', question: 'What is an ANTI JOIN?', answer: 'Returns rows from left table that have NO match in right (LEFT JOIN + WHERE right.id IS NULL)', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'j12', deckId: 'joins', question: 'What is a SEMI JOIN?', answer: 'Returns rows from left table that have a match in right (similar to EXISTS)', category: 'JOIN', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
  ],
  'aggregation': [
    { id: 'ag1', deckId: 'aggregation', question: 'What does COUNT(*) do?', answer: 'Counts all rows including NULLs', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag2', deckId: 'aggregation', question: 'COUNT(column) vs COUNT(*)?', answer: 'COUNT(column) excludes NULL values; COUNT(*) counts all rows', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag3', deckId: 'aggregation', question: 'What does GROUP BY do?', answer: 'Groups rows with same values in specified columns for aggregation', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag4', deckId: 'aggregation', question: 'What is HAVING?', answer: 'Filters grouped results (used with GROUP BY for aggregate conditions)', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag5', deckId: 'aggregation', question: 'HAVING vs WHERE?', answer: 'WHERE filters before grouping; HAVING filters after grouping', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag6', deckId: 'aggregation', question: 'What aggregate functions are available?', answer: 'COUNT, SUM, AVG, MIN, MAX, STRING_AGG, ARRAY_AGG', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag7', deckId: 'aggregation', question: 'Can you use DISTINCT with aggregates?', answer: 'Yes: COUNT(DISTINCT column) counts unique non-NULL values', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag8', deckId: 'aggregation', question: 'What is the rule for SELECT with GROUP BY?', answer: 'SELECT can only include grouped columns or aggregate functions', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'ag9', deckId: 'aggregation', question: 'Can you nest aggregate functions?', answer: 'No, you cannot nest aggregates like MAX(COUNT(*)) - use subquery instead', category: 'AGGREGATION', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
  ],
  'subqueries': [
    { id: 'sq1', deckId: 'subqueries', question: 'What is a subquery?', answer: 'A query nested inside another query, enclosed in parentheses', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sq2', deckId: 'subqueries', question: 'Where can subqueries be used?', answer: 'In SELECT, FROM, WHERE, HAVING clauses', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sq3', deckId: 'subqueries', question: 'What is a scalar subquery?', answer: 'Returns single value (one row, one column)', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sq4', deckId: 'subqueries', question: 'What is a correlated subquery?', answer: 'References columns from outer query; executed once per outer row', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sq5', deckId: 'subqueries', question: 'What does EXISTS do?', answer: 'Returns true if subquery returns any rows', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sq6', deckId: 'subqueries', question: 'IN vs EXISTS performance?', answer: 'EXISTS often faster for large datasets; IN better for small lists', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'sq7', deckId: 'subqueries', question: 'What is a derived table?', answer: 'Subquery in FROM clause that acts as a temporary table', category: 'SUBQUERY', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
  ],
  'advanced': [
    { id: 'adv1', deckId: 'advanced', question: 'What is a CTE?', answer: 'Common Table Expression: WITH cte AS (SELECT ...) SELECT FROM cte', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv2', deckId: 'advanced', question: 'What are window functions?', answer: 'Functions that operate on set of rows related to current row (OVER clause)', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv3', deckId: 'advanced', question: 'Common window functions?', answer: 'ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), NTILE()', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv4', deckId: 'advanced', question: 'What does PARTITION BY do?', answer: 'Divides result set into partitions for window function calculation', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv5', deckId: 'advanced', question: 'What is UNION?', answer: 'Combines results of two queries, removing duplicates', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv6', deckId: 'advanced', question: 'UNION vs UNION ALL?', answer: 'UNION removes duplicates; UNION ALL keeps all rows (faster)', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv7', deckId: 'advanced', question: 'What is CASE expression?', answer: 'Conditional logic: CASE WHEN condition THEN result ELSE default END', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv8', deckId: 'advanced', question: 'What is COALESCE?', answer: 'Returns first non-NULL value: COALESCE(val1, val2, default)', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv9', deckId: 'advanced', question: 'What is a recursive CTE?', answer: 'CTE that references itself, used for hierarchical data', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
    { id: 'adv10', deckId: 'advanced', question: 'What are indexes?', answer: 'Data structures that improve query performance by allowing faster lookups', category: 'ADVANCED', difficulty: 0, nextReview: 0, interval: 0, repetitions: 0, easeFactor: 2.5 },
  ],
};

export default function Flashcards() {
  const { themeId, setThemeId, showThemeSelector, setShowThemeSelector } = useTheme();
  const [decks, setDecks] = useState<Deck[]>(DECKS);
  const [flashcards, setFlashcards] = useState<Record<string, Flashcard[]>>({});
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = () => {
    const saved = localStorage.getItem('flashcards');
    if (saved) {
      const savedCards = JSON.parse(saved);
      setFlashcards(savedCards);
      updateDeckStats(savedCards);
    } else {
      // Initialize with default cards
      localStorage.setItem('flashcards', JSON.stringify(FLASHCARDS));
      setFlashcards(FLASHCARDS);
      updateDeckStats(FLASHCARDS);
    }
  };

  const updateDeckStats = (cards: Record<string, Flashcard[]>) => {
    const now = Date.now();
    const updatedDecks = DECKS.map(deck => {
      const deckCards = cards[deck.id] || [];
      const reviewCards = deckCards.filter(c => c.nextReview > 0 && c.nextReview <= now).length;
      const newCards = deckCards.filter(c => c.nextReview === 0).length;
      
      return {
        ...deck,
        reviewCards,
        newCards,
      };
    });
    setDecks(updatedDecks);
  };

  const startReview = (deckId: string) => {
    const deckCards = flashcards[deckId] || FLASHCARDS[deckId] || [];
    const now = Date.now();
    
    // Get cards due for review and new cards (limit to 20 per session)
    const dueCards = deckCards.filter(c => c.nextReview > 0 && c.nextReview <= now);
    const newCards = deckCards.filter(c => c.nextReview === 0).slice(0, 10);
    const reviewCards = [...dueCards, ...newCards].slice(0, 20);
    
    if (reviewCards.length === 0) {
      alert('No cards to review right now! Come back later.');
      return;
    }

    // Shuffle cards
    const shuffled = reviewCards.sort(() => Math.random() - 0.5);
    
    setReviewSession({
      deckId,
      cards: shuffled,
      currentIndex: 0,
      correctCount: 0,
      wrongCount: 0,
    });
    setFlipped(false);
  };

  const rateCard = (quality: number) => {
    if (!reviewSession) return;

    const currentCard = reviewSession.cards[reviewSession.currentIndex];
    const updatedCard = updateCardStats(currentCard, quality);

    // Update in flashcards state
    const updatedFlashcards = {
      ...flashcards,
      [reviewSession.deckId]: (flashcards[reviewSession.deckId] || FLASHCARDS[reviewSession.deckId]).map(c =>
        c.id === currentCard.id ? updatedCard : c
      ),
    };
    
    setFlashcards(updatedFlashcards);
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));

    // Move to next card
    if (reviewSession.currentIndex < reviewSession.cards.length - 1) {
      setReviewSession({
        ...reviewSession,
        currentIndex: reviewSession.currentIndex + 1,
        correctCount: reviewSession.correctCount + (quality >= 3 ? 1 : 0),
        wrongCount: reviewSession.wrongCount + (quality < 3 ? 1 : 0),
      });
      setFlipped(false);
    } else {
      // Session complete
      setReviewSession({
        ...reviewSession,
        correctCount: reviewSession.correctCount + (quality >= 3 ? 1 : 0),
        wrongCount: reviewSession.wrongCount + (quality < 3 ? 1 : 0),
      });
      setShowStats(true);
      updateDeckStats(updatedFlashcards);
    }
  };

  // SM-2 Spaced Repetition Algorithm
  const updateCardStats = (card: Flashcard, quality: number): Flashcard => {
    let { repetitions, interval, easeFactor } = card;

    if (quality >= 3) {
      // Correct response
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
    } else {
      // Incorrect response - reset
      repetitions = 0;
      interval = 1;
    }

    // Update ease factor
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000; // Convert days to ms

    return {
      ...card,
      repetitions,
      interval,
      easeFactor,
      nextReview,
      difficulty: quality,
    };
  };

  const finishSession = () => {
    setReviewSession(null);
    setShowStats(false);
    setFlipped(false);
    loadFlashcards();
  };

  const getTotalCards = () => {
    return Object.values(flashcards).reduce((sum, cards) => sum + cards.length, 0) || 
           Object.values(FLASHCARDS).reduce((sum, cards) => sum + cards.length, 0);
  };

  const getReviewDue = () => {
    const now = Date.now();
    return Object.values(flashcards).flat().filter(c => c.nextReview > 0 && c.nextReview <= now).length;
  };

  const getMasteredCards = () => {
    return Object.values(flashcards).flat().filter(c => c.repetitions >= 5).length;
  };

  return (
    <>
      <Head>
        <title>Flashcards - VisualSQL</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    VisualSQL
                  </span>
                </Link>
                <nav className="flex items-center space-x-4">
                  <Link href="/modules" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Modules
                  </Link>
                  <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Dashboard
                  </Link>
                  <Link href="/challenges" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Challenges
                  </Link>
                  <Link href="/flashcards" className="text-blue-600 dark:text-blue-400 font-semibold">
                    Flashcards
                  </Link>
                </nav>
              </div>
              <button
                onClick={() => setShowThemeSelector(true)}
                className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                title="Choose Theme"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Review Session */}
        <AnimatePresence>
          {reviewSession && !showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full"
              >
                {/* Progress Bar */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Card {reviewSession.currentIndex + 1} of {reviewSession.cards.length}
                    </span>
                    <button
                      onClick={finishSession}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${((reviewSession.currentIndex + 1) / reviewSession.cards.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Flashcard */}
                <div className="p-8">
                  <motion.div
                    className="relative h-64 cursor-pointer"
                    onClick={() => setFlipped(!flipped)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <AnimatePresence mode="wait">
                      {!flipped ? (
                        <motion.div
                          key="question"
                          initial={{ rotateY: 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: -90 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center p-8 text-white"
                        >
                          <div className="text-center">
                            <div className="text-sm font-semibold mb-4 opacity-90">QUESTION</div>
                            <div className="text-2xl font-bold">
                              {reviewSession.cards[reviewSession.currentIndex].question}
                            </div>
                            <div className="mt-6 text-sm opacity-75">Click to reveal answer</div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="answer"
                          initial={{ rotateY: 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: -90 }}
                          transition={{ duration: 0.3 }}
                          className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg flex items-center justify-center p-8 text-white"
                        >
                          <div className="text-center">
                            <div className="text-sm font-semibold mb-4 opacity-90">ANSWER</div>
                            <div className="text-xl font-semibold">
                              {reviewSession.cards[reviewSession.currentIndex].answer}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Rating Buttons */}
                {flipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                      How well did you know this?
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      <button
                        onClick={() => rateCard(1)}
                        className="px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg font-semibold transition-colors"
                      >
                        Again
                        <div className="text-xs opacity-75">&lt;1 day</div>
                      </button>
                      <button
                        onClick={() => rateCard(2)}
                        className="px-4 py-3 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 rounded-lg font-semibold transition-colors"
                      >
                        Hard
                        <div className="text-xs opacity-75">1 day</div>
                      </button>
                      <button
                        onClick={() => rateCard(3)}
                        className="px-4 py-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg font-semibold transition-colors"
                      >
                        Good
                        <div className="text-xs opacity-75">3 days</div>
                      </button>
                      <button
                        onClick={() => rateCard(5)}
                        className="px-4 py-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg font-semibold transition-colors"
                      >
                        Easy
                        <div className="text-xs opacity-75">7+ days</div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Session Complete Stats */}
        <AnimatePresence>
          {showStats && reviewSession && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Session Complete!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Great job reviewing your flashcards!
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {reviewSession.correctCount}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-500">Correct</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {reviewSession.wrongCount}
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-500">Needs Practice</div>
                  </div>
                </div>

                <button
                  onClick={finishSession}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getTotalCards()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Cards</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getReviewDue()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Due for Review</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{getMasteredCards()}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Mastered</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Decks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Your Decks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck, idx) => (
                <motion.div
                  key={deck.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden"
                >
                  <div className={`h-32 bg-gradient-to-r ${deck.color} p-6 text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{deck.name}</h3>
                    <p className="text-sm opacity-90">{deck.description}</p>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{deck.newCards}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">New</div>
                        </div>
                        <div>
                          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{deck.reviewCards}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Review</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{deck.totalCards}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                    </div>
                    <button
                      onClick={() => startReview(deck.id)}
                      disabled={deck.newCards === 0 && deck.reviewCards === 0}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    >
                      {deck.newCards > 0 || deck.reviewCards > 0 ? 'Study Now' : 'No Cards Due'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">How Spaced Repetition Works</h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                  Our flashcard system uses the SM-2 spaced repetition algorithm to optimize your learning. Cards you know well are shown less frequently, while challenging cards appear more often. This scientifically-proven method helps you remember concepts long-term.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    <div className="font-semibold text-red-700 dark:text-red-400">Again</div>
                    <div className="text-xs text-red-600 dark:text-red-500">Didn't remember - see again soon</div>
                  </div>
                  <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
                    <div className="font-semibold text-orange-700 dark:text-orange-400">Hard</div>
                    <div className="text-xs text-orange-600 dark:text-orange-500">Struggled - review tomorrow</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <div className="font-semibold text-blue-700 dark:text-blue-400">Good</div>
                    <div className="text-xs text-blue-600 dark:text-blue-500">Remembered well - review in 3 days</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                    <div className="font-semibold text-green-700 dark:text-green-400">Easy</div>
                    <div className="text-xs text-green-600 dark:text-green-500">Very easy - review in a week+</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Theme Selector */}
        <ThemeSelector
          isOpen={showThemeSelector}
          onClose={() => setShowThemeSelector(false)}
          currentTheme={themeId}
          onThemeChange={setThemeId}
        />
      </div>
    </>
  );
}
