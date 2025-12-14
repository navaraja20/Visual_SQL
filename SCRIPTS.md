# Available NPM Scripts

## Root Directory (VisualSQL/)

### Development
```bash
npm run dev
```
Starts both frontend and backend in development mode with hot reload.
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

```bash
npm run dev:frontend
```
Starts only the frontend development server.

```bash
npm run dev:backend
```
Starts only the backend development server.

### Build
```bash
npm run build
```
Builds both frontend and backend for production.

```bash
npm run build:frontend
```
Creates production build of frontend (outputs to `frontend/.next/`).

```bash
npm run build:backend
```
Compiles TypeScript backend to JavaScript (outputs to `backend/dist/`).

### Production
```bash
npm start
```
Runs both frontend and backend in production mode (requires build first).

```bash
npm run start:frontend
```
Starts production frontend server.

```bash
npm run start:backend
```
Starts production backend server.

---

## Frontend Directory (frontend/)

```bash
cd frontend
npm run dev
```
Next.js development server with hot reload.

```bash
npm run build
```
Create optimized production build.

```bash
npm run start
```
Start production server (after build).

```bash
npm run lint
```
Run ESLint to check code quality.

---

## Backend Directory (backend/)

```bash
cd backend
npm run dev
```
Start development server with auto-restart (using tsx watch).

```bash
npm run build
```
Compile TypeScript to JavaScript.

```bash
npm start
```
Run compiled JavaScript (production).

```bash
npm test
```
Run Jest tests (if configured).

---

## Quick Commands Cheatsheet

| Task | Command |
|------|---------|
| First time setup | `npm install` |
| Start everything | `npm run dev` |
| Build for production | `npm run build` |
| Run production | `npm start` |
| Frontend only (dev) | `npm run dev:frontend` |
| Backend only (dev) | `npm run dev:backend` |
| Clean node_modules | `rm -rf node_modules frontend/node_modules backend/node_modules` |
| Reinstall | `npm install` |
| Reset database | Delete `backend/data/visualsql.db` then restart backend |

---

## Environment Variables

### Backend (.env file in backend/)
```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/visualsql.db
```

### Frontend (built into next.config.js)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Troubleshooting Commands

### Port already in use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

### Clean install
```bash
rm -rf node_modules frontend/node_modules backend/node_modules
rm -rf frontend/.next backend/dist
npm install
```

### Reset database
```bash
rm backend/data/visualsql.db
npm run dev:backend
# Database will be recreated automatically
```

### Check if backend is running
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### View backend logs
Backend logs appear in terminal when running `npm run dev:backend`

### TypeScript errors
```bash
cd frontend
npx tsc --noEmit  # Check for type errors without building

cd ../backend
npx tsc --noEmit
```

---

## Development Workflow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Make changes** to code
   - Frontend changes hot-reload automatically
   - Backend restarts automatically (tsx watch)

3. **Test changes** in browser (http://localhost:3000)

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Test production build:**
   ```bash
   npm start
   ```

---

## Common Issues

### "Cannot find module"
```bash
npm install
```

### "Port 3001 is already in use"
- Stop other Node processes
- Or change PORT in backend/.env

### "Module not found: @/components/..."
- Check tsconfig.json paths configuration
- Restart development server

### Database errors
- Delete database file and restart: `rm backend/data/visualsql.db`

### Monaco Editor not loading
- Check browser console for errors
- Ensure you're accessing from http://localhost:3000 (not file://)

---

## Tips

- **Always run from root directory** for monorepo commands
- **Use `npm run dev`** for local development (easiest)
- **Run tests** before committing changes
- **Check TypeScript errors** with `tsc --noEmit`
- **Monitor logs** in terminal for debugging

---

For more detailed information, see:
- README.md - Full documentation
- QUICKSTART.md - Getting started guide
- CONTRIBUTING.md - Development guide
