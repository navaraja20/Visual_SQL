# VisualSQL Quick Start Guide

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend API at http://localhost:3001
   - Frontend at http://localhost:3000

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## First Steps

1. **Explore the Home Page** - See overview of all modules
2. **Click "Start Learning"** - Browse available SQL topics
3. **Choose a beginner module** like "SELECT and FROM"
4. **Read the lesson** in the left panel
5. **Try sample queries** - Click on example queries to load them
6. **Run with Visualization** - See step-by-step execution
7. **Navigate through steps** using arrow buttons or Play
8. **Practice** - Go to Practice page to test your skills

## Sample Queries to Try

### Basic SELECT
```sql
SELECT * FROM employees
```

### Filtering
```sql
SELECT name, salary FROM employees WHERE salary > 100000
```

### Joins
```sql
SELECT e.name, d.name AS department 
FROM employees e 
INNER JOIN departments d ON e.dept_id = d.id
```

### Aggregation
```sql
SELECT dept_id, COUNT(*) AS count, AVG(salary) AS avg_salary
FROM employees
GROUP BY dept_id
```

### Subqueries
```sql
SELECT name, salary FROM employees 
WHERE salary > (SELECT AVG(salary) FROM employees)
```

## Available Schemas

1. **employees** - Employee & department data
   - Tables: `employees`, `departments`
   
2. **orders** - E-commerce data
   - Tables: `customers`, `products`, `orders`, `order_items`
   
3. **students** - University data
   - Tables: `students`, `courses`, `enrollments`
   
4. **transactions** - Banking data
   - Tables: `transactions`

## Tips

- Use the **Show/Hide Lesson** button to maximize visualization space
- **Step through visualizations** slowly to understand each operation
- Try **modifying sample queries** to experiment
- Complete **exercises** to test your understanding
- Progress is saved automatically in your browser

## Troubleshooting

**Port already in use?**
```bash
# Change port in backend/.env
PORT=3002
```

**Database issues?**
```bash
# Delete and recreate
rm backend/data/visualsql.db
# Restart backend - it will recreate
```

**Build errors?**
```bash
# Clean install
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
```

## Next Steps

- Complete all modules in order
- Try all practice exercises
- Experiment with your own queries
- Add custom modules (see main README)

Happy Learning! 🎓
