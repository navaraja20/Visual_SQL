export interface Module {
  id: string;
  title: string;
  category: 'basics' | 'filtering' | 'joins' | 'aggregation' | 'set-operations' | 'subqueries' | 'advanced' | 'dml' | 'ddl';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  description: string;
  content: string;
  sampleQueries: Array<{
    title: string;
    query: string;
    description: string;
  }>;
  recommendedSchema: string;
  hints?: string[];
}

export const modules: Module[] = [
  {
    id: 'intro-databases',
    title: 'Introduction to Databases',
    category: 'basics',
    difficulty: 'beginner',
    order: 1,
    description: 'Understanding what databases are and how they store data in tables.',
    content: `# Introduction to Databases

## What is a Database?

A **database** is an organized collection of structured data. Think of it as a digital filing cabinet where information is stored systematically so you can find and use it quickly.

## Relational Databases

A **relational database** stores data in **tables** (also called relations). Each table contains:

- **Rows** (records/tuples): Individual entries of data
- **Columns** (fields/attributes): Properties or characteristics of the data

### Example: Employees Table

| id | name | position | salary |
|----|------|----------|--------|
| 1 | Alice | Engineer | 95000 |
| 2 | Bob | Manager | 110000 |

## Key Concepts

- **Table**: A collection of related data organized in rows and columns
- **Row**: A single record in a table
- **Column**: A specific attribute/property that all rows have
- **Primary Key**: A unique identifier for each row (often the 'id' column)
- **Foreign Key**: A column that references the primary key of another table, creating relationships

## Why Use Databases?

1. **Organized Storage**: Data is structured and easy to find
2. **Efficiency**: Fast retrieval of specific information
3. **Relationships**: Connect related data across multiple tables
4. **Integrity**: Ensure data accuracy with constraints
5. **Concurrent Access**: Multiple users can access data simultaneously

## SQL: The Language of Databases

**SQL** (Structured Query Language) is the standard language for communicating with relational databases. You'll use SQL to:

- Retrieve data (SELECT)
- Add new data (INSERT)
- Modify data (UPDATE)
- Remove data (DELETE)
- Create and modify table structures (CREATE, ALTER, DROP)

In the next modules, we'll start with the most fundamental SQL command: **SELECT**.
`,
    sampleQueries: [],
    recommendedSchema: 'employees',
  },
  {
    id: 'select-from',
    title: 'SELECT and FROM',
    category: 'basics',
    difficulty: 'beginner',
    order: 2,
    description: 'Learn to retrieve data from database tables using SELECT and FROM.',
    content: `# SELECT and FROM

## The SELECT Statement

The **SELECT** statement is the most fundamental SQL command. It retrieves data from one or more tables.

## Basic Syntax

\`\`\`sql
SELECT column1, column2, ...
FROM table_name;
\`\`\`

## Selecting All Columns

Use the asterisk (\`*\`) to select all columns:

\`\`\`sql
SELECT * FROM employees;
\`\`\`

This returns every column and every row from the employees table.

## Selecting Specific Columns

Specify column names separated by commas:

\`\`\`sql
SELECT name, salary FROM employees;
\`\`\`

This returns only the name and salary columns.

## How It Works

1. **FROM**: SQL first identifies which table to query
2. **SELECT**: Then it determines which columns to include in the result
3. **Result Set**: The output is a temporary table with the requested columns

## Best Practices

- Select only the columns you need (avoid \`SELECT *\` in production)
- Use clear, readable formatting
- Column names are case-insensitive in most databases, but table names may be case-sensitive

## Common Mistakes

❌ Forgetting the FROM clause
❌ Misspelling table or column names
❌ Missing commas between column names
`,
    sampleQueries: [
      {
        title: 'Select all employees',
        query: 'SELECT * FROM employees',
        description: 'Retrieve all columns and all rows from the employees table',
      },
      {
        title: 'Select specific columns',
        query: 'SELECT name, position, salary FROM employees',
        description: 'Get only name, position, and salary for all employees',
      },
      {
        title: 'Select from departments',
        query: 'SELECT name, location FROM departments',
        description: 'View department names and their locations',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'Start with SELECT to specify which columns you want',
      'Use FROM to indicate which table contains the data',
      'Try SELECT * to see all columns, or list specific column names separated by commas',
      'Remember: SQL keywords like SELECT and FROM are not case-sensitive, but it\'s common to write them in uppercase',
    ],
  },
  {
    id: 'where-clause',
    title: 'WHERE Clause - Filtering Data',
    category: 'filtering',
    difficulty: 'beginner',
    order: 3,
    description: 'Filter query results using the WHERE clause with conditions.',
    content: `# WHERE Clause - Filtering Data

## What is the WHERE Clause?

The **WHERE** clause filters rows based on specified conditions. Only rows that meet the condition are included in the result.

## Syntax

\`\`\`sql
SELECT column1, column2
FROM table_name
WHERE condition;
\`\`\`

## Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| = | Equal | \`salary = 95000\` |
| != or <> | Not equal | \`dept_id != 1\` |
| > | Greater than | \`salary > 80000\` |
| < | Less than | \`salary < 100000\` |
| >= | Greater or equal | \`salary >= 95000\` |
| <= | Less or equal | \`salary <= 100000\` |

## Examples

### Filter by exact value:
\`\`\`sql
SELECT * FROM employees WHERE dept_id = 1;
\`\`\`

### Filter by comparison:
\`\`\`sql
SELECT name, salary FROM employees WHERE salary > 100000;
\`\`\`

### Filter text:
\`\`\`sql
SELECT * FROM employees WHERE position = 'Engineer';
\`\`\`

## How It Works

1. **FROM**: Identify the table
2. **WHERE**: Test each row against the condition
3. **SELECT**: Return specified columns from rows that passed the filter

## Important Notes

- String values must be enclosed in single quotes: \`'Engineer'\`
- Numeric values don't need quotes: \`100000\`
- Column names never use quotes
- WHERE is evaluated BEFORE SELECT

## Common Mistakes

❌ Using quotes around column names
❌ Forgetting quotes around string values
❌ Using = instead of != for "not equal"
`,
    sampleQueries: [
      {
        title: 'High earners',
        query: 'SELECT name, salary FROM employees WHERE salary > 100000',
        description: 'Find employees earning more than $100,000',
      },
      {
        title: 'Engineering department',
        query: 'SELECT * FROM employees WHERE dept_id = 1',
        description: 'Get all employees in department 1 (Engineering)',
      },
      {
        title: 'Specific position',
        query: 'SELECT name, hire_date FROM employees WHERE position = \'Engineer\'',
        description: 'Find all Engineers and when they were hired',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'WHERE is used to filter rows based on conditions',
      'Use comparison operators like =, >, <, >=, <= to compare values',
      'String values in conditions must be enclosed in single quotes',
      'The condition is evaluated for each row - only rows where the condition is true are returned'
    ],
  },
  {
    id: 'logical-operators',
    title: 'Logical Operators (AND, OR, NOT)',
    category: 'filtering',
    difficulty: 'beginner',
    order: 4,
    description: 'Combine multiple conditions using AND, OR, and NOT operators.',
    content: `# Logical Operators

## Combining Conditions

Logical operators let you combine multiple conditions in a WHERE clause.

## AND Operator

Returns rows that meet **ALL** conditions:

\`\`\`sql
SELECT * FROM employees 
WHERE dept_id = 1 AND salary > 100000;
\`\`\`

## OR Operator

Returns rows that meet **ANY** condition:

\`\`\`sql
SELECT * FROM employees 
WHERE dept_id = 1 OR dept_id = 2;
\`\`\`

## NOT Operator

Negates a condition:

\`\`\`sql
SELECT * FROM employees 
WHERE NOT dept_id = 1;
\`\`\`

## Combining Multiple Operators

Use parentheses to control order of evaluation:

\`\`\`sql
SELECT * FROM employees 
WHERE (dept_id = 1 OR dept_id = 2) AND salary > 80000;
\`\`\`

## Truth Tables

### AND
| A | B | A AND B |
|---|---|---------|
| T | T | T |
| T | F | F |
| F | T | F |
| F | F | F |

### OR
| A | B | A OR B |
|---|---|--------|
| T | T | T |
| T | F | T |
| F | T | T |
| F | F | F |

## Best Practices

- Use parentheses when mixing AND and OR
- AND has higher precedence than OR (but be explicit!)
- Keep conditions readable

## Common Patterns

\`\`\`sql
-- Range check
WHERE salary >= 80000 AND salary <= 120000

-- Multiple options
WHERE position = 'Engineer' OR position = 'Manager'

-- Exclusion
WHERE dept_id != 3 AND dept_id != 4
\`\`\`
`,
    sampleQueries: [
      {
        title: 'High-paid engineers',
        query: 'SELECT * FROM employees WHERE dept_id = 1 AND salary > 100000',
        description: 'Engineers earning more than $100k',
      },
      {
        title: 'Sales or Marketing',
        query: 'SELECT name, position FROM employees WHERE dept_id = 2 OR dept_id = 3',
        description: 'Employees in Sales or Marketing departments',
      },
      {
        title: 'Complex filter',
        query: 'SELECT * FROM employees WHERE (dept_id = 1 OR dept_id = 2) AND salary >= 90000',
        description: 'High earners in Engineering or Sales',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'AND requires ALL conditions to be true; OR requires at least ONE condition to be true',
      'Use parentheses to group conditions and control the order of evaluation',
      'NOT negates a condition - it returns rows where the condition is false',
      'AND has higher precedence than OR, but it\'s best to use parentheses for clarity'
    ],
  },
  {
    id: 'order-by',
    title: 'ORDER BY - Sorting Results',
    category: 'basics',
    difficulty: 'beginner',
    order: 5,
    description: 'Sort query results in ascending or descending order.',
    content: `# ORDER BY - Sorting Results

## What is ORDER BY?

The **ORDER BY** clause sorts the result set by one or more columns.

## Syntax

\`\`\`sql
SELECT columns
FROM table
WHERE conditions
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC];
\`\`\`

## Sort Direction

- **ASC**: Ascending order (default, smallest to largest)
- **DESC**: Descending order (largest to smallest)

## Examples

### Sort by one column:
\`\`\`sql
SELECT name, salary FROM employees ORDER BY salary DESC;
\`\`\`

### Sort by multiple columns:
\`\`\`sql
SELECT * FROM employees ORDER BY dept_id ASC, salary DESC;
\`\`\`

This sorts by department first, then by salary within each department.

## How It Works

1. **FROM**: Get the table
2. **WHERE**: Filter rows (if present)
3. **SELECT**: Choose columns
4. **ORDER BY**: Sort the final result

## Sorting Different Data Types

- **Numbers**: 1, 2, 10, 100 (numeric order)
- **Text**: 'Alice', 'Bob', 'Charlie' (alphabetical)
- **Dates**: Chronological order
- **NULL**: Usually appears first (ASC) or last (DESC)

## Best Practices

- Always specify ASC or DESC for clarity
- Sort by indexed columns when possible (performance)
- Be careful with NULL values

## Common Patterns

\`\`\`sql
-- Top earners
SELECT name, salary FROM employees 
ORDER BY salary DESC LIMIT 5;

-- Alphabetical list
SELECT name FROM employees 
ORDER BY name ASC;

-- Multiple levels
SELECT dept_id, position, name 
FROM employees 
ORDER BY dept_id, position, name;
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Highest salaries',
        query: 'SELECT name, salary FROM employees ORDER BY salary DESC',
        description: 'List employees from highest to lowest salary',
      },
      {
        title: 'Alphabetical names',
        query: 'SELECT name, position FROM employees ORDER BY name ASC',
        description: 'Sort employees alphabetically by name',
      },
      {
        title: 'Multi-level sort',
        query: 'SELECT dept_id, name, salary FROM employees ORDER BY dept_id ASC, salary DESC',
        description: 'Sort by department, then by salary within each department',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'ORDER BY controls the order in which results are displayed',
      'ASC is ascending (smallest to largest, A to Z) - this is the default',
      'DESC is descending (largest to smallest, Z to A)',
      'You can sort by multiple columns - the first column is primary, second is tiebreaker, etc.'
    ],
  },
  {
    id: 'inner-join',
    title: 'INNER JOIN',
    category: 'joins',
    difficulty: 'intermediate',
    order: 6,
    description: 'Combine rows from two tables based on a related column.',
    content: `# INNER JOIN

## What is a JOIN?

A **JOIN** combines rows from two or more tables based on a related column. This is how we work with related data across multiple tables.

## INNER JOIN

An **INNER JOIN** returns only rows where there is a match in BOTH tables.

## Syntax

\`\`\`sql
SELECT columns
FROM table1
INNER JOIN table2 ON table1.column = table2.column;
\`\`\`

## Example

\`\`\`sql
SELECT employees.name, employees.salary, departments.name AS dept_name
FROM employees
INNER JOIN departments ON employees.dept_id = departments.id;
\`\`\`

This returns employees along with their department names, but ONLY for employees who have a department assigned.

## How It Works

1. **FROM**: Start with the first table (employees)
2. **INNER JOIN**: For each row in employees, find matching rows in departments
3. **ON**: The condition specifies how to match (dept_id = id)
4. **Result**: Combined rows where match exists

## Visualization

\`\`\`
Employees Table      Departments Table
+----+-------+---+   +----+--------+
| id | name  |dep|   | id | name   |
+----+-------+---+   +----+--------+
| 1  | Alice | 1 |   | 1  | Eng    |
| 2  | Bob   | 2 |   | 2  | Sales  |
| 3  | Carol |NULL   | 3  | Mktg   |
+----+-------+---+   +----+--------+

INNER JOIN Result:
+-------+-------+
| name  | dept  |
+-------+-------+
| Alice | Eng   |
| Bob   | Sales |
+-------+-------+
(Carol excluded - no dept match!)
\`\`\`

## Table Aliases

Simplify queries with aliases:

\`\`\`sql
SELECT e.name, e.salary, d.name AS department
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;
\`\`\`

## Multiple Joins

You can chain multiple joins:

\`\`\`sql
SELECT e.name, d.name, d.location
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id
INNER JOIN locations l ON d.location_id = l.id;
\`\`\`

## Key Points

- Only returns rows with matches in BOTH tables
- Rows without matches are excluded
- Most common type of join
- Use ON clause to specify the relationship
`,
    sampleQueries: [
      {
        title: 'Employees with departments',
        query: 'SELECT e.name, e.position, d.name AS department FROM employees e INNER JOIN departments d ON e.dept_id = d.id',
        description: 'Show each employee with their department name',
      },
      {
        title: 'Departments and locations',
        query: 'SELECT d.name AS department, d.location, d.budget FROM departments d INNER JOIN employees e ON e.dept_id = d.id',
        description: 'Show departments that have employees',
      },
      {
        title: 'High earners by department',
        query: 'SELECT e.name, e.salary, d.name AS department FROM employees e INNER JOIN departments d ON e.dept_id = d.id WHERE e.salary > 90000',
        description: 'Employees earning over $90k with their departments',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'INNER JOIN combines rows from two tables where there is a match in both',
      'Use the ON clause to specify which columns to match (usually foreign key to primary key)',
      'Table aliases (like e and d) make queries shorter and easier to read',
      'Only rows with matches in BOTH tables are included - unmatched rows are excluded'
    ],
  },
  {
    id: 'left-join',
    title: 'LEFT JOIN',
    category: 'joins',
    difficulty: 'intermediate',
    order: 7,
    description: 'Include all rows from the left table, with matching rows from the right table.',
    content: `# LEFT JOIN (LEFT OUTER JOIN)

## What is LEFT JOIN?

A **LEFT JOIN** returns ALL rows from the left table, and matching rows from the right table. If there's no match, NULL values are returned for right table columns.

## Syntax

\`\`\`sql
SELECT columns
FROM table1
LEFT JOIN table2 ON table1.column = table2.column;
\`\`\`

## Example

\`\`\`sql
SELECT e.name, e.salary, d.name AS department
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
\`\`\`

This returns ALL employees, including those without a department assignment.

## LEFT JOIN vs INNER JOIN

\`\`\`
Employees            Departments
+----+-------+---+   +----+------+
| id | name  |dep|   | id | name |
+----+-------+---+   +----+------+
| 1  | Alice | 1 |   | 1  | Eng  |
| 2  | Bob   | 2 |   | 2  | Sales|
| 3  | Carol |NULL
+----+-------+---+

INNER JOIN:          LEFT JOIN:
+-------+-------+    +-------+-------+
| name  | dept  |    | name  | dept  |
+-------+-------+    +-------+-------+
| Alice | Eng   |    | Alice | Eng   |
| Bob   | Sales |    | Bob   | Sales |
+-------+-------+    | Carol | NULL  |
                      +-------+-------+
\`\`\`

## Use Cases

### Find unmatched records:
\`\`\`sql
SELECT e.name
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id
WHERE d.id IS NULL;
\`\`\`

This finds employees WITHOUT a department.

### Include all with optional details:
\`\`\`sql
SELECT c.name, o.order_date, o.total
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id;
\`\`\`

Shows all customers, whether they've placed orders or not.

## Key Differences

| Feature | INNER JOIN | LEFT JOIN |
|---------|-----------|-----------|
| Left table rows | Only matches | ALL rows |
| Right table rows | Only matches | Only matches |
| Unmatched rows | Excluded | Included with NULLs |

## Handling NULLs

\`\`\`sql
SELECT e.name, 
       COALESCE(d.name, 'No Department') AS department
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;
\`\`\`

## Best Practices

- LEFT JOIN is useful for finding missing relationships
- Always consider whether you want ALL rows from the left table
- Use IS NULL to find unmatched rows
- Be aware of NULL values in result columns
`,
    sampleQueries: [
      {
        title: 'All employees with departments',
        query: 'SELECT e.name, e.position, d.name AS department FROM employees e LEFT JOIN departments d ON e.dept_id = d.id',
        description: 'Show all employees, including those without departments',
      },
      {
        title: 'Find employees without departments',
        query: 'SELECT e.name, e.position FROM employees e LEFT JOIN departments d ON e.dept_id = d.id WHERE d.id IS NULL',
        description: 'Identify employees not assigned to any department',
      },
      {
        title: 'All customers and orders',
        query: 'SELECT c.name, c.city, o.order_date, o.total FROM customers c LEFT JOIN orders o ON c.id = o.customer_id',
        description: 'Show all customers, whether they have orders or not',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'LEFT JOIN returns ALL rows from the left table, even if there\'s no match in the right table',
      'When there\'s no match, the right table columns will contain NULL values',
      'Useful for finding items that don\'t have related records (e.g., departments with no employees)',
      'The table order matters - LEFT JOIN keeps all rows from the first table listed'
    ],
  },
  {
    id: 'group-by',
    title: 'GROUP BY and Aggregates',
    category: 'aggregation',
    difficulty: 'intermediate',
    order: 8,
    description: 'Group rows and calculate aggregate values like COUNT, SUM, AVG.',
    content: `# GROUP BY and Aggregate Functions

## What is GROUP BY?

**GROUP BY** groups rows that have the same values in specified columns, allowing you to perform calculations on each group.

## Aggregate Functions

| Function | Purpose | Example |
|----------|---------|---------|
| COUNT() | Count rows | \`COUNT(*)\` |
| SUM() | Sum values | \`SUM(salary)\` |
| AVG() | Average | \`AVG(salary)\` |
| MIN() | Minimum | \`MIN(salary)\` |
| MAX() | Maximum | \`MAX(salary)\` |

## Basic Syntax

\`\`\`sql
SELECT column, aggregate_function(column)
FROM table
GROUP BY column;
\`\`\`

## Examples

### Count employees per department:
\`\`\`sql
SELECT dept_id, COUNT(*) AS employee_count
FROM employees
GROUP BY dept_id;
\`\`\`

### Average salary by department:
\`\`\`sql
SELECT dept_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept_id;
\`\`\`

### Multiple aggregates:
\`\`\`sql
SELECT dept_id, 
       COUNT(*) AS count,
       AVG(salary) AS avg_salary,
       MAX(salary) AS max_salary
FROM employees
GROUP BY dept_id;
\`\`\`

## How It Works

1. **FROM**: Get the table
2. **WHERE**: Filter rows (before grouping)
3. **GROUP BY**: Create groups based on column values
4. **Aggregates**: Calculate for each group
5. **SELECT**: Return group identifiers and aggregates

## Visualization

\`\`\`
Before GROUP BY:
+-------+--------+
| dept  | salary |
+-------+--------+
| Eng   | 95000  |
| Eng   | 120000 |
| Sales | 75000  |
| Sales | 110000 |
+-------+--------+

After GROUP BY dept:
+-------+-------+------------+
| dept  | COUNT | AVG_salary |
+-------+-------+------------+
| Eng   | 2     | 107500     |
| Sales | 2     | 92500      |
+-------+-------+------------+
\`\`\`

## Important Rules

1. **SELECT clause** can only include:
   - Columns in GROUP BY
   - Aggregate functions
   
2. This is **INVALID**:
\`\`\`sql
SELECT dept_id, name, COUNT(*)  -- name is not grouped!
FROM employees
GROUP BY dept_id;
\`\`\`

3. This is **VALID**:
\`\`\`sql
SELECT dept_id, COUNT(*)
FROM employees
GROUP BY dept_id;
\`\`\`

## With JOIN

\`\`\`sql
SELECT d.name, COUNT(e.id) AS employee_count, AVG(e.salary) AS avg_salary
FROM departments d
LEFT JOIN employees e ON d.id = e.dept_id
GROUP BY d.id, d.name;
\`\`\`

## COUNT vs COUNT(column)

- \`COUNT(*)\`: Counts all rows
- \`COUNT(column)\`: Counts non-NULL values in column

## Common Patterns

\`\`\`sql
-- Total sales by customer
SELECT customer_id, SUM(total) AS total_spent
FROM orders
GROUP BY customer_id;

-- Products per category
SELECT category, COUNT(*) AS product_count
FROM products
GROUP BY category;
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Employees per department',
        query: 'SELECT dept_id, COUNT(*) AS employee_count FROM employees GROUP BY dept_id',
        description: 'Count how many employees are in each department',
      },
      {
        title: 'Salary statistics by department',
        query: 'SELECT dept_id, COUNT(*) AS count, AVG(salary) AS avg_salary, MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM employees GROUP BY dept_id',
        description: 'Complete salary breakdown for each department',
      },
      {
        title: 'Department summary with names',
        query: 'SELECT d.name, COUNT(e.id) AS employees, AVG(e.salary) AS avg_salary FROM departments d LEFT JOIN employees e ON d.id = e.dept_id GROUP BY d.id, d.name',
        description: 'Department names with employee counts and average salaries',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'GROUP BY collapses multiple rows into groups based on common values',
      'Use aggregate functions (COUNT, SUM, AVG, MIN, MAX) to calculate values for each group',
      'Every column in SELECT must either be in GROUP BY or inside an aggregate function',
      'GROUP BY comes after WHERE but before ORDER BY in query execution order'
    ],
  },
  {
    id: 'having',
    title: 'HAVING Clause',
    category: 'aggregation',
    difficulty: 'intermediate',
    order: 9,
    description: 'Filter grouped results using the HAVING clause.',
    content: `# HAVING Clause

## What is HAVING?

**HAVING** filters groups after aggregation, similar to how WHERE filters rows before aggregation.

## WHERE vs HAVING

| Clause | Filters | Applied | Works with |
|--------|---------|---------|------------|
| WHERE | Rows | Before grouping | Column values |
| HAVING | Groups | After grouping | Aggregate functions |

## Syntax

\`\`\`sql
SELECT column, aggregate_function(column)
FROM table
WHERE condition          -- filters rows
GROUP BY column
HAVING aggregate_condition;  -- filters groups
\`\`\`

## Examples

### Find departments with more than 2 employees:
\`\`\`sql
SELECT dept_id, COUNT(*) AS employee_count
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 2;
\`\`\`

### Departments with average salary > $90k:
\`\`\`sql
SELECT dept_id, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept_id
HAVING AVG(salary) > 90000;
\`\`\`

### Combining WHERE and HAVING:
\`\`\`sql
SELECT dept_id, COUNT(*) AS count, AVG(salary) AS avg_salary
FROM employees
WHERE salary > 60000        -- Filter rows first
GROUP BY dept_id
HAVING COUNT(*) >= 2;       -- Then filter groups
\`\`\`

## Execution Order

1. **FROM** - Get table
2. **WHERE** - Filter rows
3. **GROUP BY** - Create groups
4. **Aggregate** - Calculate
5. **HAVING** - Filter groups
6. **SELECT** - Return results
7. **ORDER BY** - Sort

## Example Flow

\`\`\`sql
SELECT dept_id, AVG(salary) AS avg_salary
FROM employees
WHERE position = 'Engineer'  -- Only engineers
GROUP BY dept_id
HAVING AVG(salary) > 95000;  -- Departments with high avg
\`\`\`

Process:
1. Get all employees
2. Keep only Engineers (WHERE)
3. Group by department
4. Calculate average salary per department
5. Keep only groups where avg > 95000 (HAVING)

## Why Not Use WHERE?

❌ This doesn't work:
\`\`\`sql
SELECT dept_id, COUNT(*) AS count
FROM employees
WHERE COUNT(*) > 2  -- ERROR: Can't use aggregate in WHERE
GROUP BY dept_id;
\`\`\`

✅ Use HAVING instead:
\`\`\`sql
SELECT dept_id, COUNT(*) AS count
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 2;  -- Correct!
\`\`\`

## Complex Conditions

\`\`\`sql
SELECT dept_id, 
       COUNT(*) AS employee_count,
       AVG(salary) AS avg_salary
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 2 
   AND AVG(salary) > 80000;
\`\`\`

## With JOIN

\`\`\`sql
SELECT d.name, COUNT(e.id) AS employee_count
FROM departments d
LEFT JOIN employees e ON d.id = e.dept_id
GROUP BY d.id, d.name
HAVING COUNT(e.id) >= 3;
\`\`\`

## Common Patterns

\`\`\`sql
-- High-value customers
SELECT customer_id, SUM(total) AS total_spent
FROM orders
GROUP BY customer_id
HAVING SUM(total) > 1000;

-- Popular categories
SELECT category, COUNT(*) AS product_count
FROM products
GROUP BY category
HAVING COUNT(*) >= 5;
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Large departments',
        query: 'SELECT dept_id, COUNT(*) AS employee_count FROM employees GROUP BY dept_id HAVING COUNT(*) > 2',
        description: 'Find departments with more than 2 employees',
      },
      {
        title: 'High-paying departments',
        query: 'SELECT dept_id, AVG(salary) AS avg_salary FROM employees GROUP BY dept_id HAVING AVG(salary) > 90000',
        description: 'Departments where average salary exceeds $90,000',
      },
      {
        title: 'Combined filters',
        query: 'SELECT dept_id, COUNT(*) AS count, AVG(salary) AS avg_salary FROM employees WHERE salary > 65000 GROUP BY dept_id HAVING COUNT(*) >= 2',
        description: 'Departments with 2+ employees earning over $65k',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'HAVING filters groups after GROUP BY, while WHERE filters rows before GROUP BY',
      'You can use aggregate functions in HAVING (e.g., HAVING COUNT(*) > 5)',
      'Think of WHERE as "which rows to include" and HAVING as "which groups to keep"',
      'Common pattern: WHERE filters individuals, then GROUP BY groups them, then HAVING filters the groups'
    ],
  },
  {
    id: 'subqueries',
    title: 'Subqueries',
    category: 'subqueries',
    difficulty: 'advanced',
    order: 10,
    description: 'Use nested queries to solve complex problems.',
    content: `# Subqueries (Nested Queries)

## What is a Subquery?

A **subquery** is a query nested inside another query. The subquery executes first, and its result is used by the outer query.

## Types of Subqueries

1. **Scalar subquery**: Returns single value
2. **Column subquery**: Returns single column (multiple rows)
3. **Row subquery**: Returns single row (multiple columns)
4. **Table subquery**: Returns multiple rows and columns

## Subqueries in WHERE

### With comparison operators:
\`\`\`sql
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

This finds employees earning more than the average salary.

### With IN:
\`\`\`sql
SELECT name
FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE location = 'New York');
\`\`\`

### With EXISTS:
\`\`\`sql
SELECT name
FROM employees e
WHERE EXISTS (
    SELECT 1 FROM orders o WHERE o.employee_id = e.id
);
\`\`\`

## Subqueries in FROM (Derived Tables)

\`\`\`sql
SELECT dept_summary.dept_id, dept_summary.avg_salary
FROM (
    SELECT dept_id, AVG(salary) AS avg_salary
    FROM employees
    GROUP BY dept_id
) AS dept_summary
WHERE dept_summary.avg_salary > 90000;
\`\`\`

## Subqueries in SELECT

\`\`\`sql
SELECT name, 
       salary,
       (SELECT AVG(salary) FROM employees) AS company_avg,
       salary - (SELECT AVG(salary) FROM employees) AS diff_from_avg
FROM employees;
\`\`\`

## Correlated Subqueries

A **correlated subquery** references columns from the outer query:

\`\`\`sql
SELECT e1.name, e1.salary
FROM employees e1
WHERE e1.salary > (
    SELECT AVG(e2.salary)
    FROM employees e2
    WHERE e2.dept_id = e1.dept_id  -- References outer query!
);
\`\`\`

This finds employees earning more than their department's average.

## How It Works

### Non-correlated:
1. Execute inner query once
2. Use result in outer query

### Correlated:
1. For each row in outer query
2. Execute inner query with that row's values
3. Use result for that row

## Comparison Operators with Subqueries

| Operator | Purpose |
|----------|---------|
| = | Equal to subquery result |
| IN | Match any value in list |
| EXISTS | True if subquery returns rows |
| ALL | Compare to all values |
| ANY/SOME | Compare to any value |

### ALL Example:
\`\`\`sql
SELECT name, salary
FROM employees
WHERE salary > ALL (SELECT salary FROM employees WHERE dept_id = 2);
\`\`\`

Finds employees earning more than EVERY Sales employee.

### ANY Example:
\`\`\`sql
SELECT name, salary
FROM employees
WHERE salary > ANY (SELECT salary FROM employees WHERE dept_id = 2);
\`\`\`

Finds employees earning more than AT LEAST ONE Sales employee.

## EXISTS vs IN

### EXISTS (usually faster):
\`\`\`sql
SELECT name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
\`\`\`

### IN:
\`\`\`sql
SELECT name FROM customers
WHERE id IN (SELECT customer_id FROM orders);
\`\`\`

## Best Practices

- Use subqueries for logical clarity
- Consider JOINs as an alternative (often faster)
- Avoid deeply nested subqueries
- Correlated subqueries can be slow on large datasets
- Always give derived tables an alias

## Common Patterns

\`\`\`sql
-- Find max without MAX()
SELECT name, salary FROM employees
WHERE salary = (SELECT MAX(salary) FROM employees);

-- Second highest
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);

-- Departments with no employees
SELECT name FROM departments d
WHERE NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.dept_id = d.id
);
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Above average salary',
        query: 'SELECT name, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)',
        description: 'Employees earning more than the company average',
      },
      {
        title: 'Above department average',
        query: 'SELECT e1.name, e1.salary, e1.dept_id FROM employees e1 WHERE e1.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.dept_id = e1.dept_id)',
        description: 'Employees earning above their department average (correlated)',
      },
      {
        title: 'Customers with orders',
        query: 'SELECT name FROM customers WHERE id IN (SELECT DISTINCT customer_id FROM orders)',
        description: 'Find customers who have placed orders',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'A subquery is a query nested inside another query, enclosed in parentheses',
      'Use subqueries in WHERE clause to compare against calculated values (like averages)',
      'IN operator is useful for checking if a value exists in the subquery results',
      'Correlated subqueries reference the outer query and run once per row - they can be slower but very powerful'
    ],
  },
  {
    id: 'right-join',
    title: 'RIGHT JOIN',
    category: 'joins',
    difficulty: 'intermediate',
    order: 11,
    description: 'Include all rows from the right table, with matching rows from the left table.',
    content: `# RIGHT JOIN

## What is a RIGHT JOIN?

A **RIGHT JOIN** (or RIGHT OUTER JOIN) returns ALL rows from the **right table**, and the matching rows from the left table. If there's no match, NULL values appear for left table columns.

## Syntax

\`\`\`sql
SELECT columns
FROM left_table
RIGHT JOIN right_table
  ON left_table.column = right_table.column
\`\`\`

## How It Works

1. Takes ALL rows from the right table
2. Finds matching rows in the left table
3. If match found: combines both rows
4. If no match: right table row + NULLs for left table

## Example

\`\`\`sql
SELECT employees.name, departments.name as dept_name
FROM employees
RIGHT JOIN departments
  ON employees.dept_id = departments.id
\`\`\`

This returns ALL departments, even if they have no employees (showing NULL for employee names).

## Use Cases

- Find items without references (e.g., departments with no employees)
- Complete right-side inventory checks
- Ensure all reference data is shown

## Visual Representation

\`\`\`
Left Table        Right Table       Result
employees         departments       
                                    
Alice (dept 1) ← → Dept 1          Alice - Dept 1
Bob (dept 1)   ← → Dept 1          Bob - Dept 1  
                → Dept 2 (empty)   NULL - Dept 2
                → Dept 3 (empty)   NULL - Dept 3
\`\`\`

All departments appear, even without employees!
`,
    sampleQueries: [
      {
        title: 'All departments',
        query: 'SELECT employees.name, departments.name as dept_name FROM employees RIGHT JOIN departments ON employees.dept_id = departments.id',
        description: 'Show all departments with their employees (or NULL)',
      },
      {
        title: 'Products without orders',
        query: 'SELECT products.name, orders.id as order_id FROM orders RIGHT JOIN products ON orders.id = products.id WHERE orders.id IS NULL',
        description: 'Find products that have never been ordered',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'full-outer-join',
    title: 'FULL OUTER JOIN',
    category: 'joins',
    difficulty: 'advanced',
    order: 12,
    description: 'Include all rows from both tables, with NULLs where there is no match.',
    content: `# FULL OUTER JOIN

## What is a FULL OUTER JOIN?

A **FULL OUTER JOIN** (or FULL JOIN) returns ALL rows from BOTH tables. When there's a match, rows are combined. When there's no match, NULLs fill the gaps.

## Syntax

\`\`\`sql
SELECT columns
FROM table1
FULL OUTER JOIN table2
  ON table1.column = table2.column
\`\`\`

## How It Works

1. Returns ALL rows from the left table
2. Returns ALL rows from the right table  
3. Matches are combined
4. Unmatched rows from either side get NULLs

## SQLite Note

⚠️ **SQLite doesn't support FULL OUTER JOIN directly**, but we can simulate it:

\`\`\`sql
-- Simulate FULL OUTER JOIN
SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.id
UNION
SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.id
\`\`\`

## Use Cases

- Compare two datasets completely
- Find all records with or without matches
- Data reconciliation and gap analysis

## Visual Example

\`\`\`
Employees         Departments       Result
                                    
Alice (dept 1) ←→ Dept 1           Alice - Dept 1
Bob (dept 1)   ←→ Dept 1           Bob - Dept 1
Carol (NULL)    → Dept 2           NULL - Dept 2
                  Dept 3           NULL - Dept 3
                                   Carol - NULL
\`\`\`

Everyone and everything appears!
`,
    sampleQueries: [
      {
        title: 'All employees and departments',
        query: 'SELECT e.name as employee, d.name as department FROM employees e LEFT JOIN departments d ON e.dept_id = d.id UNION SELECT e.name as employee, d.name as department FROM employees e RIGHT JOIN departments d ON e.dept_id = d.id',
        description: 'Show all employees and all departments',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'cross-join',
    title: 'CROSS JOIN',
    category: 'joins',
    difficulty: 'intermediate',
    order: 13,
    description: 'Create a Cartesian product - every row from one table with every row from another.',
    content: `# CROSS JOIN

## What is a CROSS JOIN?

A **CROSS JOIN** produces a **Cartesian product** - it combines EVERY row from the first table with EVERY row from the second table.

## Syntax

\`\`\`sql
SELECT columns
FROM table1
CROSS JOIN table2
\`\`\`

Or simply:

\`\`\`sql
SELECT columns
FROM table1, table2
\`\`\`

## How It Works

If table1 has N rows and table2 has M rows, the result has **N × M** rows!

## Example

\`\`\`sql
-- 3 colors × 2 sizes = 6 combinations
SELECT colors.name, sizes.name
FROM colors
CROSS JOIN sizes
\`\`\`

Result:
- Red Small
- Red Large
- Blue Small
- Blue Large  
- Green Small
- Green Large

## Use Cases

- Generate all possible combinations
- Create test data
- Product variations (colors × sizes)
- Date ranges × categories

## ⚠️ Warning

CROSS JOIN can create HUGE result sets! Be careful with large tables.

## Example with Numbers

\`\`\`sql
-- All possible employee pairs
SELECT e1.name as employee1, e2.name as employee2
FROM employees e1
CROSS JOIN employees e2
WHERE e1.id < e2.id  -- Avoid duplicates
\`\`\`
`,
    sampleQueries: [
      {
        title: 'All employee pairs',
        query: 'SELECT e1.name as emp1, e2.name as emp2 FROM employees e1 CROSS JOIN employees e2 WHERE e1.id < e2.id LIMIT 10',
        description: 'All unique pairs of employees',
      },
      {
        title: 'Size of cross product',
        query: 'SELECT COUNT(*) as total_combinations FROM employees CROSS JOIN departments',
        description: 'Count total combinations',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'self-join',
    title: 'SELF JOIN',
    category: 'joins',
    difficulty: 'advanced',
    order: 14,
    description: 'Join a table to itself to find relationships within the same table.',
    content: `# SELF JOIN

## What is a SELF JOIN?

A **SELF JOIN** is when a table is joined with itself. This is useful for comparing rows within the same table or finding hierarchical relationships.

## Syntax

\`\`\`sql
SELECT a.column, b.column
FROM table_name a
JOIN table_name b
  ON a.column = b.column
\`\`\`

**Note**: You must use table aliases (a, b) to distinguish between the two "copies".

## Common Use Cases

### 1. Finding Pairs

\`\`\`sql
-- Employees with the same salary
SELECT e1.name, e2.name, e1.salary
FROM employees e1
JOIN employees e2
  ON e1.salary = e2.salary
  AND e1.id < e2.id
\`\`\`

### 2. Hierarchical Data

\`\`\`sql
-- Employees and their managers
SELECT e.name as employee, m.name as manager
FROM employees e
LEFT JOIN employees m
  ON e.manager_id = m.id
\`\`\`

### 3. Comparisons

\`\`\`sql
-- Employees earning more than Bob
SELECT e1.name, e1.salary
FROM employees e1
JOIN employees e2
  ON e2.name = 'Bob'
WHERE e1.salary > e2.salary
\`\`\`

## Real-World Example

Organization hierarchy:
\`\`\`
CEO
├── VP Engineering (reports to CEO)
│   ├── Senior Engineer
│   └── Engineer
└── VP Sales (reports to CEO)
    └── Sales Rep
\`\`\`

Query managers and their reports:
\`\`\`sql
SELECT 
  m.name as manager,
  e.name as employee,
  e.position
FROM employees e
JOIN employees m ON e.manager_id = m.id
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Same department colleagues',
        query: 'SELECT e1.name as employee1, e2.name as employee2, e1.dept_id FROM employees e1 JOIN employees e2 ON e1.dept_id = e2.dept_id AND e1.id < e2.id',
        description: 'Find pairs of employees in the same department',
      },
      {
        title: 'Same salary employees',
        query: 'SELECT e1.name, e2.name, e1.salary FROM employees e1 JOIN employees e2 ON e1.salary = e2.salary AND e1.id < e2.id',
        description: 'Employees with identical salaries',
      },
      {
        title: 'Higher paid colleagues',
        query: 'SELECT e1.name, e1.salary, e2.name as colleague, e2.salary as colleague_salary FROM employees e1 JOIN employees e2 ON e1.dept_id = e2.dept_id WHERE e1.salary < e2.salary',
        description: 'Compare salaries within departments',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'union',
    title: 'UNION - Combining Results',
    category: 'set-operations',
    difficulty: 'intermediate',
    order: 15,
    description: 'Combine results from multiple queries, removing duplicates.',
    content: `# UNION

## What is UNION?

**UNION** combines the results of two or more SELECT statements into a single result set, automatically **removing duplicate rows**.

## Syntax

\`\`\`sql
SELECT columns FROM table1
UNION
SELECT columns FROM table2
\`\`\`

## Requirements

- Same number of columns in each SELECT
- Compatible data types in corresponding columns
- Column names from first SELECT are used

## UNION vs UNION ALL

### UNION
- Removes duplicates (slower)
- Returns unique rows

### UNION ALL
- Keeps all rows including duplicates (faster)
- Use when you know there are no duplicates

\`\`\`sql
SELECT name FROM employees
UNION ALL
SELECT name FROM contractors
\`\`\`

## Example

\`\`\`sql
-- All people: employees and contractors
SELECT name, 'Employee' as type FROM employees
UNION
SELECT name, 'Contractor' as type FROM contractors
ORDER BY name
\`\`\`

## Use Cases

- Combine data from multiple tables
- Create summary reports
- Merge similar datasets
- Historical + current data

## Example: Contact List

\`\`\`sql
-- All email addresses
SELECT email, 'Customer' as source FROM customers
UNION
SELECT email, 'Employee' as source FROM employees
UNION  
SELECT email, 'Supplier' as source FROM suppliers
\`\`\`
`,
    sampleQueries: [
      {
        title: 'High earners',
        query: 'SELECT name, salary, dept_id FROM employees WHERE salary > 100000 UNION SELECT name, salary, dept_id FROM employees WHERE dept_id = 1',
        description: 'Employees earning over 100k OR in department 1',
      },
      {
        title: 'All unique departments',
        query: 'SELECT dept_id as id FROM employees WHERE dept_id IS NOT NULL UNION SELECT id FROM departments',
        description: 'Combine employee departments with all departments',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'distinct',
    title: 'DISTINCT - Unique Values',
    category: 'basics',
    difficulty: 'beginner',
    order: 16,
    description: 'Select only unique values, removing duplicates from results.',
    content: `# DISTINCT

## What is DISTINCT?

**DISTINCT** removes duplicate rows from query results, showing only unique values.

## Syntax

\`\`\`sql
SELECT DISTINCT column1, column2
FROM table_name
\`\`\`

## How It Works

Without DISTINCT:
\`\`\`sql
SELECT dept_id FROM employees
-- Returns: 1, 1, 1, 2, 2, 3, 3, 4, 5, 5...
\`\`\`

With DISTINCT:
\`\`\`sql
SELECT DISTINCT dept_id FROM employees
-- Returns: 1, 2, 3, 4, 5
\`\`\`

## Multiple Columns

When using DISTINCT with multiple columns, it considers the **combination** to be unique:

\`\`\`sql
SELECT DISTINCT dept_id, position
FROM employees
\`\`\`

Returns unique pairs of (dept_id, position).

## Use Cases

- Find all unique values
- Count distinct items: \`COUNT(DISTINCT column)\`
- Remove duplicate results
- Data exploration

## DISTINCT vs GROUP BY

These are similar:

\`\`\`sql
-- Method 1
SELECT DISTINCT dept_id FROM employees

-- Method 2
SELECT dept_id FROM employees GROUP BY dept_id
\`\`\`

Use DISTINCT when you just need unique values.  
Use GROUP BY when you need aggregations.

## Example

\`\`\`sql
-- All positions in the company
SELECT DISTINCT position
FROM employees
ORDER BY position
\`\`\`

## Performance Note

DISTINCT requires sorting/comparison, so it can be slower on large datasets.
`,
    sampleQueries: [
      {
        title: 'Unique departments',
        query: 'SELECT DISTINCT dept_id FROM employees WHERE dept_id IS NOT NULL ORDER BY dept_id',
        description: 'All departments that have employees',
      },
      {
        title: 'Unique positions',
        query: 'SELECT DISTINCT position FROM employees ORDER BY position',
        description: 'All job positions in the company',
      },
      {
        title: 'Count unique departments',
        query: 'SELECT COUNT(DISTINCT dept_id) as unique_departments FROM employees',
        description: 'Number of different departments',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'limit-offset',
    title: 'LIMIT and OFFSET - Pagination',
    category: 'basics',
    difficulty: 'beginner',
    order: 17,
    description: 'Control how many rows to return and where to start (pagination).',
    content: `# LIMIT and OFFSET

## What are LIMIT and OFFSET?

- **LIMIT**: Restricts the number of rows returned
- **OFFSET**: Skips a specified number of rows before starting to return rows

Together, they enable **pagination** - showing results in pages.

## LIMIT Syntax

\`\`\`sql
SELECT columns
FROM table_name
LIMIT number
\`\`\`

Example:
\`\`\`sql
-- Get first 5 employees
SELECT * FROM employees
LIMIT 5
\`\`\`

## OFFSET Syntax

\`\`\`sql
SELECT columns
FROM table_name
LIMIT number OFFSET skip_count
\`\`\`

Example:
\`\`\`sql
-- Skip first 5, get next 5 (rows 6-10)
SELECT * FROM employees
LIMIT 5 OFFSET 5
\`\`\`

## Pagination Pattern

\`\`\`sql
-- Page 1 (rows 1-10)
SELECT * FROM employees LIMIT 10 OFFSET 0

-- Page 2 (rows 11-20)
SELECT * FROM employees LIMIT 10 OFFSET 10

-- Page 3 (rows 21-30)
SELECT * FROM employees LIMIT 10 OFFSET 20
\`\`\`

Formula: \`OFFSET = (page_number - 1) × page_size\`

## Use Cases

- Display results in pages (web/app UIs)
- Preview data (first few rows)
- Process data in chunks
- "Load more" functionality

## Best Practices

1. **Always use ORDER BY** with pagination for consistent results
2. **Don't use huge OFFSETs** - performance degrades with large skips
3. **Consider alternatives** for large datasets (cursor-based pagination)

## Example: Top Earners

\`\`\`sql
-- Top 3 highest paid employees
SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 3
\`\`\`

## Combining with Other Clauses

\`\`\`sql
SELECT name, salary, dept_id
FROM employees
WHERE dept_id = 1
ORDER BY salary DESC
LIMIT 5 OFFSET 2
\`\`\`

Order of execution:
1. WHERE (filter)
2. ORDER BY (sort)
3. OFFSET (skip)
4. LIMIT (take)
`,
    sampleQueries: [
      {
        title: 'Top 5 earners',
        query: 'SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 5',
        description: 'Highest paid employees',
      },
      {
        title: 'Second page of employees',
        query: 'SELECT name, position, salary FROM employees ORDER BY id LIMIT 5 OFFSET 5',
        description: 'Employees 6-10',
      },
      {
        title: 'Sample data',
        query: 'SELECT * FROM employees LIMIT 3',
        description: 'Preview first 3 rows',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'aggregate-functions',
    title: 'Aggregate Functions',
    category: 'aggregation',
    difficulty: 'intermediate',
    order: 18,
    description: 'Calculate summary values: COUNT, SUM, AVG, MIN, MAX.',
    content: `# Aggregate Functions

## What are Aggregate Functions?

**Aggregate functions** perform calculations on multiple rows and return a single value.

## The Big Five

### 1. COUNT()
Counts rows or non-NULL values:

\`\`\`sql
-- Count all rows
SELECT COUNT(*) FROM employees

-- Count non-NULL departments
SELECT COUNT(dept_id) FROM employees

-- Count unique departments
SELECT COUNT(DISTINCT dept_id) FROM employees
\`\`\`

### 2. SUM()
Adds up numeric values:

\`\`\`sql
-- Total payroll
SELECT SUM(salary) as total_payroll
FROM employees
\`\`\`

### 3. AVG()
Calculates average:

\`\`\`sql
-- Average salary
SELECT AVG(salary) as avg_salary
FROM employees
\`\`\`

### 4. MIN()
Finds minimum value:

\`\`\`sql
-- Lowest salary
SELECT MIN(salary) as min_salary
FROM employees
\`\`\`

### 5. MAX()
Finds maximum value:

\`\`\`sql
-- Highest salary
SELECT MAX(salary) as max_salary
FROM employees
\`\`\`

## Combining Aggregates

\`\`\`sql
SELECT 
  COUNT(*) as total_employees,
  AVG(salary) as avg_salary,
  MIN(salary) as min_salary,
  MAX(salary) as max_salary,
  SUM(salary) as total_payroll
FROM employees
\`\`\`

## With GROUP BY

Aggregates really shine with GROUP BY:

\`\`\`sql
-- Stats by department
SELECT 
  dept_id,
  COUNT(*) as employee_count,
  AVG(salary) as avg_salary,
  MAX(salary) as highest_paid
FROM employees
GROUP BY dept_id
\`\`\`

## Important Rules

1. **Aggregates ignore NULL values** (except COUNT(*))
2. **Can't mix aggregates and regular columns** without GROUP BY
3. **Use HAVING** to filter aggregate results

## Common Patterns

### Percentage
\`\`\`sql
SELECT 
  dept_id,
  COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees) as percentage
FROM employees
GROUP BY dept_id
\`\`\`

### Running Statistics
\`\`\`sql
SELECT 
  'Average' as metric, AVG(salary) as value FROM employees
UNION ALL
SELECT 'Total', SUM(salary) FROM employees
UNION ALL
SELECT 'Count', COUNT(*) FROM employees
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Overall statistics',
        query: 'SELECT COUNT(*) as total, AVG(salary) as avg_salary, MIN(salary) as min_salary, MAX(salary) as max_salary FROM employees',
        description: 'Summary statistics for all employees',
      },
      {
        title: 'Department statistics',
        query: 'SELECT dept_id, COUNT(*) as employees, AVG(salary) as avg_salary, MAX(salary) as max_salary FROM employees WHERE dept_id IS NOT NULL GROUP BY dept_id',
        description: 'Stats by department',
      },
      {
        title: 'Count by position',
        query: 'SELECT position, COUNT(*) as count FROM employees GROUP BY position ORDER BY count DESC',
        description: 'How many employees in each position',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'Aggregate functions (COUNT, SUM, AVG, MIN, MAX) operate on multiple rows and return a single value',
      'COUNT(*) counts all rows including NULL values, while COUNT(column) counts only non-NULL values',
      'Use AVG for average, SUM for total, MIN for smallest, MAX for largest',
      'Aggregate functions are typically used with GROUP BY to calculate statistics for each group'
    ],
  },
  {
    id: 'case-when',
    title: 'CASE WHEN - Conditional Logic',
    category: 'advanced',
    difficulty: 'intermediate',
    order: 19,
    description: 'Use CASE WHEN to add conditional logic and create calculated columns.',
    content: `# CASE WHEN - Conditional Logic

## What is CASE WHEN?

The **CASE WHEN** statement allows you to add conditional logic to your queries, similar to if-else statements in programming.

## Basic Syntax

\`\`\`sql
CASE
  WHEN condition1 THEN result1
  WHEN condition2 THEN result2
  ELSE default_result
END
\`\`\`

## Simple Example

\`\`\`sql
SELECT name, salary,
  CASE
    WHEN salary >= 100000 THEN 'High'
    WHEN salary >= 70000 THEN 'Medium'
    ELSE 'Low'
  END as salary_level
FROM employees;
\`\`\`

## Use Cases

### 1. Categorization

Create categories based on values:

\`\`\`sql
SELECT name,
  CASE
    WHEN salary > 90000 THEN 'Senior'
    WHEN salary > 60000 THEN 'Mid-Level'
    ELSE 'Junior'
  END as level
FROM employees;
\`\`\`

### 2. Data Transformation

Transform values conditionally:

\`\`\`sql
SELECT name,
  CASE position
    WHEN 'CEO' THEN 'Executive'
    WHEN 'Manager' THEN 'Management'
    ELSE 'Staff'
  END as category
FROM employees;
\`\`\`

### 3. Calculations with Conditions

Apply different calculations:

\`\`\`sql
SELECT name, salary,
  CASE
    WHEN dept_id = 1 THEN salary * 1.10
    WHEN dept_id = 2 THEN salary * 1.05
    ELSE salary
  END as adjusted_salary
FROM employees;
\`\`\`

### 4. Aggregate with Conditions

Count or sum conditionally:

\`\`\`sql
SELECT 
  dept_id,
  COUNT(CASE WHEN salary > 80000 THEN 1 END) as high_earners,
  COUNT(CASE WHEN salary <= 80000 THEN 1 END) as low_earners
FROM employees
GROUP BY dept_id;
\`\`\`

## CASE vs Simple CASE

**Searched CASE** (flexible):
\`\`\`sql
CASE WHEN salary > 100000 THEN 'High' END
\`\`\`

**Simple CASE** (equals only):
\`\`\`sql
CASE dept_id WHEN 1 THEN 'Engineering' END
\`\`\`

## Tips

- Always include an ELSE clause for completeness
- CASE expressions can be used in SELECT, WHERE, ORDER BY
- Multiple conditions are evaluated top-to-bottom
- First matching condition wins
`,
    sampleQueries: [
      {
        title: 'Salary categories',
        query: 'SELECT name, salary, CASE WHEN salary >= 100000 THEN \'High\' WHEN salary >= 70000 THEN \'Medium\' ELSE \'Low\' END as salary_level FROM employees',
        description: 'Categorize salaries into levels',
      },
      {
        title: 'Department bonuses',
        query: 'SELECT name, salary, dept_id, CASE WHEN dept_id = 1 THEN salary * 0.10 WHEN dept_id = 2 THEN salary * 0.05 ELSE salary * 0.02 END as bonus FROM employees',
        description: 'Different bonus rates per department',
      },
      {
        title: 'Conditional aggregation',
        query: 'SELECT dept_id, COUNT(CASE WHEN salary > 80000 THEN 1 END) as high_earners, COUNT(CASE WHEN salary <= 80000 THEN 1 END) as others FROM employees GROUP BY dept_id',
        description: 'Count employees by salary range per department',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'null-handling',
    title: 'NULL Handling - IS NULL, COALESCE',
    category: 'filtering',
    difficulty: 'beginner',
    order: 20,
    description: 'Learn to work with NULL values using IS NULL, IS NOT NULL, and COALESCE.',
    content: `# NULL Handling

## What is NULL?

**NULL** represents the absence of a value - it's not zero, not an empty string, but literally "no value".

## IS NULL and IS NOT NULL

Use these operators to check for NULL values:

\`\`\`sql
-- Find employees without a department
SELECT * FROM employees WHERE dept_id IS NULL;

-- Find employees with a department
SELECT * FROM employees WHERE dept_id IS NOT NULL;
\`\`\`

**Important:** Never use \`= NULL\` or \`!= NULL\` - they won't work!

## COALESCE Function

**COALESCE** returns the first non-NULL value from a list:

\`\`\`sql
SELECT name, COALESCE(dept_id, 0) as dept_id
FROM employees;
\`\`\`

This replaces NULL dept_id with 0.

## Multiple Fallbacks

COALESCE can take multiple arguments:

\`\`\`sql
SELECT name,
  COALESCE(email, phone, 'No contact info') as contact
FROM employees;
\`\`\`

Returns the first non-NULL value: email, phone, or the default string.

## NULL in Comparisons

NULL values behave specially:

\`\`\`sql
NULL = NULL  -- Returns NULL (not TRUE!)
NULL <> 5    -- Returns NULL
NULL > 10    -- Returns NULL
\`\`\`

## NULL in Aggregates

Most aggregate functions ignore NULL:

\`\`\`sql
-- COUNT(*) includes NULLs
-- COUNT(column) excludes NULLs
SELECT 
  COUNT(*) as total_rows,
  COUNT(dept_id) as rows_with_dept
FROM employees;
\`\`\`

## Common NULL Patterns

### Default Values
\`\`\`sql
SELECT name, COALESCE(salary, 50000) as salary
FROM employees;
\`\`\`

### NULL-Safe Comparisons
\`\`\`sql
WHERE COALESCE(dept_id, -1) = COALESCE(@other_dept, -1)
\`\`\`

### Finding Missing Data
\`\`\`sql
SELECT * FROM employees
WHERE dept_id IS NULL OR salary IS NULL;
\`\`\`

## IFNULL (MySQL/SQLite)

Some databases have IFNULL as a shorter alternative:

\`\`\`sql
SELECT name, IFNULL(dept_id, 0) as dept_id
FROM employees;
\`\`\`

Equivalent to COALESCE with 2 arguments.
`,
    sampleQueries: [
      {
        title: 'Employees without departments',
        query: 'SELECT * FROM employees WHERE dept_id IS NULL',
        description: 'Find unassigned employees',
      },
      {
        title: 'Replace NULL with default',
        query: 'SELECT name, COALESCE(dept_id, 0) as dept_id FROM employees',
        description: 'Show 0 for NULL departments',
      },
      {
        title: 'Count with and without dept',
        query: 'SELECT COUNT(*) as total, COUNT(dept_id) as with_dept, COUNT(*) - COUNT(dept_id) as without_dept FROM employees',
        description: 'Statistics on NULL values',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'in-between-like',
    title: 'IN, BETWEEN, LIKE Operators',
    category: 'filtering',
    difficulty: 'beginner',
    order: 21,
    description: 'Advanced filtering with IN, BETWEEN, and LIKE pattern matching.',
    content: `# IN, BETWEEN, LIKE Operators

## IN Operator

Check if a value matches any value in a list:

\`\`\`sql
SELECT * FROM employees
WHERE dept_id IN (1, 2, 3);
\`\`\`

Equivalent to:
\`\`\`sql
WHERE dept_id = 1 OR dept_id = 2 OR dept_id = 3
\`\`\`

### With NOT IN

\`\`\`sql
SELECT * FROM employees
WHERE position NOT IN ('CEO', 'Manager');
\`\`\`

## BETWEEN Operator

Check if a value is within a range (inclusive):

\`\`\`sql
SELECT * FROM employees
WHERE salary BETWEEN 60000 AND 90000;
\`\`\`

Equivalent to:
\`\`\`sql
WHERE salary >= 60000 AND salary <= 90000
\`\`\`

### NOT BETWEEN

\`\`\`sql
SELECT * FROM employees
WHERE salary NOT BETWEEN 60000 AND 90000;
\`\`\`

## LIKE Operator

Pattern matching for text:

### Wildcards

- **%** - Matches zero or more characters
- **_** - Matches exactly one character

### Examples

\`\`\`sql
-- Names starting with 'A'
SELECT * FROM employees WHERE name LIKE 'A%';

-- Names ending with 'son'
SELECT * FROM employees WHERE name LIKE '%son';

-- Names containing 'an'
SELECT * FROM employees WHERE name LIKE '%an%';

-- Three-letter names
SELECT * FROM employees WHERE name LIKE '___';

-- Names with 'a' as second letter
SELECT * FROM employees WHERE name LIKE '_a%';
\`\`\`

### Case Sensitivity

- SQLite LIKE is case-insensitive by default
- Use GLOB for case-sensitive matching
- MySQL LIKE is case-insensitive
- PostgreSQL LIKE is case-sensitive (use ILIKE for case-insensitive)

### NOT LIKE

\`\`\`sql
SELECT * FROM employees
WHERE position NOT LIKE '%Engineer%';
\`\`\`

## Combining Operators

All three can be combined with AND/OR:

\`\`\`sql
SELECT * FROM employees
WHERE dept_id IN (1, 2)
  AND salary BETWEEN 70000 AND 100000
  AND name LIKE 'A%';
\`\`\`

## Performance Tips

- IN is great for small lists
- BETWEEN is faster than two comparisons
- LIKE with leading % is slow (can't use indexes)
- LIKE 'abc%' is fast (can use indexes)

## Common Patterns

### Search Multiple Columns
\`\`\`sql
WHERE name LIKE '%john%' OR position LIKE '%john%'
\`\`\`

### Exclude Patterns
\`\`\`sql
WHERE email NOT LIKE '%test%'
\`\`\`

### Range Checks
\`\`\`sql
WHERE salary BETWEEN 50000 AND 150000
  AND hired_date BETWEEN '2020-01-01' AND '2023-12-31'
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Multiple departments',
        query: 'SELECT * FROM employees WHERE dept_id IN (1, 2, 3)',
        description: 'Employees in specific departments',
      },
      {
        title: 'Salary range',
        query: 'SELECT name, salary FROM employees WHERE salary BETWEEN 70000 AND 100000 ORDER BY salary',
        description: 'Mid-range salaries',
      },
      {
        title: 'Name pattern',
        query: 'SELECT * FROM employees WHERE name LIKE \'%a%\' ORDER BY name',
        description: 'Names containing letter a',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'string-functions',
    title: 'String Functions',
    category: 'advanced',
    difficulty: 'intermediate',
    order: 22,
    description: 'Manipulate text with CONCAT, SUBSTR, UPPER, LOWER, TRIM, and more.',
    content: `# String Functions

## Common String Functions

### CONCAT - Combine Strings

\`\`\`sql
SELECT CONCAT(name, ' - ', position) as employee_info
FROM employees;
\`\`\`

Alternative in SQLite:
\`\`\`sql
SELECT name || ' - ' || position as employee_info
FROM employees;
\`\`\`

### UPPER and LOWER - Change Case

\`\`\`sql
SELECT UPPER(name) as name_upper, LOWER(position) as position_lower
FROM employees;
\`\`\`

### LENGTH - String Length

\`\`\`sql
SELECT name, LENGTH(name) as name_length
FROM employees
WHERE LENGTH(name) > 10;
\`\`\`

### SUBSTR - Extract Substring

\`\`\`sql
-- SUBSTR(string, start, length)
SELECT name, SUBSTR(name, 1, 3) as initials
FROM employees;
\`\`\`

### TRIM, LTRIM, RTRIM - Remove Whitespace

\`\`\`sql
SELECT TRIM('  hello  ');      -- 'hello'
SELECT LTRIM('  hello  ');     -- 'hello  '
SELECT RTRIM('  hello  ');     -- '  hello'
\`\`\`

### REPLACE - Replace Text

\`\`\`sql
SELECT name, REPLACE(name, 'a', '@') as modified
FROM employees;
\`\`\`

### INSTR - Find Position

\`\`\`sql
-- Find position of substring (returns 0 if not found)
SELECT name, INSTR(name, 'son') as position
FROM employees;
\`\`\`

## Practical Examples

### Email Generation
\`\`\`sql
SELECT 
  name,
  LOWER(REPLACE(name, ' ', '.')) || '@company.com' as email
FROM employees;
\`\`\`

### Name Formatting
\`\`\`sql
SELECT 
  UPPER(SUBSTR(name, 1, 1)) || LOWER(SUBSTR(name, 2)) as formatted_name
FROM employees;
\`\`\`

### Initials Extraction
\`\`\`sql
SELECT 
  name,
  SUBSTR(name, 1, 1) || '.' as initial
FROM employees;
\`\`\`

### Search and Filter
\`\`\`sql
SELECT * FROM employees
WHERE LOWER(name) LIKE '%john%';
\`\`\`

## Combining Functions

String functions can be nested:

\`\`\`sql
SELECT 
  name,
  UPPER(TRIM(name)) as clean_name,
  LENGTH(REPLACE(name, ' ', '')) as name_chars
FROM employees;
\`\`\`

## NULL Handling

Most string functions return NULL if input is NULL:

\`\`\`sql
SELECT COALESCE(UPPER(name), 'UNKNOWN') as name
FROM employees;
\`\`\`

## Common Use Cases

### Data Cleaning
\`\`\`sql
SELECT TRIM(UPPER(name)) as clean_name FROM employees;
\`\`\`

### Display Formatting
\`\`\`sql
SELECT name || ' (' || position || ')' as display FROM employees;
\`\`\`

### Search Normalization
\`\`\`sql
WHERE LOWER(TRIM(name)) = LOWER(TRIM(@search_term))
\`\`\`

### Extract Parts
\`\`\`sql
SELECT SUBSTR(phone, 1, 3) as area_code FROM contacts;
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Uppercase names',
        query: 'SELECT UPPER(name) as name, position FROM employees',
        description: 'Convert names to uppercase',
      },
      {
        title: 'Email generation',
        query: 'SELECT name, LOWER(REPLACE(name, \' \', \'.\')) || \'@company.com\' as email FROM employees',
        description: 'Create email addresses from names',
      },
      {
        title: 'Name initials',
        query: 'SELECT name, SUBSTR(name, 1, 1) || \'.\' as initial, LENGTH(name) as name_length FROM employees',
        description: 'Get initials and name lengths',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'cte-with',
    title: 'CTEs - WITH Clause',
    category: 'advanced',
    difficulty: 'advanced',
    order: 23,
    description: 'Use Common Table Expressions (CTEs) to write more readable queries.',
    content: `# CTEs - WITH Clause

## What are CTEs?

**Common Table Expressions** (CTEs) let you define temporary named result sets that exist only during query execution. Think of them as temporary views.

## Basic Syntax

\`\`\`sql
WITH cte_name AS (
  SELECT column1, column2
  FROM table_name
  WHERE condition
)
SELECT * FROM cte_name;
\`\`\`

## Simple Example

\`\`\`sql
WITH high_earners AS (
  SELECT * FROM employees
  WHERE salary > 80000
)
SELECT * FROM high_earners
WHERE dept_id = 1;
\`\`\`

## Multiple CTEs

Define multiple CTEs separated by commas:

\`\`\`sql
WITH 
high_earners AS (
  SELECT * FROM employees WHERE salary > 80000
),
large_depts AS (
  SELECT dept_id, COUNT(*) as count
  FROM employees
  GROUP BY dept_id
  HAVING COUNT(*) > 3
)
SELECT e.* 
FROM high_earners e
JOIN large_depts d ON e.dept_id = d.dept_id;
\`\`\`

## Benefits of CTEs

### 1. Readability
Break complex queries into logical steps:

\`\`\`sql
WITH 
dept_stats AS (
  SELECT dept_id, AVG(salary) as avg_salary
  FROM employees
  GROUP BY dept_id
),
above_avg_emps AS (
  SELECT e.*, d.avg_salary
  FROM employees e
  JOIN dept_stats d ON e.dept_id = d.dept_id
  WHERE e.salary > d.avg_salary
)
SELECT * FROM above_avg_emps;
\`\`\`

### 2. Reusability
Reference the same subquery multiple times:

\`\`\`sql
WITH recent_orders AS (
  SELECT * FROM orders
  WHERE order_date > DATE('now', '-30 days')
)
SELECT
  (SELECT COUNT(*) FROM recent_orders) as total_orders,
  (SELECT SUM(amount) FROM recent_orders) as total_revenue;
\`\`\`

### 3. Recursion
CTEs can be recursive (advanced):

\`\`\`sql
WITH RECURSIVE counter AS (
  SELECT 1 as n
  UNION ALL
  SELECT n + 1 FROM counter WHERE n < 10
)
SELECT * FROM counter;
\`\`\`

## CTE vs Subquery

**Subquery** (harder to read):
\`\`\`sql
SELECT * FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
\`\`\`

**CTE** (clearer):
\`\`\`sql
WITH avg_salary AS (
  SELECT AVG(salary) as avg FROM employees
)
SELECT * FROM employees, avg_salary
WHERE salary > avg_salary.avg;
\`\`\`

## Complex Example

Find employees earning more than their department average:

\`\`\`sql
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) as avg_salary
  FROM employees
  WHERE dept_id IS NOT NULL
  GROUP BY dept_id
)
SELECT 
  e.name,
  e.salary,
  e.dept_id,
  d.avg_salary,
  e.salary - d.avg_salary as above_avg
FROM employees e
JOIN dept_avg d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_salary
ORDER BY above_avg DESC;
\`\`\`

## When to Use CTEs

- Complex queries need breaking down
- Same subquery used multiple times
- Query logic needs documentation
- Building step-by-step transformations
- Recursive operations needed

## Tips

- Name CTEs descriptively
- Use for readability, not just functionality
- CTEs are evaluated once and cached
- Can significantly improve query clarity
`,
    sampleQueries: [
      {
        title: 'Basic CTE',
        query: 'WITH high_earners AS (SELECT * FROM employees WHERE salary > 80000) SELECT * FROM high_earners WHERE dept_id = 1',
        description: 'Simple CTE for filtering',
      },
      {
        title: 'Multiple CTEs',
        query: 'WITH avg_sal AS (SELECT AVG(salary) as avg FROM employees), high_earners AS (SELECT * FROM employees, avg_sal WHERE salary > avg_sal.avg) SELECT name, salary FROM high_earners',
        description: 'Employees above average salary',
      },
      {
        title: 'Department analysis',
        query: 'WITH dept_stats AS (SELECT dept_id, COUNT(*) as count, AVG(salary) as avg_salary FROM employees GROUP BY dept_id) SELECT * FROM dept_stats WHERE count > 2 ORDER BY avg_salary DESC',
        description: 'Department statistics with CTE',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'insert-update-delete',
    title: 'INSERT, UPDATE, DELETE',
    category: 'dml',
    difficulty: 'intermediate',
    order: 24,
    description: 'Learn to modify data with INSERT, UPDATE, and DELETE statements.',
    content: `# INSERT, UPDATE, DELETE

## Data Manipulation Language (DML)

These commands modify data in your tables:
- **INSERT** - Add new rows
- **UPDATE** - Modify existing rows
- **DELETE** - Remove rows

## INSERT - Adding Data

### Insert Single Row

\`\`\`sql
INSERT INTO employees (name, position, salary, dept_id)
VALUES ('John Doe', 'Engineer', 75000, 1);
\`\`\`

### Insert Multiple Rows

\`\`\`sql
INSERT INTO employees (name, position, salary, dept_id)
VALUES 
  ('Jane Smith', 'Manager', 95000, 2),
  ('Bob Johnson', 'Analyst', 65000, 1),
  ('Alice Brown', 'Designer', 70000, 3);
\`\`\`

### Insert from SELECT

\`\`\`sql
INSERT INTO archived_employees (name, position, salary)
SELECT name, position, salary
FROM employees
WHERE hire_date < '2020-01-01';
\`\`\`

### Insert with Defaults

If column is omitted, default value is used:

\`\`\`sql
INSERT INTO employees (name, position)
VALUES ('Mike Wilson', 'Intern');
-- salary and dept_id will be NULL or default
\`\`\`

## UPDATE - Modifying Data

### Update Single Column

\`\`\`sql
UPDATE employees
SET salary = 80000
WHERE name = 'John Doe';
\`\`\`

### Update Multiple Columns

\`\`\`sql
UPDATE employees
SET 
  salary = salary * 1.10,
  position = 'Senior Engineer'
WHERE name = 'Jane Smith';
\`\`\`

### Update All Rows

⚠️ **Dangerous!** Without WHERE, updates ALL rows:

\`\`\`sql
UPDATE employees
SET salary = salary * 1.05;
\`\`\`

### Update with Calculation

\`\`\`sql
UPDATE employees
SET salary = CASE
  WHEN salary < 60000 THEN salary * 1.10
  WHEN salary < 90000 THEN salary * 1.05
  ELSE salary * 1.02
END;
\`\`\`

### Update from JOIN

\`\`\`sql
UPDATE employees
SET dept_id = 5
WHERE dept_id IN (
  SELECT id FROM departments WHERE name = 'Legacy'
);
\`\`\`

## DELETE - Removing Data

### Delete Specific Rows

\`\`\`sql
DELETE FROM employees
WHERE name = 'John Doe';
\`\`\`

### Delete with Condition

\`\`\`sql
DELETE FROM employees
WHERE salary < 50000 AND hire_date < '2015-01-01';
\`\`\`

### Delete All Rows

⚠️ **Very Dangerous!** Without WHERE, deletes EVERYTHING:

\`\`\`sql
DELETE FROM employees;
\`\`\`

### Delete with Subquery

\`\`\`sql
DELETE FROM employees
WHERE dept_id IN (
  SELECT id FROM departments WHERE closed = 1
);
\`\`\`

## Safety Tips

### 1. Always Test with SELECT First

Before UPDATE/DELETE:
\`\`\`sql
-- Test first
SELECT * FROM employees WHERE dept_id = 3;

-- Then update
UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 3;
\`\`\`

### 2. Use Transactions

\`\`\`sql
BEGIN TRANSACTION;

UPDATE employees SET salary = salary * 1.1 WHERE dept_id = 3;
-- Check the results
SELECT * FROM employees WHERE dept_id = 3;

-- If good:
COMMIT;
-- If bad:
-- ROLLBACK;
\`\`\`

### 3. Always Use WHERE Clause

Unless you really want to affect all rows!

### 4. Backup Before Mass Changes

\`\`\`sql
-- Create backup
CREATE TABLE employees_backup AS SELECT * FROM employees;

-- Do your dangerous operation
UPDATE employees SET ...;

-- If something wrong:
-- DELETE FROM employees;
-- INSERT INTO employees SELECT * FROM employees_backup;
\`\`\`

## Return Values

Some databases support RETURNING clause:

\`\`\`sql
DELETE FROM employees
WHERE dept_id = 5
RETURNING *;
\`\`\`

Shows what was deleted.

## Common Patterns

### Increment Counter
\`\`\`sql
UPDATE products SET view_count = view_count + 1 WHERE id = 123;
\`\`\`

### Toggle Boolean
\`\`\`sql
UPDATE users SET active = NOT active WHERE id = 456;
\`\`\`

### Soft Delete
\`\`\`sql
UPDATE employees SET deleted_at = CURRENT_TIMESTAMP WHERE id = 789;
\`\`\`

Better than DELETE for audit trails!
`,
    sampleQueries: [
      {
        title: 'Insert new employee',
        query: 'INSERT INTO employees (name, position, salary, dept_id) VALUES (\'Test User\', \'Tester\', 55000, 1)',
        description: 'Add a new employee (Note: in read-only demo)',
      },
      {
        title: 'Simulated update',
        query: 'SELECT name, salary, salary * 1.10 as new_salary FROM employees WHERE dept_id = 1',
        description: 'Preview 10% raise for department 1',
      },
      {
        title: 'Simulated delete',
        query: 'SELECT * FROM employees WHERE salary < 60000',
        description: 'Preview rows that would be deleted',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'window-functions',
    title: 'Window Functions - ROW_NUMBER, RANK',
    category: 'advanced',
    difficulty: 'advanced',
    order: 25,
    description: 'Use window functions for advanced analytics with OVER and PARTITION BY.',
    content: `# Window Functions

## What are Window Functions?

**Window functions** perform calculations across a set of rows related to the current row, without collapsing the results like GROUP BY does.

## Basic Syntax

\`\`\`sql
window_function() OVER (
  PARTITION BY column1
  ORDER BY column2
  ROWS/RANGE specification
)
\`\`\`

## ROW_NUMBER()

Assigns a unique sequential number to each row:

\`\`\`sql
SELECT 
  name,
  salary,
  ROW_NUMBER() OVER (ORDER BY salary DESC) as rank
FROM employees;
\`\`\`

Each employee gets a unique number 1, 2, 3, 4...

## RANK()

Similar to ROW_NUMBER, but ties get the same rank:

\`\`\`sql
SELECT 
  name,
  salary,
  RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;
\`\`\`

If two people have salary 90000, both get rank 2, next person gets rank 4.

## DENSE_RANK()

Like RANK, but no gaps in ranking:

\`\`\`sql
SELECT 
  name,
  salary,
  DENSE_RANK() OVER (ORDER BY salary DESC) as rank
FROM employees;
\`\`\`

Ties get same rank, but next rank is consecutive (2, 2, 3 not 2, 2, 4).

## PARTITION BY

Divide results into groups:

\`\`\`sql
SELECT 
  name,
  dept_id,
  salary,
  ROW_NUMBER() OVER (
    PARTITION BY dept_id 
    ORDER BY salary DESC
  ) as dept_rank
FROM employees;
\`\`\`

Ranks employees within each department separately.

## Running Totals

Calculate cumulative sums:

\`\`\`sql
SELECT 
  name,
  salary,
  SUM(salary) OVER (ORDER BY name) as running_total
FROM employees;
\`\`\`

## LAG and LEAD

Access previous or next row values:

\`\`\`sql
SELECT 
  name,
  salary,
  LAG(salary) OVER (ORDER BY salary) as prev_salary,
  LEAD(salary) OVER (ORDER BY salary) as next_salary
FROM employees;
\`\`\`

## NTILE

Divide rows into buckets:

\`\`\`sql
SELECT 
  name,
  salary,
  NTILE(4) OVER (ORDER BY salary) as quartile
FROM employees;
\`\`\`

Splits employees into 4 equal groups.

## Aggregate Window Functions

Use aggregates without GROUP BY:

\`\`\`sql
SELECT 
  name,
  salary,
  AVG(salary) OVER () as company_avg,
  salary - AVG(salary) OVER () as diff_from_avg
FROM employees;
\`\`\`

## Partitioned Aggregates

\`\`\`sql
SELECT 
  name,
  dept_id,
  salary,
  AVG(salary) OVER (PARTITION BY dept_id) as dept_avg
FROM employees;
\`\`\`

Shows department average alongside each employee.

## Top N Per Group

Find top 3 earners in each department:

\`\`\`sql
SELECT * FROM (
  SELECT 
    name,
    dept_id,
    salary,
    ROW_NUMBER() OVER (
      PARTITION BY dept_id 
      ORDER BY salary DESC
    ) as rank
  FROM employees
) WHERE rank <= 3;
\`\`\`

## Window Function vs GROUP BY

**GROUP BY** - Collapses rows:
\`\`\`sql
SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id;
-- Returns one row per department
\`\`\`

**Window Function** - Keeps all rows:
\`\`\`sql
SELECT name, dept_id, salary,
  AVG(salary) OVER (PARTITION BY dept_id) as dept_avg
FROM employees;
-- Returns all employee rows with dept average
\`\`\`

## Frame Specifications

Control which rows are included:

\`\`\`sql
-- All rows in partition (default)
OVER (PARTITION BY dept_id)

-- Current row and all previous
OVER (ORDER BY salary ROWS UNBOUNDED PRECEDING)

-- Moving average (current + 2 before + 2 after)
OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND 2 FOLLOWING)
\`\`\`

## Use Cases

- Rankings and top-N queries
- Running totals and moving averages
- Comparing to group averages
- Gap analysis (LAG/LEAD)
- Percentile calculations
- Time series analysis
`,
    sampleQueries: [
      {
        title: 'Salary ranking',
        query: 'SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as rank FROM employees',
        description: 'Rank all employees by salary',
      },
      {
        title: 'Department rankings',
        query: 'SELECT name, dept_id, salary, ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) as dept_rank FROM employees WHERE dept_id IS NOT NULL',
        description: 'Rank employees within each department',
      },
      {
        title: 'Compare to average',
        query: 'SELECT name, salary, ROUND(AVG(salary) OVER (), 2) as avg_salary, ROUND(salary - AVG(salary) OVER (), 2) as diff FROM employees',
        description: 'Show how each salary compares to average',
      },
    ],
    recommendedSchema: 'employees',
    hints: [
      'Window functions perform calculations across a set of rows related to the current row',
      'OVER() clause defines the "window" - use ORDER BY to specify the order, PARTITION BY to divide into groups',
      'ROW_NUMBER() assigns unique numbers, RANK() allows ties with gaps, DENSE_RANK() allows ties without gaps',
      'Unlike GROUP BY, window functions keep all rows in the result - they just add calculated columns'
    ],
  },
  {
    id: 'date-time-functions',
    title: 'Date and Time Functions',
    category: 'advanced',
    difficulty: 'intermediate',
    order: 26,
    description: 'Work with dates and times using built-in functions.',
    content: `# Date and Time Functions

## Current Date/Time

Get current date and time:

\`\`\`sql
SELECT DATE('now');           -- Current date: 2025-12-12
SELECT TIME('now');           -- Current time: 14:30:45
SELECT DATETIME('now');       -- Both: 2025-12-12 14:30:45
\`\`\`

## Date Arithmetic

Add or subtract time:

\`\`\`sql
-- Add 7 days
SELECT DATE('now', '+7 days');

-- Subtract 1 month
SELECT DATE('now', '-1 month');

-- Add 2 years
SELECT DATE('now', '+2 years');

-- Combine multiple modifiers
SELECT DATE('now', '+1 year', '-3 months', '+15 days');
\`\`\`

## Date Parts

Extract components:

\`\`\`sql
-- SQLite uses strftime
SELECT strftime('%Y', 'now') as year;      -- 2025
SELECT strftime('%m', 'now') as month;     -- 12
SELECT strftime('%d', 'now') as day;       -- 12
SELECT strftime('%H', 'now') as hour;      -- 14
SELECT strftime('%M', 'now') as minute;    -- 30
SELECT strftime('%w', 'now') as weekday;   -- 0-6
\`\`\`

## Format Dates

Custom formatting:

\`\`\`sql
-- Format patterns
SELECT strftime('%Y-%m-%d', 'now');           -- 2025-12-12
SELECT strftime('%d/%m/%Y', 'now');           -- 12/12/2025
SELECT strftime('%Y-%m-%d %H:%M:%S', 'now');  -- 2025-12-12 14:30:45
SELECT strftime('%B %d, %Y', 'now');          -- December 12, 2025
\`\`\`

Common format codes:
- %Y - 4-digit year
- %m - Month (01-12)
- %d - Day (01-31)
- %H - Hour (00-23)
- %M - Minute (00-59)
- %S - Second (00-59)
- %w - Weekday (0-6, Sunday=0)
- %W - Week number
- %B - Full month name
- %b - Abbreviated month

## Date Differences

Calculate time between dates:

\`\`\`sql
-- Days between dates
SELECT JULIANDAY('2025-12-31') - JULIANDAY('2025-01-01') as days;

-- Years difference
SELECT 
  (JULIANDAY('2025-12-12') - JULIANDAY('1990-01-01')) / 365.25 as years;
\`\`\`

## Working with Employee Data

Since our employees table doesn't have date columns, here are conceptual examples:

\`\`\`sql
-- If we had hire_date column:

-- Employees hired in last 30 days
SELECT * FROM employees
WHERE hire_date > DATE('now', '-30 days');

-- Years of service
SELECT 
  name,
  hire_date,
  ROUND((JULIANDAY('now') - JULIANDAY(hire_date)) / 365.25, 1) as years_service
FROM employees;

-- Hire year
SELECT 
  strftime('%Y', hire_date) as year,
  COUNT(*) as hires
FROM employees
GROUP BY year;
\`\`\`

## Date Comparisons

\`\`\`sql
-- Between dates
WHERE order_date BETWEEN '2025-01-01' AND '2025-12-31'

-- This month
WHERE strftime('%Y-%m', order_date) = strftime('%Y-%m', 'now')

-- This year
WHERE strftime('%Y', order_date) = strftime('%Y', 'now')
\`\`\`

## Start/End of Period

\`\`\`sql
-- Start of month
SELECT DATE('now', 'start of month');

-- Start of year
SELECT DATE('now', 'start of year');

-- End of month (start of next month - 1 day)
SELECT DATE('now', 'start of month', '+1 month', '-1 day');
\`\`\`

## Weekday Operations

\`\`\`sql
-- Get Monday of this week
SELECT DATE('now', 'weekday 1');

-- Next Friday
SELECT DATE('now', 'weekday 5');

-- Is today a weekend?
SELECT CASE 
  WHEN CAST(strftime('%w', 'now') AS INTEGER) IN (0, 6) 
  THEN 'Weekend' 
  ELSE 'Weekday' 
END as day_type;
\`\`\`

## Timestamps

Working with Unix timestamps:

\`\`\`sql
-- Current timestamp
SELECT strftime('%s', 'now') as unix_timestamp;

-- Convert timestamp to date
SELECT DATETIME(1234567890, 'unixepoch');

-- Convert date to timestamp
SELECT strftime('%s', '2025-12-12') as timestamp;
\`\`\`

## Common Use Cases

### Age Calculation
\`\`\`sql
SELECT ROUND((JULIANDAY('now') - JULIANDAY(birth_date)) / 365.25) as age;
\`\`\`

### Business Days
\`\`\`sql
SELECT COUNT(*) as business_days
FROM (
  SELECT DATE('2025-01-01', '+' || n || ' days') as date
  FROM generate_series(0, 365) as n
)
WHERE CAST(strftime('%w', date) AS INTEGER) NOT IN (0, 6);
\`\`\`

### Expiration Check
\`\`\`sql
SELECT *, 
  CASE 
    WHEN expiry_date < DATE('now') THEN 'Expired'
    WHEN expiry_date < DATE('now', '+30 days') THEN 'Expiring Soon'
    ELSE 'Valid'
  END as status
FROM subscriptions;
\`\`\`
`,
    sampleQueries: [
      {
        title: 'Current date and time',
        query: 'SELECT DATE(\'now\') as current_date, TIME(\'now\') as current_time, DATETIME(\'now\') as current_datetime',
        description: 'Display current date and time',
      },
      {
        title: 'Date arithmetic',
        query: 'SELECT DATE(\'now\') as today, DATE(\'now\', \'+7 days\') as next_week, DATE(\'now\', \'-30 days\') as 30_days_ago, DATE(\'now\', \'+1 year\') as next_year',
        description: 'Date calculations',
      },
      {
        title: 'Format dates',
        query: 'SELECT strftime(\'%Y-%m-%d\', \'now\') as iso_format, strftime(\'%d/%m/%Y\', \'now\') as uk_format, strftime(\'%B %d, %Y\', \'now\') as us_format, strftime(\'%w\', \'now\') as weekday',
        description: 'Different date formats',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'views',
    title: 'Views - Virtual Tables',
    category: 'ddl',
    difficulty: 'intermediate',
    order: 27,
    description: 'Create and use views to simplify complex queries and improve security.',
    content: `# Views - Virtual Tables

## What are Views?

A **view** is a saved SQL query that acts like a virtual table. It doesn't store data itself, but provides a window into your data.

## Creating Views

\`\`\`sql
CREATE VIEW view_name AS
SELECT column1, column2
FROM table_name
WHERE condition;
\`\`\`

## Simple View Example

\`\`\`sql
CREATE VIEW high_earners AS
SELECT name, position, salary
FROM employees
WHERE salary > 80000;

-- Use it like a table
SELECT * FROM high_earners;
\`\`\`

## Benefits of Views

### 1. Simplify Complex Queries

Save complicated joins:

\`\`\`sql
CREATE VIEW employee_details AS
SELECT 
  e.name,
  e.position,
  e.salary,
  d.name as department
FROM employees e
LEFT JOIN departments d ON e.dept_id = d.id;

-- Now just query the view
SELECT * FROM employee_details WHERE department = 'Engineering';
\`\`\`

### 2. Security & Access Control

Hide sensitive columns:

\`\`\`sql
CREATE VIEW public_employees AS
SELECT name, position, dept_id
FROM employees;
-- Salary is hidden

-- Grant access to view, not base table
-- GRANT SELECT ON public_employees TO public_user;
\`\`\`

### 3. Consistent Business Logic

Ensure calculations are consistent:

\`\`\`sql
CREATE VIEW employee_analytics AS
SELECT 
  name,
  salary,
  salary * 12 as annual_salary,
  CASE 
    WHEN salary > 90000 THEN 'Senior'
    WHEN salary > 60000 THEN 'Mid'
    ELSE 'Junior'
  END as level
FROM employees;
\`\`\`

### 4. Data Abstraction

Change underlying schema without breaking queries:

\`\`\`sql
CREATE VIEW current_employees AS
SELECT * FROM employees
WHERE active = 1;
-- If we add/remove columns from employees,
-- we update the view, not all queries
\`\`\`

## Modifying Views

### Replace View (SQLite)

\`\`\`sql
DROP VIEW IF EXISTS high_earners;
CREATE VIEW high_earners AS
SELECT name, position, salary, dept_id
FROM employees
WHERE salary > 90000;  -- Changed threshold
\`\`\`

### Drop View

\`\`\`sql
DROP VIEW high_earners;
\`\`\`

## Views with Aggregations

\`\`\`sql
CREATE VIEW department_stats AS
SELECT 
  dept_id,
  COUNT(*) as employee_count,
  AVG(salary) as avg_salary,
  MAX(salary) as max_salary,
  MIN(salary) as min_salary
FROM employees
WHERE dept_id IS NOT NULL
GROUP BY dept_id;

-- Query aggregated data easily
SELECT * FROM department_stats WHERE employee_count > 3;
\`\`\`

## Views with Joins

\`\`\`sql
CREATE VIEW order_details AS
SELECT 
  o.id,
  o.amount,
  o.order_date,
  c.name as customer_name
FROM orders o
JOIN customers c ON o.customer_id = c.id;
\`\`\`

## Materialized Views

Standard views recalculate on every query. **Materialized views** store results (not in SQLite):

\`\`\`sql
-- PostgreSQL example (not SQLite)
CREATE MATERIALIZED VIEW sales_summary AS
SELECT product_id, SUM(amount) as total_sales
FROM orders
GROUP BY product_id;

-- Refresh when data changes
REFRESH MATERIALIZED VIEW sales_summary;
\`\`\`

SQLite doesn't have materialized views, but you can use triggers and tables.

## Updatable Views

Some simple views can be updated:

\`\`\`sql
CREATE VIEW active_employees AS
SELECT * FROM employees WHERE active = 1;

-- This may work (depends on database)
UPDATE active_employees SET salary = 85000 WHERE id = 5;
\`\`\`

**Limitations:** Views with JOINs, GROUP BY, DISTINCT usually aren't updatable.

## View Information

See existing views:

\`\`\`sql
-- SQLite
SELECT name FROM sqlite_master 
WHERE type = 'view';

-- Get view definition
SELECT sql FROM sqlite_master 
WHERE type = 'view' AND name = 'high_earners';
\`\`\`

## Best Practices

1. **Name clearly** - Use descriptive names like \`active_customers\` not \`view1\`
2. **Document** - Add comments explaining view purpose
3. **Keep simple** - Very complex views can be slow
4. **Consider indexes** - Index the base tables, not views
5. **Version control** - Track view definitions in your schema

## Common Patterns

### Filtered View
\`\`\`sql
CREATE VIEW recent_orders AS
SELECT * FROM orders 
WHERE order_date > DATE('now', '-30 days');
\`\`\`

### Computed Columns
\`\`\`sql
CREATE VIEW employee_compensation AS
SELECT 
  name,
  salary,
  salary * 0.15 as benefits,
  salary * 1.15 as total_comp
FROM employees;
\`\`\`

### Denormalized View
\`\`\`sql
CREATE VIEW sales_report AS
SELECT 
  o.id,
  o.amount,
  o.order_date,
  c.name as customer,
  c.email,
  p.name as product
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN products p ON o.product_id = p.id;
\`\`\`

## When to Use Views

✅ **Use views for:**
- Simplifying complex queries
- Hiding sensitive data
- Providing consistent interfaces
- Backward compatibility

❌ **Don't use views for:**
- Heavy computation (use materialized views or cache)
- Frequent updates (use base tables)
- Very simple queries (overhead not worth it)
`,
    sampleQueries: [
      {
        title: 'Simulated view - High earners',
        query: 'SELECT name, position, salary FROM employees WHERE salary > 80000',
        description: 'Would be: CREATE VIEW high_earners AS...',
      },
      {
        title: 'Simulated view - Dept summary',
        query: 'SELECT dept_id, COUNT(*) as count, ROUND(AVG(salary), 2) as avg_salary FROM employees WHERE dept_id IS NOT NULL GROUP BY dept_id',
        description: 'Would be: CREATE VIEW dept_summary AS...',
      },
      {
        title: 'Simulated view - Employee details',
        query: 'SELECT e.name, e.position, e.salary, d.name as department FROM employees e LEFT JOIN departments d ON e.dept_id = d.id',
        description: 'Would be: CREATE VIEW employee_details AS...',
      },
    ],
    recommendedSchema: 'employees',
  },
  {
    id: 'indexes',
    title: 'Indexes - Performance Optimization',
    category: 'ddl',
    difficulty: 'advanced',
    order: 28,
    description: 'Understand indexes and how they improve query performance.',
    content: `# Indexes - Performance Optimization

## What are Indexes?

An **index** is a data structure that improves the speed of data retrieval operations on a table. Think of it like a book's index - you can quickly find what you're looking for without reading every page.

## Why Use Indexes?

**Without Index:**
\`\`\`sql
SELECT * FROM employees WHERE name = 'John Doe';
-- Scans every row (slow for large tables)
\`\`\`

**With Index:**
\`\`\`sql
CREATE INDEX idx_employee_name ON employees(name);
SELECT * FROM employees WHERE name = 'John Doe';
-- Uses index to find row instantly (fast!)
\`\`\`

## Creating Indexes

### Single Column Index

\`\`\`sql
CREATE INDEX idx_salary ON employees(salary);
\`\`\`

### Multi-Column Index

\`\`\`sql
CREATE INDEX idx_dept_salary ON employees(dept_id, salary);
\`\`\`

Order matters! This index helps:
- \`WHERE dept_id = 1\`
- \`WHERE dept_id = 1 AND salary > 50000\`

But NOT:
- \`WHERE salary > 50000\` (dept_id not used)

### Unique Index

Ensures no duplicate values:

\`\`\`sql
CREATE UNIQUE INDEX idx_email ON employees(email);
-- Prevents duplicate emails
\`\`\`

## When Indexes Help

✅ **Indexes speed up:**
- WHERE clauses
- JOIN conditions
- ORDER BY
- GROUP BY
- MIN/MAX operations

**Example:**
\`\`\`sql
-- Fast with index on salary
SELECT * FROM employees WHERE salary > 80000;

-- Fast with index on dept_id
SELECT * FROM employees e
JOIN departments d ON e.dept_id = d.id;

-- Fast with index on salary
SELECT * FROM employees ORDER BY salary DESC;
\`\`\`

## When Indexes Don't Help

❌ **Indexes DON'T help:**
- Small tables (< 1000 rows)
- Columns with few distinct values
- Functions on columns: \`WHERE UPPER(name) = 'JOHN'\`
- Leading wildcards: \`WHERE name LIKE '%son'\`

## Index Trade-offs

### Pros:
- Faster reads (SELECT queries)
- Faster joins
- Enforce uniqueness

### Cons:
- Slower writes (INSERT, UPDATE, DELETE)
- Extra storage space
- Need maintenance

**Rule of thumb:** Index what you search, not what you store.

## Viewing Indexes

\`\`\`sql
-- SQLite: List indexes
SELECT name, sql FROM sqlite_master 
WHERE type = 'index' AND tbl_name = 'employees';

-- Show table indexes
PRAGMA index_list('employees');

-- Show index columns
PRAGMA index_info('idx_salary');
\`\`\`

## Dropping Indexes

\`\`\`sql
DROP INDEX idx_salary;
\`\`\`

## Index Types

### B-Tree Index (Default)
- Most common
- Good for equality and range queries
- Used by SQLite by default

\`\`\`sql
CREATE INDEX idx_salary ON employees(salary);
\`\`\`

### Partial Index
Index only rows matching a condition:

\`\`\`sql
CREATE INDEX idx_high_salary 
ON employees(salary)
WHERE salary > 100000;
-- Only indexes high earners (smaller, faster)
\`\`\`

### Expression Index
Index on computed values:

\`\`\`sql
CREATE INDEX idx_lower_name 
ON employees(LOWER(name));
-- Now LOWER(name) queries use index
\`\`\`

## Query Plan Analysis

See if indexes are used:

\`\`\`sql
EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE salary > 80000;
-- Shows: "SEARCH employees USING INDEX idx_salary"
\`\`\`

## Index Best Practices

### 1. Index Foreign Keys

Always index columns used in joins:

\`\`\`sql
CREATE INDEX idx_dept_id ON employees(dept_id);
-- Speeds up joins with departments
\`\`\`

### 2. Index WHERE Columns

Index columns frequently in WHERE:

\`\`\`sql
-- If you often query:
SELECT * FROM orders WHERE customer_id = 123;

-- Create index:
CREATE INDEX idx_customer_id ON orders(customer_id);
\`\`\`

### 3. Index ORDER BY Columns

\`\`\`sql
-- If you often sort:
SELECT * FROM products ORDER BY price DESC;

-- Create index:
CREATE INDEX idx_price ON products(price);
\`\`\`

### 4. Composite Indexes

Order columns by selectivity (most selective first):

\`\`\`sql
-- dept_id has few values, salary has many
CREATE INDEX idx_dept_salary ON employees(salary, dept_id);
-- Better than (dept_id, salary)
\`\`\`

### 5. Don't Over-Index

Too many indexes:
- Slow down writes
- Waste space
- Rarely all used

**Start with 2-3 critical indexes, add more based on slow queries.**

## Covering Indexes

Index includes all needed columns:

\`\`\`sql
CREATE INDEX idx_cover ON employees(dept_id, name, salary);

SELECT name, salary FROM employees WHERE dept_id = 1;
-- All data in index, no table lookup needed!
\`\`\`

## Index Maintenance

Indexes can become fragmented:

\`\`\`sql
-- SQLite auto-maintains, but can manually optimize
VACUUM;

-- PostgreSQL
REINDEX TABLE employees;
\`\`\`

## Common Scenarios

### E-commerce
\`\`\`sql
-- Orders table
CREATE INDEX idx_customer ON orders(customer_id);
CREATE INDEX idx_date ON orders(order_date);
CREATE INDEX idx_status ON orders(status);
\`\`\`

### User Authentication
\`\`\`sql
CREATE UNIQUE INDEX idx_username ON users(username);
CREATE UNIQUE INDEX idx_email ON users(email);
\`\`\`

### Time-series Data
\`\`\`sql
CREATE INDEX idx_timestamp ON events(timestamp DESC);
-- DESC for newest-first queries
\`\`\`

## Testing Index Impact

\`\`\`sql
-- Test without index
EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE salary > 80000;
-- Shows: SCAN (slow)

-- Create index
CREATE INDEX idx_salary ON employees(salary);

-- Test with index
EXPLAIN QUERY PLAN
SELECT * FROM employees WHERE salary > 80000;
-- Shows: SEARCH using INDEX (fast)
\`\`\`

## Index Pitfalls

1. **Function calls break indexes:**
   - \`WHERE UPPER(name) = 'JOHN'\` ❌
   - \`WHERE name = 'John'\` ✅

2. **OR conditions may not use index:**
   - \`WHERE a = 1 OR b = 2\` (may scan)
   - \`WHERE a = 1 UNION WHERE b = 2\` (uses indexes)

3. **Type mismatches:**
   - \`WHERE id = '123'\` (string) on integer column
   - Prevents index usage
`,
    sampleQueries: [
      {
        title: 'Show query plan',
        query: 'EXPLAIN QUERY PLAN SELECT * FROM employees WHERE salary > 80000',
        description: 'See how query executes (shows if indexes used)',
      },
      {
        title: 'List all indexes',
        query: 'SELECT name, tbl_name, sql FROM sqlite_master WHERE type = \'index\' AND sql IS NOT NULL ORDER BY tbl_name, name',
        description: 'Show all indexes in database',
      },
      {
        title: 'Table indexes',
        query: 'PRAGMA index_list(\'employees\')',
        description: 'List indexes on employees table',
      },
    ],
    recommendedSchema: 'employees',
  },
];

