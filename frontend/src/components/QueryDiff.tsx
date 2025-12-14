import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const SQLEditor = dynamic(() => import('./SQLEditor'), { ssr: false });

interface QueryDiffProps {
  isOpen: boolean;
  onClose: () => void;
  leftQuery?: string;
  rightQuery?: string;
  leftLabel?: string;
  rightLabel?: string;
}

interface DiffLine {
  type: 'equal' | 'insert' | 'delete' | 'replace';
  leftLine?: string;
  rightLine?: string;
  leftLineNumber?: number;
  rightLineNumber?: number;
}

export default function QueryDiff({
  isOpen,
  onClose,
  leftQuery = '',
  rightQuery = '',
  leftLabel = 'Your Query',
  rightLabel = 'Solution',
}: QueryDiffProps) {
  const [leftCode, setLeftCode] = useState(leftQuery);
  const [rightCode, setRightCode] = useState(rightQuery);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [leftResult, setLeftResult] = useState<any>(null);
  const [rightResult, setRightResult] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    setLeftCode(leftQuery);
    setRightCode(rightQuery);
  }, [leftQuery, rightQuery]);

  useEffect(() => {
    if (leftCode && rightCode) {
      calculateDiff();
    }
  }, [leftCode, rightCode]);

  const calculateDiff = () => {
    const leftLines = leftCode.split('\n');
    const rightLines = rightCode.split('\n');
    const diffResult: DiffLine[] = [];

    // Simple line-by-line diff
    const maxLines = Math.max(leftLines.length, rightLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const leftLine = leftLines[i];
      const rightLine = rightLines[i];

      if (leftLine === undefined) {
        diffResult.push({
          type: 'insert',
          rightLine,
          rightLineNumber: i + 1,
        });
      } else if (rightLine === undefined) {
        diffResult.push({
          type: 'delete',
          leftLine,
          leftLineNumber: i + 1,
        });
      } else if (leftLine === rightLine) {
        diffResult.push({
          type: 'equal',
          leftLine,
          rightLine,
          leftLineNumber: i + 1,
          rightLineNumber: i + 1,
        });
      } else {
        diffResult.push({
          type: 'replace',
          leftLine,
          rightLine,
          leftLineNumber: i + 1,
          rightLineNumber: i + 1,
        });
      }
    }

    setDiff(diffResult);
  };

  const compareResults = async () => {
    setComparing(true);
    // Placeholder for result comparison - would need actual query execution
    setTimeout(() => {
      setLeftResult({ rows: 10, columns: 5, executionTime: 23 });
      setRightResult({ rows: 10, columns: 5, executionTime: 18 });
      setComparing(false);
    }, 1000);
  };

  const getLineColor = (type: string, side: 'left' | 'right') => {
    if (type === 'equal') return '';
    if (type === 'delete' && side === 'left') return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
    if (type === 'insert' && side === 'right') return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    if (type === 'replace') {
      return side === 'left' 
        ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' 
        : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
    }
    return '';
  };

  const getDiffStats = () => {
    const additions = diff.filter(d => d.type === 'insert' || d.type === 'replace').length;
    const deletions = diff.filter(d => d.type === 'delete' || d.type === 'replace').length;
    const unchanged = diff.filter(d => d.type === 'equal').length;
    return { additions, deletions, unchanged };
  };

  if (!isOpen) return null;

  const stats = getDiffStats();

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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <div>
                <h2 className="text-2xl font-bold">Query Comparison</h2>
                <p className="text-blue-100 text-sm">Compare SQL queries side-by-side</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm">{stats.additions} additions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm">{stats.deletions} deletions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-sm">{stats.unchanged} unchanged</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-4 py-2 rounded transition-colors ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Unified View
            </button>
          </div>

          <button
            onClick={compareResults}
            disabled={comparing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {comparing ? 'Comparing...' : 'Compare Results'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'split' ? (
            /* Split View */
            <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 h-full">
              {/* Left Side */}
              <div className="bg-white dark:bg-gray-800 flex flex-col">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{leftLabel}</h3>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="p-4 font-mono text-sm">
                    {diff.map((line, idx) => (
                      line.leftLine !== undefined && (
                        <div
                          key={idx}
                          className={`flex ${getLineColor(line.type, 'left')} px-2 py-1`}
                        >
                          <span className="text-gray-400 dark:text-gray-600 w-10 flex-shrink-0 text-right mr-4">
                            {line.leftLineNumber}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">{line.leftLine || ' '}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side */}
              <div className="bg-white dark:bg-gray-800 flex flex-col">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{rightLabel}</h3>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="p-4 font-mono text-sm">
                    {diff.map((line, idx) => (
                      line.rightLine !== undefined && (
                        <div
                          key={idx}
                          className={`flex ${getLineColor(line.type, 'right')} px-2 py-1`}
                        >
                          <span className="text-gray-400 dark:text-gray-600 w-10 flex-shrink-0 text-right mr-4">
                            {line.rightLineNumber}
                          </span>
                          <span className="text-gray-900 dark:text-gray-100">{line.rightLine || ' '}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Unified View */
            <div className="bg-white dark:bg-gray-800 p-4">
              <div className="font-mono text-sm space-y-1">
                {diff.map((line, idx) => (
                  <div key={idx}>
                    {line.type === 'delete' && (
                      <div className="flex bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 px-2 py-1">
                        <span className="text-red-600 dark:text-red-400 w-10 flex-shrink-0">-</span>
                        <span className="text-gray-900 dark:text-gray-100">{line.leftLine}</span>
                      </div>
                    )}
                    {line.type === 'insert' && (
                      <div className="flex bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 px-2 py-1">
                        <span className="text-green-600 dark:text-green-400 w-10 flex-shrink-0">+</span>
                        <span className="text-gray-900 dark:text-gray-100">{line.rightLine}</span>
                      </div>
                    )}
                    {line.type === 'replace' && (
                      <>
                        <div className="flex bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 px-2 py-1">
                          <span className="text-red-600 dark:text-red-400 w-10 flex-shrink-0">-</span>
                          <span className="text-gray-900 dark:text-gray-100">{line.leftLine}</span>
                        </div>
                        <div className="flex bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 px-2 py-1">
                          <span className="text-green-600 dark:text-green-400 w-10 flex-shrink-0">+</span>
                          <span className="text-gray-900 dark:text-gray-100">{line.rightLine}</span>
                        </div>
                      </>
                    )}
                    {line.type === 'equal' && (
                      <div className="flex px-2 py-1">
                        <span className="text-gray-400 dark:text-gray-600 w-10 flex-shrink-0"> </span>
                        <span className="text-gray-600 dark:text-gray-400">{line.leftLine}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Result Comparison */}
        {(leftResult || rightResult) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 flex-shrink-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Query Results Comparison</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{leftLabel}</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Rows: {leftResult?.rows}</div>
                  <div>Columns: {leftResult?.columns}</div>
                  <div>Execution Time: {leftResult?.executionTime}ms</div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{rightLabel}</h4>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div>Rows: {rightResult?.rows}</div>
                  <div>Columns: {rightResult?.columns}</div>
                  <div>Execution Time: {rightResult?.executionTime}ms</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
