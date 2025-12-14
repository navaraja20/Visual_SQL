import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ERDiagram = dynamic(() => import('./ERDiagram'), { ssr: false });

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

interface Table {
  name: string;
  columns: Column[];
  rowCount: number;
}

interface SchemaExplorerProps {
  schema: string;
  onInsertTable?: (tableName: string) => void;
}

export default function SchemaExplorer({ schema, onInsertTable }: SchemaExplorerProps) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [sampleData, setSampleData] = useState<Record<string, any[]>>({});
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'diagram'>('list');

  useEffect(() => {
    fetchSchema();
  }, [schema]);

  const fetchSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/schema/${schema}`);
      const data = await response.json();
      setTables(data.tables || []);
    } catch (error) {
      console.error('Error fetching schema:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSampleData = async (tableName: string) => {
    if (sampleData[tableName]) {
      return; // Already loaded
    }

    setLoadingSample(tableName);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/query/execute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `SELECT * FROM ${tableName} LIMIT 3`,
            schema,
          }),
        }
      );
      const data = await response.json();
      setSampleData(prev => ({
        ...prev,
        [tableName]: data.finalResult?.rows || [],
      }));
    } catch (error) {
      console.error('Error fetching sample data:', error);
    } finally {
      setLoadingSample(null);
    }
  };

  const toggleTable = (tableName: string) => {
    if (expandedTable === tableName) {
      setExpandedTable(null);
    } else {
      setExpandedTable(tableName);
      fetchSampleData(tableName);
    }
  };

  const getTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('int')) return 'text-blue-600 dark:text-blue-400';
    if (lowerType.includes('text') || lowerType.includes('varchar') || lowerType.includes('char')) 
      return 'text-green-600 dark:text-green-400';
    if (lowerType.includes('real') || lowerType.includes('float') || lowerType.includes('numeric')) 
      return 'text-purple-600 dark:text-purple-400';
    if (lowerType.includes('date') || lowerType.includes('time')) 
      return 'text-orange-600 dark:text-orange-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Database Schema: {schema}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {tables.length} {tables.length === 1 ? 'table' : 'tables'}
          </span>
          
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('diagram')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                viewMode === 'diagram'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="ER Diagram"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ER Diagram View */}
      {viewMode === 'diagram' ? (
        <div className="h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <ERDiagram schema={schema} />
        </div>
      ) : (
        /* List View */
        <>
          {tables.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No tables found in this schema
            </p>
          ) : (
        tables.map((table) => (
          <div
            key={table.name}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            {/* Table Header */}
            <button
              onClick={() => toggleTable(table.name)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedTable === table.name ? 'transform rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{table.name}</span>
                </div>
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {table.columns.length} columns
                </span>
              </div>
              {onInsertTable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onInsertTable(table.name);
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                  title="Insert table name"
                >
                  Insert
                </button>
              )}
            </button>

            {/* Table Details */}
            {expandedTable === table.name && (
              <div className="border-t border-gray-200 dark:border-gray-700">
                {/* Columns */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">COLUMNS</h4>
                  <div className="space-y-1">
                    {table.columns.map((column) => (
                      <div
                        key={column.name}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-gray-900 dark:text-gray-100">{column.name}</span>
                          {column.primaryKey && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded" title="Primary Key">
                              PK
                            </span>
                          )}
                          {column.foreignKey && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded" title={`Foreign Key → ${column.foreignKey.table}.${column.foreignKey.column}`}>
                              FK
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-mono ${getTypeColor(column.type)}`}>
                          {column.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Data */}
                <div className="px-4 py-3">
                  <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    SAMPLE DATA (3 rows)
                  </h4>
                  {loadingSample === table.name ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  ) : sampleData[table.name] && sampleData[table.name].length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            {Object.keys(sampleData[table.name][0]).map((key) => (
                              <th
                                key={key}
                                className="text-left py-1 px-2 font-semibold text-gray-700 dark:text-gray-300"
                              >
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sampleData[table.name].map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-800">
                              {Object.values(row).map((value: any, colIdx) => (
                                <td key={colIdx} className="py-1 px-2 text-gray-600 dark:text-gray-400">
                                  {value === null ? (
                                    <span className="text-gray-400 italic">NULL</span>
                                  ) : typeof value === 'object' ? (
                                    JSON.stringify(value)
                                  ) : (
                                    String(value)
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No data available</p>
                  )}
                </div>

                {/* Foreign Key Relationships */}
                {table.columns.some(c => c.foreignKey) && (
                  <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/10 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">
                      RELATIONSHIPS
                    </h4>
                    <div className="space-y-1">
                      {table.columns
                        .filter(c => c.foreignKey)
                        .map((column) => (
                          <div key={column.name} className="flex items-center text-xs text-gray-700 dark:text-gray-300">
                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            <span className="font-mono">{column.name}</span>
                            <span className="mx-2">→</span>
                            <span className="font-mono text-purple-700 dark:text-purple-400">
                              {column.foreignKey!.table}.{column.foreignKey!.column}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
        </>
      )}
    </div>
  );
}
