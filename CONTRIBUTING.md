# VisualSQL Development Guide

## Adding New Features

### Adding a New SQL Topic Module

1. **Create the module definition** in `backend/src/data/modules.ts`:

```typescript
{
  id: 'window-functions',
  title: 'Window Functions',
  category: 'advanced',
  difficulty: 'advanced',
  order: 20,
  description: 'Learn window functions like ROW_NUMBER, RANK, and LEAD/LAG',
  content: `# Window Functions

## What are Window Functions?

Window functions perform calculations across rows...

[Full markdown content]
  `,
  sampleQueries: [
    {
      title: 'Row Number',
      query: 'SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as rank FROM employees',
      description: 'Assign row numbers',
    },
  ],
  recommendedSchema: 'employees',
}
```

2. **Add to the modules array** (maintain order)
3. **Restart backend** to see changes

### Adding Exercises

Create in `backend/src/data/exercises.ts`:

```typescript
{
  id: 'ex-window-01',
  moduleId: 'window-functions',
  type: 'write-query',
  title: 'Rank by Salary',
  description: 'Use ROW_NUMBER to rank employees',
  difficulty: 'hard',
  schema: 'employees',
  question: 'Write a query to rank employees by salary (highest first)',
  answer: 'SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) as rank FROM employees',
  hints: [
    'Use ROW_NUMBER() window function',
    'Order by salary descending',
  ],
}
```

### Adding New Visualizations

1. **Define the step type** in `backend/src/types/visualization.types.ts`:

```typescript
export interface WindowFunctionStep {
  type: 'windowFunction';
  table: TableData;
  windowSpec: {
    partitionBy?: string[];
    orderBy?: Array<{ column: string; direction: 'ASC' | 'DESC' }>;
    function: string;
  };
  partitions: Array<{
    key: Record<string, any>;
    rowIds: number[];
  }>;
  resultTable: TableData;
  description: string;
}
```

2. **Add to VisualizationStep union type**

3. **Implement step generation** in `backend/src/services/query-executor.service.ts`:

```typescript
private async createWindowFunctionStep(table: TableData, windowSpec: any): Promise<WindowFunctionStep> {
  // Implementation
}
```

4. **Create visualization component** in `frontend/src/components/visualizations/WindowFunctionVisualization.tsx`

5. **Register in VisualizationCanvas.tsx**:

```typescript
{step.type === 'windowFunction' && (
  <WindowFunctionVisualization step={step} />
)}
```

### Adding Database Schemas

1. **Add schema creation function** in `backend/src/database/init.ts`:

```typescript
function createProjectsSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE projects (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      budget REAL NOT NULL
    );
  `);
  
  const insert = db.prepare('INSERT INTO projects VALUES (?, ?, ?, ?)');
  // Insert sample data
}
```

2. **Call in initDatabase()**:
```typescript
createProjectsSchema(database);
```

3. **Register in schema routes** (`backend/src/routes/schema.routes.ts`):

```typescript
case 'projects':
  tables = ['projects'];
  break;
```

## Code Organization

### Backend Structure

```
backend/src/
├── index.ts                    # Express app setup
├── database/
│   └── init.ts                # Schema creation & seeding
├── services/
│   └── query-executor.service.ts  # Query parsing & visualization
├── routes/
│   ├── query.routes.ts        # Query execution endpoints
│   ├── module.routes.ts       # Module content endpoints
│   ├── exercise.routes.ts     # Exercise & grading endpoints
│   └── schema.routes.ts       # Schema metadata endpoints
├── data/
│   ├── modules.ts             # Module definitions
│   └── exercises.ts           # Exercise definitions
└── types/
    └── visualization.types.ts # TypeScript interfaces
```

### Frontend Structure

```
frontend/src/
├── pages/
│   ├── index.tsx              # Home page
│   ├── modules/
│   │   ├── index.tsx         # Module list
│   │   └── [moduleId].tsx    # Individual module view
│   └── practice.tsx          # Practice exercises
├── components/
│   ├── SQLEditor.tsx         # Monaco editor wrapper
│   ├── VisualizationCanvas.tsx  # Main visualization router
│   └── visualizations/       # Individual visualization types
│       ├── TableView.tsx
│       ├── JoinVisualization.tsx
│       ├── FilterVisualization.tsx
│       └── GroupByVisualization.tsx
└── styles/
    └── globals.css           # Tailwind & custom styles
```

## Testing

### Backend Testing

```typescript
// backend/src/services/query-executor.service.test.ts
import { QueryExecutor } from './query-executor.service';

describe('QueryExecutor', () => {
  it('should parse SELECT query', async () => {
    const executor = new QueryExecutor();
    const result = await executor.execute('SELECT * FROM employees', 'employees');
    expect(result.steps.length).toBeGreaterThan(0);
  });
});
```

Run tests:
```bash
cd backend
npm test
```

### Frontend Testing

Use React Testing Library:

```typescript
// frontend/src/components/TableView.test.tsx
import { render } from '@testing-library/react';
import TableView from './TableView';

test('renders table with data', () => {
  const table = {
    name: 'test',
    rows: [{ id: 1, name: 'Alice' }],
  };
  const { getByText } = render(<TableView table={table} />);
  expect(getByText('Alice')).toBeInTheDocument();
});
```

## Performance Optimization

### Backend
- Use prepared statements for repeated queries
- Limit result set sizes for large tables
- Cache module/exercise data in memory

### Frontend
- Lazy load Monaco Editor (already done with dynamic import)
- Memoize visualization components
- Debounce query execution input
- Use virtual scrolling for large result tables

## Deployment

### Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000 3001
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t visualsql .
docker run -p 3000:3000 -p 3001:3001 visualsql
```

### Traditional Hosting

1. Build both frontend and backend:
```bash
npm run build
```

2. Set production environment variables
3. Start with process manager (PM2):
```bash
pm2 start npm --name "visualsql-backend" -- run start:backend
pm2 start npm --name "visualsql-frontend" -- run start:frontend
```

## Best Practices

### Module Content
- Keep lessons concise (aim for 5-10 minute read)
- Use code examples liberally
- Include common pitfalls section
- Provide 3-5 sample queries per module

### Exercises
- Start easy, increase difficulty gradually
- Provide helpful hints
- Cover edge cases in advanced exercises
- Include both conceptual and practical questions

### Visualizations
- Use consistent color coding
- Add clear labels and descriptions
- Animate transitions smoothly
- Handle edge cases (empty results, NULLs)

### Code Quality
- Use TypeScript strictly
- Comment complex algorithms
- Keep functions small and focused
- Follow consistent naming conventions

## Common Issues & Solutions

### Query Parser Limitations
Current implementation uses regex-based parsing. For complex queries:
- Consider using a proper SQL parser library
- Or add special handling for specific patterns

### Visualization Performance
For large result sets:
- Implement pagination in visualization
- Add option to limit displayed rows
- Use virtual scrolling

### Cross-browser Compatibility
- Test on Chrome, Firefox, Safari, Edge
- Monaco Editor may have issues on older browsers
- Provide fallback text editor if needed

## Contributing Guidelines

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** with clear commit messages
4. **Add tests** if applicable
5. **Update documentation**
6. **Submit pull request** with description

## Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## Support

For questions or issues:
- Open a GitHub issue
- Check existing documentation
- Review sample code in the repository

Happy developing! 🚀
