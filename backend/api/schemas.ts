import type { VercelRequest, VercelResponse } from '@vercel/node';

const schemas = {
  employees: `
CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  budget REAL NOT NULL
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  dept_id INTEGER,
  position TEXT NOT NULL,
  salary REAL NOT NULL,
  hire_date TEXT NOT NULL,
  FOREIGN KEY (dept_id) REFERENCES departments(id)
);

INSERT INTO departments VALUES (1, 'Engineering', 'San Francisco', 5000000);
INSERT INTO departments VALUES (2, 'Sales', 'New York', 3000000);
INSERT INTO departments VALUES (3, 'Marketing', 'Los Angeles', 2000000);
INSERT INTO departments VALUES (4, 'HR', 'Chicago', 1000000);
INSERT INTO departments VALUES (5, 'Finance', 'Boston', 1500000);

INSERT INTO employees VALUES (1, 'Alice Johnson', 1, 'Senior Engineer', 120000, '2020-01-15');
INSERT INTO employees VALUES (2, 'Bob Smith', 1, 'Engineer', 95000, '2021-03-22');
INSERT INTO employees VALUES (3, 'Carol White', 1, 'Lead Engineer', 140000, '2019-06-10');
INSERT INTO employees VALUES (4, 'David Brown', 2, 'Sales Manager', 110000, '2020-07-01');
INSERT INTO employees VALUES (5, 'Eve Davis', 2, 'Sales Rep', 75000, '2021-09-15');
  `.trim(),
  
  orders: `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT NOT NULL
);

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO customers VALUES (1, 'John Doe', 'john@example.com', 'USA');
INSERT INTO customers VALUES (2, 'Jane Smith', 'jane@example.com', 'UK');
INSERT INTO customers VALUES (3, 'Bob Johnson', 'bob@example.com', 'Canada');

INSERT INTO products VALUES (1, 'Laptop', 'Electronics', 999.99);
INSERT INTO products VALUES (2, 'Mouse', 'Electronics', 29.99);
INSERT INTO products VALUES (3, 'Keyboard', 'Electronics', 79.99);

INSERT INTO orders VALUES (1, 1, 1, 2, '2024-01-15');
INSERT INTO orders VALUES (2, 1, 2, 1, '2024-01-15');
INSERT INTO orders VALUES (3, 2, 3, 1, '2024-01-20');
  `.trim(),
  
  students: `
CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  major TEXT NOT NULL,
  gpa REAL NOT NULL
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  department TEXT NOT NULL
);

CREATE TABLE enrollments (
  student_id INTEGER,
  course_id INTEGER,
  grade TEXT,
  semester TEXT NOT NULL,
  PRIMARY KEY (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO students VALUES (1, 'Alice', 20, 'Computer Science', 3.8);
INSERT INTO students VALUES (2, 'Bob', 21, 'Mathematics', 3.5);
INSERT INTO students VALUES (3, 'Carol', 19, 'Computer Science', 3.9);

INSERT INTO courses VALUES (1, 'Database Systems', 3, 'CS');
INSERT INTO courses VALUES (2, 'Algorithms', 4, 'CS');
INSERT INTO courses VALUES (3, 'Calculus', 4, 'Math');

INSERT INTO enrollments VALUES (1, 1, 'A', 'Fall 2023');
INSERT INTO enrollments VALUES (1, 2, 'B+', 'Fall 2023');
INSERT INTO enrollments VALUES (2, 3, 'A-', 'Fall 2023');
  `.trim()
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { schemaName } = req.query;

  if (schemaName && typeof schemaName === 'string') {
    const schema = schemas[schemaName as keyof typeof schemas];
    if (schema) {
      return res.status(200).json({ name: schemaName, sql: schema });
    }
    return res.status(404).json({ error: 'Schema not found' });
  }

  // Return list of available schemas
  return res.status(200).json({
    schemas: Object.keys(schemas)
  });
}
