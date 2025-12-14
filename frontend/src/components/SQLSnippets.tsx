import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Snippet {
  id: string;
  name: string;
  category: string;
  code: string;
  description: string;
  tags: string[];
}

interface SQLSnippetsProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (code: string) => void;
}

const CATEGORIES = [
  'All',
  'SELECT',
  'JOIN',
  'Subqueries',
  'Aggregation',
  'Window Functions',
  'CTEs',
  'Data Modification',
  'Utilities',
];

const DEFAULT_SNIPPETS: Snippet[] = [
  {
    id: 's1',
    name: 'Basic SELECT',
    category: 'SELECT',
    code: 'SELECT column1, column2\nFROM table_name\nWHERE condition;',
    description: 'Basic SELECT statement with WHERE clause',
    tags: ['select', 'where', 'basic'],
  },
  {
    id: 's2',
    name: 'INNER JOIN',
    category: 'JOIN',
    code: 'SELECT a.*, b.*\nFROM table_a a\nINNER JOIN table_b b ON a.id = b.a_id;',
    description: 'Inner join between two tables',
    tags: ['join', 'inner'],
  },
  {
    id: 's3',
    name: 'LEFT JOIN',
    category: 'JOIN',
    code: 'SELECT a.*, b.*\nFROM table_a a\nLEFT JOIN table_b b ON a.id = b.a_id;',
    description: 'Left outer join',
    tags: ['join', 'left', 'outer'],
  },
  {
    id: 's4',
    name: 'Subquery in WHERE',
    category: 'Subqueries',
    code: 'SELECT *\nFROM employees\nWHERE salary > (\n  SELECT AVG(salary)\n  FROM employees\n);',
    description: 'Subquery to filter records',
    tags: ['subquery', 'where', 'avg'],
  },
  {
    id: 's5',
    name: 'Correlated Subquery',
    category: 'Subqueries',
    code: 'SELECT e1.*\nFROM employees e1\nWHERE salary > (\n  SELECT AVG(e2.salary)\n  FROM employees e2\n  WHERE e2.department_id = e1.department_id\n);',
    description: 'Subquery that references outer query',
    tags: ['subquery', 'correlated'],
  },
  {
    id: 's6',
    name: 'GROUP BY with HAVING',
    category: 'Aggregation',
    code: 'SELECT department, COUNT(*), AVG(salary)\nFROM employees\nGROUP BY department\nHAVING COUNT(*) > 5;',
    description: 'Aggregate with grouping and filtering',
    tags: ['group', 'having', 'count', 'avg'],
  },
  {
    id: 's7',
    name: 'Multiple Aggregates',
    category: 'Aggregation',
    code: 'SELECT \n  COUNT(*) as total,\n  SUM(amount) as sum_amount,\n  AVG(amount) as avg_amount,\n  MIN(amount) as min_amount,\n  MAX(amount) as max_amount\nFROM orders;',
    description: 'Multiple aggregate functions',
    tags: ['count', 'sum', 'avg', 'min', 'max'],
  },
  {
    id: 's8',
    name: 'ROW_NUMBER',
    category: 'Window Functions',
    code: 'SELECT \n  *,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank\nFROM employees;',
    description: 'Assign row numbers',
    tags: ['window', 'row_number', 'rank'],
  },
  {
    id: 's9',
    name: 'RANK by Partition',
    category: 'Window Functions',
    code: 'SELECT \n  *,\n  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as dept_rank\nFROM employees;',
    description: 'Rank within partitions',
    tags: ['window', 'rank', 'partition'],
  },
  {
    id: 's10',
    name: 'Running Total',
    category: 'Window Functions',
    code: 'SELECT \n  date,\n  amount,\n  SUM(amount) OVER (ORDER BY date) as running_total\nFROM transactions;',
    description: 'Calculate running/cumulative sum',
    tags: ['window', 'sum', 'running total'],
  },
  {
    id: 's11',
    name: 'Basic CTE',
    category: 'CTEs',
    code: 'WITH cte_name AS (\n  SELECT column1, column2\n  FROM table_name\n  WHERE condition\n)\nSELECT * FROM cte_name;',
    description: 'Common Table Expression',
    tags: ['cte', 'with'],
  },
  {
    id: 's12',
    name: 'Multiple CTEs',
    category: 'CTEs',
    code: 'WITH \n  cte1 AS (SELECT * FROM table1),\n  cte2 AS (SELECT * FROM table2)\nSELECT *\nFROM cte1\nJOIN cte2 ON cte1.id = cte2.id;',
    description: 'Multiple CTEs in one query',
    tags: ['cte', 'multiple', 'join'],
  },
  {
    id: 's13',
    name: 'Recursive CTE',
    category: 'CTEs',
    code: 'WITH RECURSIVE cte AS (\n  SELECT 1 as n\n  UNION ALL\n  SELECT n + 1 FROM cte WHERE n < 10\n)\nSELECT * FROM cte;',
    description: 'Recursive Common Table Expression',
    tags: ['cte', 'recursive', 'union'],
  },
  {
    id: 's14',
    name: 'INSERT with VALUES',
    category: 'Data Modification',
    code: "INSERT INTO table_name (column1, column2)\nVALUES ('value1', 'value2');",
    description: 'Insert single row',
    tags: ['insert', 'values'],
  },
  {
    id: 's15',
    name: 'INSERT with SELECT',
    category: 'Data Modification',
    code: 'INSERT INTO table_dest (column1, column2)\nSELECT column1, column2\nFROM table_source\nWHERE condition;',
    description: 'Insert from another table',
    tags: ['insert', 'select'],
  },
  {
    id: 's16',
    name: 'UPDATE with JOIN',
    category: 'Data Modification',
    code: 'UPDATE a\nSET a.column1 = b.column1\nFROM table_a a\nINNER JOIN table_b b ON a.id = b.a_id\nWHERE condition;',
    description: 'Update using join',
    tags: ['update', 'join'],
  },
  {
    id: 's17',
    name: 'DELETE with Subquery',
    category: 'Data Modification',
    code: 'DELETE FROM table_name\nWHERE id IN (\n  SELECT id FROM other_table WHERE condition\n);',
    description: 'Delete using subquery',
    tags: ['delete', 'subquery', 'in'],
  },
  {
    id: 's18',
    name: 'CASE Statement',
    category: 'Utilities',
    code: 'SELECT \n  column1,\n  CASE \n    WHEN condition1 THEN result1\n    WHEN condition2 THEN result2\n    ELSE default_result\n  END as new_column\nFROM table_name;',
    description: 'Conditional logic with CASE',
    tags: ['case', 'when', 'conditional'],
  },
  {
    id: 's19',
    name: 'UNION ALL',
    category: 'Utilities',
    code: 'SELECT column1, column2 FROM table1\nUNION ALL\nSELECT column1, column2 FROM table2;',
    description: 'Combine results from multiple queries',
    tags: ['union', 'combine'],
  },
  {
    id: 's20',
    name: 'DISTINCT ON',
    category: 'SELECT',
    code: 'SELECT DISTINCT ON (column1) *\nFROM table_name\nORDER BY column1, column2 DESC;',
    description: 'Get distinct rows by specific column',
    tags: ['distinct', 'select'],
  },
  {
    id: 's21',
    name: 'COALESCE',
    category: 'Utilities',
    code: 'SELECT \n  column1,\n  COALESCE(column2, column3, \'default\') as result\nFROM table_name;',
    description: 'Return first non-null value',
    tags: ['coalesce', 'null', 'default'],
  },
  {
    id: 's22',
    name: 'String Concatenation',
    category: 'Utilities',
    code: "SELECT \n  first_name || ' ' || last_name as full_name\nFROM employees;",
    description: 'Concatenate strings',
    tags: ['concat', 'string'],
  },
  {
    id: 's23',
    name: 'Date Functions',
    category: 'Utilities',
    code: "SELECT \n  CURRENT_DATE as today,\n  CURRENT_TIMESTAMP as now,\n  DATE_PART('year', date_column) as year,\n  DATE_TRUNC('month', date_column) as month_start\nFROM table_name;",
    description: 'Common date operations',
    tags: ['date', 'time', 'current'],
  },
  {
    id: 's24',
    name: 'LIKE Pattern Match',
    category: 'SELECT',
    code: "SELECT *\nFROM table_name\nWHERE column LIKE '%pattern%';",
    description: 'Pattern matching with wildcards',
    tags: ['like', 'pattern', 'wildcard'],
  },
  {
    id: 's25',
    name: 'IN with List',
    category: 'SELECT',
    code: "SELECT *\nFROM table_name\nWHERE column IN ('value1', 'value2', 'value3');",
    description: 'Filter by list of values',
    tags: ['in', 'list', 'where'],
  },
  {
    id: 's26',
    name: 'BETWEEN Range',
    category: 'SELECT',
    code: 'SELECT *\nFROM table_name\nWHERE column BETWEEN value1 AND value2;',
    description: 'Filter by range',
    tags: ['between', 'range', 'where'],
  },
  {
    id: 's27',
    name: 'EXISTS Check',
    category: 'Subqueries',
    code: 'SELECT *\nFROM table_a a\nWHERE EXISTS (\n  SELECT 1 FROM table_b b\n  WHERE b.a_id = a.id\n);',
    description: 'Check for existence',
    tags: ['exists', 'subquery'],
  },
  {
    id: 's28',
    name: 'FULL OUTER JOIN',
    category: 'JOIN',
    code: 'SELECT a.*, b.*\nFROM table_a a\nFULL OUTER JOIN table_b b ON a.id = b.a_id;',
    description: 'Full outer join',
    tags: ['join', 'full', 'outer'],
  },
  {
    id: 's29',
    name: 'CROSS JOIN',
    category: 'JOIN',
    code: 'SELECT a.*, b.*\nFROM table_a a\nCROSS JOIN table_b b;',
    description: 'Cartesian product',
    tags: ['join', 'cross', 'cartesian'],
  },
  {
    id: 's30',
    name: 'SELF JOIN',
    category: 'JOIN',
    code: 'SELECT a.*, b.*\nFROM employees a\nJOIN employees b ON a.manager_id = b.id;',
    description: 'Join table to itself',
    tags: ['join', 'self'],
  },
];

export default function SQLSnippets({ isOpen, onClose, onInsert }: SQLSnippetsProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [filteredSnippets, setFilteredSnippets] = useState<Snippet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    name: '',
    category: 'SELECT',
    code: '',
    description: '',
    tags: '',
  });

  useEffect(() => {
    loadSnippets();
  }, []);

  useEffect(() => {
    filterSnippets();
  }, [snippets, selectedCategory, searchTerm]);

  const loadSnippets = () => {
    const stored = localStorage.getItem('visualsql_snippets');
    if (stored) {
      setSnippets(JSON.parse(stored));
    } else {
      setSnippets(DEFAULT_SNIPPETS);
      localStorage.setItem('visualsql_snippets', JSON.stringify(DEFAULT_SNIPPETS));
    }
  };

  const saveSnippets = (newSnippets: Snippet[]) => {
    setSnippets(newSnippets);
    localStorage.setItem('visualsql_snippets', JSON.stringify(newSnippets));
  };

  const filterSnippets = () => {
    let filtered = snippets;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.tags.some(t => t.includes(term)) ||
        s.code.toLowerCase().includes(term)
      );
    }

    setFilteredSnippets(filtered);
  };

  const addSnippet = () => {
    if (!newSnippet.name || !newSnippet.code) {
      alert('Name and code are required');
      return;
    }

    const snippet: Snippet = {
      id: `custom-${Date.now()}`,
      name: newSnippet.name,
      category: newSnippet.category,
      code: newSnippet.code,
      description: newSnippet.description,
      tags: newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    saveSnippets([...snippets, snippet]);
    setNewSnippet({ name: '', category: 'SELECT', code: '', description: '', tags: '' });
    setShowAddDialog(false);
  };

  const deleteSnippet = (id: string) => {
    if (confirm('Delete this snippet?')) {
      saveSnippets(snippets.filter(s => s.id !== id));
    }
  };

  const exportSnippets = () => {
    const dataStr = JSON.stringify(snippets, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sql-snippets-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSnippets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        saveSnippets([...snippets, ...imported]);
        alert(`Imported ${imported.length} snippets`);
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold">SQL Snippets Library</h2>
                <p className="text-indigo-100 text-sm">{snippets.length} total snippets</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search snippets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddDialog(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                + Add
              </button>
              <button onClick={exportSnippets} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Export
              </button>
              <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer">
                Import
                <input type="file" accept=".json" onChange={importSnippets} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 overflow-x-auto">
          <div className="flex gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No snippets found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredSnippets.map(snippet => (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{snippet.name}</h3>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded">
                        {snippet.category}
                      </span>
                    </div>
                    {snippet.id.startsWith('custom-') && (
                      <button
                        onClick={() => deleteSnippet(snippet.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{snippet.description}</p>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto text-gray-900 dark:text-gray-100 mb-3">
{snippet.code}
                  </pre>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onInsert(snippet.code);
                        onClose();
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      Insert
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(snippet.code)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                      title="Copy"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Add Snippet Dialog */}
        <AnimatePresence>
          {showAddDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowAddDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Add Custom Snippet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newSnippet.name}
                      onChange={(e) => setNewSnippet({ ...newSnippet, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                      value={newSnippet.category}
                      onChange={(e) => setNewSnippet({ ...newSnippet, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SQL Code</label>
                    <textarea
                      value={newSnippet.code}
                      onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm min-h-[150px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input
                      type="text"
                      value={newSnippet.description}
                      onChange={(e) => setNewSnippet({ ...newSnippet, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={newSnippet.tags}
                      onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowAddDialog(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addSnippet}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Add Snippet
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
