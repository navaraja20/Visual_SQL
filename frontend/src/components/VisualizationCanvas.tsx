import { motion, AnimatePresence } from 'framer-motion';
import TableView from './visualizations/TableView';
import JoinVisualization from './visualizations/JoinVisualization';
import FilterVisualization from './visualizations/FilterVisualization';
import GroupByVisualization from './visualizations/GroupByVisualization';

interface VisualizationCanvasProps {
  step: any;
  stepIndex: number;
}

const operationIcons: Record<string, JSX.Element> = {
  scan: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  ),
  filter: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  join: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  groupBy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  having: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  project: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  orderBy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  limit: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

const operationColors: Record<string, string> = {
  scan: 'from-blue-500 to-cyan-500',
  filter: 'from-orange-500 to-red-500',
  join: 'from-purple-500 to-pink-500',
  groupBy: 'from-green-500 to-emerald-500',
  having: 'from-yellow-500 to-orange-500',
  project: 'from-indigo-500 to-blue-500',
  orderBy: 'from-violet-500 to-purple-500',
  limit: 'from-gray-500 to-slate-500',
};

export default function VisualizationCanvas({ step, stepIndex }: VisualizationCanvasProps) {
  if (!step) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block"
        >
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 shadow-lg">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Execute a query to see visualization</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Step-by-step animation will appear here</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const operationType = step.type || 'scan';
  const gradientColor = operationColors[operationType] || 'from-gray-500 to-slate-500';
  const icon = operationIcons[operationType] || operationIcons.scan;

  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4"
    >
      {/* Step Header with Operation Badge */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <div className={`bg-gradient-to-r ${gradientColor} p-1 rounded-lg shadow-lg`}>
          <div className="bg-white dark:bg-gray-800 rounded-md p-4">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`bg-gradient-to-r ${gradientColor} text-white p-3 rounded-lg shadow-md`}
              >
                {icon}
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Step {stepIndex + 1}
                  </span>
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: 'auto' }}
                    transition={{ delay: 0.3 }}
                    className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${gradientColor} text-white`}
                  >
                    {operationType.toUpperCase()}
                  </motion.span>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {step.description}
                </motion.p>
              </div>
              {/* Animated Arrow */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="text-gray-400 dark:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Render appropriate visualization based on step type */}
      <AnimatePresence mode="wait">
        {step.type === 'scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {step.tables.map((table: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                    Table: <span className="font-mono">{table.name}</span>
                  </h4>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1, type: 'spring' }}
                    className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold"
                  >
                    {table.rows?.length || 0} rows
                  </motion.span>
                </div>
                <TableView table={table} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {step.type === 'join' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <JoinVisualization step={step} />
          </motion.div>
        )}

        {step.type === 'filter' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <FilterVisualization step={step} />
          </motion.div>
        )}

        {step.type === 'groupBy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <GroupByVisualization step={step} />
          </motion.div>
        )}

        {step.type === 'having' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
          >
            <FilterVisualization step={step} />
          </motion.div>
        )}

        {step.type === 'project' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">Projection Result</h4>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="ml-auto text-xs bg-indigo-600 text-white px-2 py-1 rounded-full font-semibold"
              >
                {step.resultTable?.rows?.length || 0} rows
              </motion.span>
            </div>
            <TableView table={step.resultTable} />
          </motion.div>
        )}

        {step.type === 'orderBy' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 rounded-lg p-4 border-2 border-violet-200 dark:border-violet-800 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <h4 className="text-sm font-bold text-violet-900 dark:text-violet-200">Sorted Result</h4>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="ml-auto text-xs bg-violet-600 text-white px-2 py-1 rounded-full font-semibold"
              >
                {step.resultTable?.rows?.length || 0} rows
              </motion.span>
            </div>
            <TableView table={step.resultTable} />
          </motion.div>
        )}

        {step.type === 'limit' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-lg p-4 border-2 border-gray-300 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <h4 className="text-sm font-bold text-gray-900 dark:text-gray-200">Limited Result</h4>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="ml-auto text-xs bg-gray-600 text-white px-2 py-1 rounded-full font-semibold"
              >
                {step.resultTable?.rows?.length || 0} rows
              </motion.span>
            </div>
            <TableView table={step.resultTable} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Result with Animation */}
      {step.resultTable && !['project', 'orderBy', 'limit'].includes(step.type) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 pt-6 border-t-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-lg p-4 border-2 border-green-200 dark:border-green-800 shadow-lg"
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <h4 className="text-sm font-bold text-green-900 dark:text-green-200">Result Table</h4>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full font-semibold"
              >
                {step.resultTable?.rows?.length || 0} rows
              </motion.span>
            </div>
            <TableView table={step.resultTable} />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
