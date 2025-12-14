import { useState } from 'react';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  query: string;
  schema: string;
}

interface QueryTemplatesProps {
  onSelectTemplate: (query: string) => void;
}

const templates: Template[] = [
  // Basic Queries
  {
    id: 'tpl-01',
    title: 'Select All',
    description: 'Basic SELECT all columns',
    category: 'Basic',
    query: 'SELECT * FROM employees',
    schema: 'employees',
  },
  {
    id: 'tpl-02',
    title: 'Select Specific Columns',
    description: 'Select only certain columns',
    category: 'Basic',
    query: 'SELECT name, salary, position FROM employees',
    schema: 'employees',
  },
  {
    id: 'tpl-03',
    title: 'Filter with WHERE',
    description: 'Basic filtering',
    category: 'Basic',
    query: 'SELECT * FROM employees WHERE salary > 80000',
    schema: 'employees',
  },
  {
    id: 'tpl-04',
    title: 'Sort Results',
    description: 'ORDER BY example',
    category: 'Basic',
    query: 'SELECT * FROM employees ORDER BY salary DESC',
    schema: 'employees',
  },
  // Joins
  {
    id: 'tpl-05',
    title: 'INNER JOIN',
    description: 'Join two tables',
    category: 'Joins',
    query: 'SELECT e.name, e.salary, d.name AS department\nFROM employees e\nINNER JOIN departments d ON e.dept_id = d.id',
    schema: 'employees',
  },
  {
    id: 'tpl-06',
    title: 'LEFT JOIN',
    description: 'Include all left table rows',
    category: 'Joins',
    query: 'SELECT e.name, e.salary, d.name AS department\nFROM employees e\nLEFT JOIN departments d ON e.dept_id = d.id',
    schema: 'employees',
  },
  {
    id: 'tpl-07',
    title: 'Multiple Joins',
    description: 'Join three tables',
    category: 'Joins',
    query: 'SELECT s.name, c.name AS course, e.grade\nFROM students s\nJOIN enrollments e ON s.id = e.student_id\nJOIN courses c ON c.id = e.course_id',
    schema: 'students',
  },
  // Aggregations
  {
    id: 'tpl-08',
    title: 'COUNT Rows',
    description: 'Count total rows',
    category: 'Aggregations',
    query: 'SELECT COUNT(*) as total FROM employees',
    schema: 'employees',
  },
  {
    id: 'tpl-09',
    title: 'GROUP BY with Aggregates',
    description: 'Group and count',
    category: 'Aggregations',
    query: 'SELECT dept_id, COUNT(*) as count, AVG(salary) as avg_salary\nFROM employees\nGROUP BY dept_id',
    schema: 'employees',
  },
  {
    id: 'tpl-10',
    title: 'HAVING Filter',
    description: 'Filter grouped results',
    category: 'Aggregations',
    query: 'SELECT dept_id, COUNT(*) as count\nFROM employees\nGROUP BY dept_id\nHAVING COUNT(*) > 2',
    schema: 'employees',
  },
  {
    id: 'tpl-11',
    title: 'Multiple Aggregates',
    description: 'Multiple aggregate functions',
    category: 'Aggregations',
    query: 'SELECT\n  COUNT(*) as total,\n  AVG(salary) as avg_salary,\n  MAX(salary) as max_salary,\n  MIN(salary) as min_salary\nFROM employees',
    schema: 'employees',
  },
  // Subqueries
  {
    id: 'tpl-12',
    title: 'Scalar Subquery',
    description: 'Compare to average',
    category: 'Subqueries',
    query: 'SELECT name, salary\nFROM employees\nWHERE salary > (SELECT AVG(salary) FROM employees)',
    schema: 'employees',
  },
  {
    id: 'tpl-13',
    title: 'IN Subquery',
    description: 'Filter with subquery list',
    category: 'Subqueries',
    query: 'SELECT * FROM employees\nWHERE dept_id IN (\n  SELECT id FROM departments WHERE name LIKE \'%Engineering%\'\n)',
    schema: 'employees',
  },
  {
    id: 'tpl-14',
    title: 'EXISTS Subquery',
    description: 'Check for existence',
    category: 'Subqueries',
    query: 'SELECT * FROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o WHERE o.customer_id = c.id\n)',
    schema: 'orders',
  },
  // Advanced
  {
    id: 'tpl-15',
    title: 'CASE WHEN',
    description: 'Conditional logic',
    category: 'Advanced',
    query: 'SELECT name, salary,\n  CASE\n    WHEN salary >= 100000 THEN \'High\'\n    WHEN salary >= 70000 THEN \'Medium\'\n    ELSE \'Low\'\n  END as salary_level\nFROM employees',
    schema: 'employees',
  },
  {
    id: 'tpl-16',
    title: 'CTE (WITH clause)',
    description: 'Common Table Expression',
    category: 'Advanced',
    query: 'WITH high_earners AS (\n  SELECT * FROM employees WHERE salary > 80000\n)\nSELECT * FROM high_earners WHERE dept_id = 1',
    schema: 'employees',
  },
  {
    id: 'tpl-17',
    title: 'Window Function',
    description: 'ROW_NUMBER ranking',
    category: 'Advanced',
    query: 'SELECT name, salary,\n  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank\nFROM employees',
    schema: 'employees',
  },
  {
    id: 'tpl-18',
    title: 'NULL Handling',
    description: 'COALESCE for defaults',
    category: 'Advanced',
    query: 'SELECT name,\n  COALESCE(dept_id, 0) as dept_id,\n  COALESCE(salary, 50000) as salary\nFROM employees',
    schema: 'employees',
  },
  // String Functions
  {
    id: 'tpl-19',
    title: 'String Concatenation',
    description: 'Combine strings',
    category: 'String Functions',
    query: 'SELECT name || \' - \' || position as employee_info\nFROM employees',
    schema: 'employees',
  },
  {
    id: 'tpl-20',
    title: 'String Transformation',
    description: 'UPPER, LOWER, TRIM',
    category: 'String Functions',
    query: 'SELECT\n  UPPER(name) as upper_name,\n  LOWER(name) as lower_name,\n  LENGTH(name) as name_length\nFROM employees',
    schema: 'employees',
  },
  // Operators
  {
    id: 'tpl-21',
    title: 'IN Operator',
    description: 'Match multiple values',
    category: 'Operators',
    query: 'SELECT * FROM employees\nWHERE dept_id IN (1, 2, 3)',
    schema: 'employees',
  },
  {
    id: 'tpl-22',
    title: 'BETWEEN Range',
    description: 'Range filtering',
    category: 'Operators',
    query: 'SELECT name, salary\nFROM employees\nWHERE salary BETWEEN 70000 AND 100000',
    schema: 'employees',
  },
  {
    id: 'tpl-23',
    title: 'LIKE Pattern Match',
    description: 'Pattern matching',
    category: 'Operators',
    query: 'SELECT * FROM employees\nWHERE name LIKE \'%son%\'',
    schema: 'employees',
  },
];

export default function QueryTemplates({ onSelectTemplate }: QueryTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
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

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template.query)}
            className="w-full text-left p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors group"
          >
            <div className="flex items-start justify-between mb-1">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {template.title}
              </h4>
              <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded">
                {template.category}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{template.description}</p>
            <code className="text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded block overflow-x-auto whitespace-pre">
              {template.query.split('\n')[0]}{template.query.includes('\n') ? '...' : ''}
            </code>
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No templates in this category
        </p>
      )}
    </div>
  );
}
