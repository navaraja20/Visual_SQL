import { motion } from 'framer-motion';

interface TableViewProps {
  table: {
    name: string;
    rows: Array<Record<string, any>>;
    highlightRows?: number[];
    dimRows?: number[];
    highlightColumns?: string[];
  };
}

export default function TableView({ table }: TableViewProps) {
  if (!table.rows || table.rows.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 border border-gray-300 rounded">
        No data
      </div>
    );
  }

  const columns = Object.keys(table.rows[0]);

  const isRowHighlighted = (rowIdx: number) => table.highlightRows?.includes(rowIdx);
  const isRowDimmed = (rowIdx: number) => table.dimRows?.includes(rowIdx);
  const isColumnHighlighted = (col: string) => table.highlightColumns?.includes(col);

  // Calculate statistics for numeric columns
  const getColumnStats = (col: string) => {
    const values = table.rows
      .map(row => row[col])
      .filter(val => val !== null && !isNaN(Number(val)))
      .map(Number);

    if (values.length === 0) return null;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
    };
  };

  const columnStats = columns.map(col => ({
    column: col,
    stats: getColumnStats(col),
  }));

  const hasNumericColumns = columnStats.some(cs => cs.stats !== null);

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col, idx) => (
                <th
                key={idx}
                className={`px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                  isColumnHighlighted(col) ? 'bg-blue-100 dark:bg-blue-900/40' : ''
                }`}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {table.rows.map((row, rowIdx) => (
            <motion.tr
              key={rowIdx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                delay: rowIdx * 0.05, 
                duration: 0.3,
                type: 'spring',
                stiffness: 100
              }}
              whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
              className={`${
                isRowHighlighted(rowIdx) ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-700 shadow-md' :
                isRowDimmed(rowIdx) ? 'bg-red-50 dark:bg-red-900/10 opacity-60 line-through' :
                'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
              }`}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-4 py-2 text-sm text-gray-900 dark:text-gray-100 ${
                    isColumnHighlighted(col) ? 'bg-blue-50 dark:bg-blue-900/30 font-medium' : ''
                  }`}
                >
                  {row[col] === null ? (
                    <span className="text-gray-400 dark:text-gray-500 italic">NULL</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Column Statistics */}
    {hasNumericColumns && (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Column Statistics
        </h5>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {columnStats.filter(cs => cs.stats).map((cs, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded p-2 text-xs">
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate" title={cs.column}>
                {cs.column}
              </div>
              <div className="space-y-0.5 text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Min:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{cs.stats!.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">{cs.stats!.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">{cs.stats!.avg.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    </div>
  );
}
