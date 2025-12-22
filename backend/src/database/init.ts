import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';

let db: Database | null = null;
let SQL: any = null;

export async function getDatabase(): Promise<Database> {
  if (!db) {
    if (!SQL) {
      SQL = await initSqlJs();
    }
    
    // Use in-memory database for serverless (Vercel)
    db = new SQL.Database();
  }
  return db!;
}

export function saveDatabase(): void {
  // No-op for serverless - database is in-memory only
  // In production, you would use a proper database service
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();
  
  // Create schemas
  createEmployeesSchema(database);
  createOrdersSchema(database);
  createStudentsSchema(database);
  createTransactionsSchema(database);
  
  // Save database to disk
  saveDatabase();
  
  console.log('✅ Database initialized with sample schemas');
}

function createEmployeesSchema(db: Database): void {
  // Drop existing tables
  db.exec(`
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS departments;
  `);
  
  // Create tables
  db.exec(`
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
  `);
  
  // Insert sample data
  const departments = [
    [1, 'Engineering', 'San Francisco', 5000000],
    [2, 'Sales', 'New York', 3000000],
    [3, 'Marketing', 'Los Angeles', 2000000],
    [4, 'HR', 'Chicago', 1000000],
    [5, 'Finance', 'Boston', 1500000],
  ];
  
  for (const dept of departments) {
    db.run('INSERT INTO departments (id, name, location, budget) VALUES (?, ?, ?, ?)', dept);
  }
  
  const employees = [
    [1, 'Alice Johnson', 1, 'Senior Engineer', 120000, '2020-01-15'],
    [2, 'Bob Smith', 1, 'Engineer', 95000, '2021-03-22'],
    [3, 'Carol White', 1, 'Lead Engineer', 140000, '2019-06-10'],
    [4, 'David Brown', 2, 'Sales Manager', 110000, '2020-05-01'],
    [5, 'Eve Davis', 2, 'Sales Rep', 75000, '2021-09-15'],
    [6, 'Frank Miller', 2, 'Sales Rep', 72000, '2022-01-10'],
    [7, 'Grace Lee', 3, 'Marketing Manager', 105000, '2020-08-20'],
    [8, 'Henry Wilson', 3, 'Marketing Specialist', 68000, '2021-11-05'],
    [9, 'Iris Taylor', 4, 'HR Manager', 95000, '2019-04-12'],
    [10, 'Jack Anderson', 4, 'HR Specialist', 62000, '2022-02-28'],
    [11, 'Kate Martinez', 5, 'Financial Analyst', 85000, '2020-10-15'],
    [12, 'Leo Garcia', 5, 'Accountant', 70000, '2021-07-01'],
    [13, 'Mia Rodriguez', 1, 'Engineer', 98000, '2021-12-01'],
    [14, 'Noah Thomas', 2, 'Sales Rep', 73000, '2022-03-15'],
    [15, 'Olivia Moore', null, 'Consultant', 115000, '2022-06-01'],
  ];
  
  for (const emp of employees) {
    db.run('INSERT INTO employees (id, name, dept_id, position, salary, hire_date) VALUES (?, ?, ?, ?, ?, ?)', emp);
  }
}

function createOrdersSchema(db: Database): void {
  db.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS products;
  `);
  
  db.exec(`
    CREATE TABLE customers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL
    );
    
    CREATE TABLE products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    );
    
    CREATE TABLE orders (
      id INTEGER PRIMARY KEY,
      customer_id INTEGER NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL,
      total REAL NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    
    CREATE TABLE order_items (
      id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);
  
  const customers = [
    [1, 'John Doe', 'john@example.com', 'New York', 'USA'],
    [2, 'Jane Smith', 'jane@example.com', 'London', 'UK'],
    [3, 'Bob Wilson', 'bob@example.com', 'Toronto', 'Canada'],
    [4, 'Alice Brown', 'alice@example.com', 'Sydney', 'Australia'],
    [5, 'Charlie Davis', 'charlie@example.com', 'Paris', 'France'],
  ];
  
  for (const customer of customers) {
    db.run('INSERT INTO customers (id, name, email, city, country) VALUES (?, ?, ?, ?, ?)', customer);
  }
  
  const products = [
    [1, 'Laptop', 'Electronics', 999.99, 50],
    [2, 'Mouse', 'Electronics', 29.99, 200],
    [3, 'Keyboard', 'Electronics', 79.99, 150],
    [4, 'Monitor', 'Electronics', 299.99, 75],
    [5, 'Desk Chair', 'Furniture', 199.99, 100],
    [6, 'Desk', 'Furniture', 399.99, 50],
    [7, 'Notebook', 'Stationery', 4.99, 500],
    [8, 'Pen Set', 'Stationery', 12.99, 300],
  ];
  
  for (const product of products) {
    db.run('INSERT INTO products (id, name, category, price, stock) VALUES (?, ?, ?, ?, ?)', product);
  }
  
  const orders = [
    [1, 1, '2024-01-15', 'Completed', 1309.97],
    [2, 2, '2024-01-18', 'Completed', 329.98],
    [3, 1, '2024-02-01', 'Shipped', 599.98],
    [4, 3, '2024-02-10', 'Processing', 1099.98],
    [5, 4, '2024-02-15', 'Completed', 17.98],
    [6, 2, '2024-03-01', 'Cancelled', 0],
    [7, 5, '2024-03-05', 'Completed', 999.99],
  ];
  
  for (const order of orders) {
    db.run('INSERT INTO orders (id, customer_id, order_date, status, total) VALUES (?, ?, ?, ?, ?)', order);
  }
  
  const orderItems = [
    [1, 1, 1, 1, 999.99],
    [2, 1, 2, 1, 29.99],
    [3, 1, 3, 1, 79.99],
    [4, 2, 4, 1, 299.99],
    [5, 2, 2, 1, 29.99],
    [6, 3, 5, 3, 199.99],
    [7, 4, 1, 1, 999.99],
    [8, 4, 6, 1, 399.99],
    [9, 5, 7, 2, 4.99],
    [10, 5, 8, 1, 12.99],
    [11, 7, 1, 1, 999.99],
  ];
  
  for (const item of orderItems) {
    db.run('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)', item);
  }
}

function createStudentsSchema(db: Database): void {
  db.exec(`
    DROP TABLE IF EXISTS enrollments;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS courses;
  `);
  
  db.exec(`
    CREATE TABLE students (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      major TEXT NOT NULL,
      year INTEGER NOT NULL
    );
    
    CREATE TABLE courses (
      id INTEGER PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      credits INTEGER NOT NULL,
      instructor TEXT NOT NULL
    );
    
    CREATE TABLE enrollments (
      id INTEGER PRIMARY KEY,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      semester TEXT NOT NULL,
      grade TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
  `);
  
  const students = [
    [1, 'Emma Watson', 'emma@university.edu', 'Computer Science', 3],
    [2, 'Liam Chen', 'liam@university.edu', 'Computer Science', 2],
    [3, 'Sophia Patel', 'sophia@university.edu', 'Mathematics', 4],
    [4, 'Noah Kim', 'noah@university.edu', 'Physics', 1],
    [5, 'Ava Johnson', 'ava@university.edu', 'Computer Science', 2],
  ];
  
  for (const student of students) {
    db.run('INSERT INTO students (id, name, email, major, year) VALUES (?, ?, ?, ?, ?)', student);
  }
  
  const courses = [
    [1, 'CS101', 'Introduction to Programming', 4, 'Dr. Smith'],
    [2, 'CS201', 'Data Structures', 4, 'Dr. Johnson'],
    [3, 'CS301', 'Algorithms', 4, 'Dr. Williams'],
    [4, 'MATH201', 'Calculus II', 4, 'Dr. Brown'],
    [5, 'PHYS101', 'Physics I', 4, 'Dr. Davis'],
  ];
  
  for (const course of courses) {
    db.run('INSERT INTO courses (id, code, name, credits, instructor) VALUES (?, ?, ?, ?, ?)', course);
  }
  
  const enrollments = [
    [1, 1, 1, 'Fall 2022', 'A'],
    [2, 1, 2, 'Spring 2023', 'A-'],
    [3, 1, 3, 'Fall 2023', 'B+'],
    [4, 2, 1, 'Fall 2023', 'B'],
    [5, 2, 2, 'Spring 2024', null],
    [6, 3, 2, 'Fall 2022', 'A'],
    [7, 3, 3, 'Spring 2023', 'A'],
    [8, 3, 4, 'Fall 2023', 'A-'],
    [9, 4, 5, 'Fall 2023', 'B+'],
    [10, 5, 1, 'Spring 2024', null],
  ];
  
  for (const enrollment of enrollments) {
    db.run('INSERT INTO enrollments (id, student_id, course_id, semester, grade) VALUES (?, ?, ?, ?, ?)', enrollment);
  }
}

function createTransactionsSchema(db: Database): void {
  db.exec(`
    DROP TABLE IF EXISTS transactions;
  `);
  
  db.exec(`
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL,
      transaction_date TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL
    );
  `);
  
  const transactions = [
    [1, 1001, '2024-01-05', 1500.00, 'deposit', 'Salary'],
    [2, 1001, '2024-01-10', -50.00, 'withdrawal', 'ATM'],
    [3, 1001, '2024-01-15', -200.00, 'withdrawal', 'Rent'],
    [4, 1002, '2024-01-07', 2000.00, 'deposit', 'Salary'],
    [5, 1002, '2024-01-12', -100.00, 'withdrawal', 'Groceries'],
    [6, 1001, '2024-01-20', -75.00, 'withdrawal', 'Utilities'],
    [7, 1003, '2024-01-08', 1800.00, 'deposit', 'Salary'],
    [8, 1003, '2024-01-14', -300.00, 'withdrawal', 'Shopping'],
    [9, 1001, '2024-02-05', 1500.00, 'deposit', 'Salary'],
    [10, 1002, '2024-02-07', 2000.00, 'deposit', 'Salary'],
  ];
  
  for (const transaction of transactions) {
    db.run('INSERT INTO transactions (id, account_id, transaction_date, amount, type, description) VALUES (?, ?, ?, ?, ?, ?)', transaction);
  }
}

export async function resetDatabase(): Promise<void> {
  if (db) {
    db.close();
  }
  
  const dbPath = process.env.DATABASE_PATH || './data/visualsql.db';
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  db = null;
  await initDatabase();
}
