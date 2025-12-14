# VisualSQL - Interactive SQL Learning Platform

![VisualSQL Banner](https://img.shields.io/badge/VisualSQL-Educational_Platform-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

**VisualSQL** is a comprehensive, interactive web application designed to teach SQL from absolute beginner to advanced topics through step-by-step visual animations and hands-on practice.

## 🎯 Features

### Interactive Learning
- **Step-by-step visualizations** showing how SQL queries execute
- **Real-time query execution** on sample databases
- **Animated demonstrations** of JOINs, aggregations, filters, and more
- **Progressive learning path** from basics to advanced topics

### Comprehensive SQL Coverage
- **Basics**: SELECT, FROM, WHERE, ORDER BY, LIMIT, DISTINCT
- **Filtering**: Comparison operators, logical operators (AND, OR, NOT), IN, BETWEEN, LIKE
- **Joins**: INNER, LEFT, RIGHT, FULL OUTER, CROSS, SELF
- **Aggregation**: GROUP BY, HAVING, COUNT, SUM, AVG, MIN, MAX
- **Set Operations**: UNION, INTERSECT, EXCEPT
- **Subqueries**: Scalar, column, row, and table subqueries; correlated subqueries
- **Advanced**: Window functions, CTEs, recursive queries
- **DML**: INSERT, UPDATE, DELETE
- **DDL**: CREATE TABLE, ALTER TABLE, constraints, indexes

### Practice System
- **Multiple exercise types**: Write queries, multiple choice, predict results
- **Auto-grading** with instant feedback
- **Progress tracking** stored locally
- **Hints and explanations** for each exercise

### Sample Databases
- **Employees & Departments** - HR management system
- **E-commerce Orders** - Customers, products, orders
- **University Enrollments** - Students, courses, grades
- **Financial Transactions** - Banking operations

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- React 18 with Hooks
- Tailwind CSS for styling
- Monaco Editor for SQL editing
- Framer Motion for animations
- Axios for API calls

**Backend:**
- Node.js with Express and TypeScript
- Better-SQLite3 for SQL execution
- Custom query parser for visualization steps
- RESTful API design

**Database:**
- SQLite (in-memory and persistent)
- Pre-seeded with educational datasets

### Project Structure

```
VisualSQL/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── pages/           # Next.js pages
│   │   │   ├── index.tsx    # Home/landing page
│   │   │   ├── modules/     # Module pages
│   │   │   │   ├── index.tsx        # Module list
│   │   │   │   └── [moduleId].tsx   # Individual module
│   │   │   └── practice.tsx # Practice/quiz page
│   │   ├── components/      # React components
│   │   │   ├── SQLEditor.tsx
│   │   │   ├── VisualizationCanvas.tsx
│   │   │   └── visualizations/
│   │   │       ├── TableView.tsx
│   │   │       ├── JoinVisualization.tsx
│   │   │       ├── FilterVisualization.tsx
│   │   │       └── GroupByVisualization.tsx
│   │   └── styles/          # Global styles
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Express backend API
│   ├── src/
│   │   ├── index.ts         # Entry point
│   │   ├── database/        # Database initialization
│   │   │   └── init.ts      # Schema creation & seeding
│   │   ├── services/        # Business logic
│   │   │   └── query-executor.service.ts
│   │   ├── routes/          # API routes
│   │   │   ├── query.routes.ts
│   │   │   ├── module.routes.ts
│   │   │   ├── exercise.routes.ts
│   │   │   └── schema.routes.ts
│   │   ├── data/            # Module & exercise definitions
│   │   │   ├── modules.ts
│   │   │   └── exercises.ts
│   │   └── types/           # TypeScript types
│   │       └── visualization.types.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json             # Root package.json (monorepo)
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/visualsql.git
   cd visualsql
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

   This will install dependencies for both frontend and backend.

3. **Set up environment variables:**

   Backend (.env file in `backend/` directory):
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_PATH=./data/visualsql.db
   ```

   Frontend (environment variables are set in `next.config.js`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Development

**Run both frontend and backend simultaneously:**
```bash
npm run dev
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:3000`

**Or run them separately:**

Backend only:
```bash
npm run dev:backend
```

Frontend only:
```bash
npm run dev:frontend
```

### Production Build

```bash
npm run build
npm start
```

## 📚 How to Use

### For Students

1. **Start Learning**: Visit the homepage and browse available modules
2. **Choose a Module**: Select a topic from basics to advanced
3. **Read the Lesson**: Study the e-lecture content on each topic
4. **Try Sample Queries**: Load and execute pre-built example queries
5. **Visualize Execution**: Watch step-by-step animations showing how queries work
6. **Practice**: Complete exercises to test your understanding
7. **Track Progress**: Monitor your completion rate across all exercises

### For Instructors/Contributors

#### Adding a New Module

1. **Create module content** in `backend/src/data/modules.ts`:

```typescript
{
  id: 'your-module-id',
  title: 'Module Title',
  category: 'basics', // or 'filtering', 'joins', 'aggregation', etc.
  difficulty: 'beginner', // or 'intermediate', 'advanced'
  order: 100,
  description: 'Short description',
  content: `# Markdown Content
  
Your lesson content here in Markdown format.
  `,
  sampleQueries: [
    {
      title: 'Query Name',
      query: 'SELECT * FROM table',
      description: 'What this query does',
    },
  ],
  recommendedSchema: 'employees',
}
```

2. **Add the module** to the `modules` array
3. **Restart the backend** to see changes

#### Adding New Exercises

1. **Create exercises** in `backend/src/data/exercises.ts`:

```typescript
{
  id: 'ex-unique-id',
  moduleId: 'related-module-id',
  type: 'write-query', // or 'multiple-choice', 'predict-result'
  title: 'Exercise Title',
  description: 'Brief description',
  difficulty: 'easy', // or 'medium', 'hard'
  schema: 'employees',
  question: 'The exercise question',
  answer: 'SELECT * FROM employees', // correct answer
  hints: ['Hint 1', 'Hint 2'],
}
```

For multiple-choice exercises:
```typescript
{
  // ... other fields
  type: 'multiple-choice',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
  ],
  answer: 'b', // correct option id
}
```

2. **Add to exercises array**
3. **Restart backend**

#### Adding New Database Schemas

1. **Edit `backend/src/database/init.ts`**
2. **Create a new function** for your schema:

```typescript
function createYourSchema(db: Database.Database): void {
  db.exec(`
    DROP TABLE IF EXISTS your_table;
    
    CREATE TABLE your_table (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      value INTEGER
    );
  `);
  
  const insert = db.prepare('INSERT INTO your_table (id, name, value) VALUES (?, ?, ?)');
  const data = [
    [1, 'Item 1', 100],
    [2, 'Item 2', 200],
  ];
  
  for (const row of data) {
    insert.run(...row);
  }
}
```

3. **Call your function** in `initDatabase()`
4. **Register the schema** in `backend/src/routes/schema.routes.ts`

## 🎨 Visualization System

### How Visualizations Work

The backend query executor breaks down SQL queries into discrete steps:

1. **Parse Query**: Identify clauses (FROM, JOIN, WHERE, GROUP BY, etc.)
2. **Execute Step-by-Step**: Run each clause independently
3. **Capture Intermediate States**: Store table states between steps
4. **Generate Visualization Data**: Create structured JSON for frontend
5. **Animate in Frontend**: Components render each step with transitions

### Visualization Types

- **ScanStep**: Shows initial table scans
- **JoinStep**: Displays matching rows with visual connections
- **FilterStep**: Highlights kept vs. filtered rows
- **GroupByStep**: Color-codes groups and shows aggregates
- **ProjectStep**: Shows column selection
- **OrderByStep**: Displays sorted results
- **LimitStep**: Shows pagination/limiting

### Extending Visualizations

To add a new visualization type:

1. **Add type definition** in `backend/src/types/visualization.types.ts`
2. **Update query executor** in `backend/src/services/query-executor.service.ts`
3. **Create visualization component** in `frontend/src/components/visualizations/`
4. **Register in VisualizationCanvas** component

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests (if implemented)
cd frontend
npm test
```

## 🔒 Security Considerations

- SQL execution is sandboxed to pre-defined databases
- No destructive operations beyond exercise scope
- Input validation on all API endpoints
- No user authentication in basic version (localStorage only)

## 🛠️ Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 3001 is available
- Verify Node.js version (18+)
- Delete `node_modules` and reinstall

**Frontend build errors:**
- Clear Next.js cache: `rm -rf frontend/.next`
- Reinstall dependencies

**Database errors:**
- Delete `backend/data/visualsql.db` to reset
- Database will be recreated on next start

**Visualization not showing:**
- Check browser console for errors
- Verify API_URL in frontend config
- Ensure backend is running

## 📝 API Documentation

### Endpoints

**Query Execution:**
```
POST /api/query/execute
Body: { query: string, schema: string }
Returns: { steps: [], finalResult: {}, executionTime: number }
```

**Get Modules:**
```
GET /api/modules
Returns: Module[]

GET /api/modules/:moduleId
Returns: Module
```

**Get Exercises:**
```
GET /api/exercises?moduleId=xxx
Returns: Exercise[]

POST /api/exercises/:exerciseId/submit
Body: { answer: string }
Returns: { isCorrect: boolean, feedback: string }
```

**Get Schemas:**
```
GET /api/schemas
Returns: Schema[]

GET /api/schemas/:schemaId
Returns: SchemaDetail
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📜 License

MIT License - feel free to use this project for educational purposes.

## 🙏 Acknowledgments

- Inspired by [VisuAlgo](https://visualgo.net/) for algorithm visualization
- Built with modern web technologies
- Designed for learners and educators

## 📧 Contact

For questions, issues, or suggestions, please open an issue on GitHub.

---

**Happy Learning! 🎓**

Start your SQL journey today with VisualSQL - where every query tells a visual story.
