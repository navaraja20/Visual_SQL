import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Column {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: { table: string; column: string };
  nullable?: boolean;
}

interface Table {
  name: string;
  columns: Column[];
  position: { x: number; y: number };
}

interface Relationship {
  from: { table: string; column: string };
  to: { table: string; column: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

interface ERDiagramProps {
  schema: string;
}

const SCHEMA_DEFINITIONS: Record<string, { tables: Table[]; relationships: Relationship[] }> = {
  employees: {
    tables: [
      {
        name: 'employees',
        position: { x: 100, y: 50 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'position', type: 'VARCHAR(50)' },
          { name: 'salary', type: 'DECIMAL(10,2)' },
          { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: { table: 'departments', column: 'id' } },
          { name: 'hire_date', type: 'DATE' },
        ],
      },
      {
        name: 'departments',
        position: { x: 500, y: 50 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'budget', type: 'DECIMAL(12,2)' },
          { name: 'manager_id', type: 'INTEGER', isForeignKey: true, references: { table: 'employees', column: 'id' }, nullable: true },
        ],
      },
      {
        name: 'projects',
        position: { x: 300, y: 350 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'description', type: 'TEXT', nullable: true },
          { name: 'department_id', type: 'INTEGER', isForeignKey: true, references: { table: 'departments', column: 'id' } },
          { name: 'start_date', type: 'DATE' },
          { name: 'end_date', type: 'DATE', nullable: true },
          { name: 'budget', type: 'DECIMAL(10,2)' },
        ],
      },
      {
        name: 'employee_projects',
        position: { x: 100, y: 500 },
        columns: [
          { name: 'employee_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, references: { table: 'employees', column: 'id' } },
          { name: 'project_id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: true, references: { table: 'projects', column: 'id' } },
          { name: 'role', type: 'VARCHAR(50)' },
          { name: 'hours_allocated', type: 'INTEGER' },
        ],
      },
    ],
    relationships: [
      { from: { table: 'employees', column: 'department_id' }, to: { table: 'departments', column: 'id' }, type: 'many-to-many' },
      { from: { table: 'departments', column: 'manager_id' }, to: { table: 'employees', column: 'id' }, type: 'one-to-one' },
      { from: { table: 'projects', column: 'department_id' }, to: { table: 'departments', column: 'id' }, type: 'one-to-many' },
      { from: { table: 'employee_projects', column: 'employee_id' }, to: { table: 'employees', column: 'id' }, type: 'many-to-many' },
      { from: { table: 'employee_projects', column: 'project_id' }, to: { table: 'projects', column: 'id' }, type: 'many-to-many' },
    ],
  },
  customers: {
    tables: [
      {
        name: 'customers',
        position: { x: 100, y: 50 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'phone', type: 'VARCHAR(20)', nullable: true },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
      },
      {
        name: 'orders',
        position: { x: 450, y: 50 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'customer_id', type: 'INTEGER', isForeignKey: true, references: { table: 'customers', column: 'id' } },
          { name: 'order_date', type: 'DATE' },
          { name: 'total_amount', type: 'DECIMAL(10,2)' },
          { name: 'status', type: 'VARCHAR(20)' },
        ],
      },
      {
        name: 'products',
        position: { x: 100, y: 350 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'description', type: 'TEXT', nullable: true },
          { name: 'price', type: 'DECIMAL(10,2)' },
          { name: 'stock', type: 'INTEGER' },
        ],
      },
      {
        name: 'order_items',
        position: { x: 450, y: 350 },
        columns: [
          { name: 'id', type: 'INTEGER', isPrimaryKey: true },
          { name: 'order_id', type: 'INTEGER', isForeignKey: true, references: { table: 'orders', column: 'id' } },
          { name: 'product_id', type: 'INTEGER', isForeignKey: true, references: { table: 'products', column: 'id' } },
          { name: 'quantity', type: 'INTEGER' },
          { name: 'unit_price', type: 'DECIMAL(10,2)' },
        ],
      },
    ],
    relationships: [
      { from: { table: 'orders', column: 'customer_id' }, to: { table: 'customers', column: 'id' }, type: 'one-to-many' },
      { from: { table: 'order_items', column: 'order_id' }, to: { table: 'orders', column: 'id' }, type: 'one-to-many' },
      { from: { table: 'order_items', column: 'product_id' }, to: { table: 'products', column: 'id' }, type: 'many-to-many' },
    ],
  },
};

export default function ERDiagram({ schema }: ERDiagramProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const schemaData = SCHEMA_DEFINITIONS[schema] || SCHEMA_DEFINITIONS.employees;

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.5), 2));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).closest('.er-background')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getRelationshipPath = (from: Table, to: Table, fromColumn: string, toColumn: string) => {
    const fromY = from.position.y + 30 + from.columns.findIndex(c => c.name === fromColumn) * 24 + 12;
    const toY = to.position.y + 30 + to.columns.findIndex(c => c.name === toColumn) * 24 + 12;
    
    const fromX = from.position.x + 300;
    const toX = to.position.x;
    
    const midX = (fromX + toX) / 2;
    
    return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
  };

  const getRelationshipSymbol = (type: string) => {
    switch (type) {
      case 'one-to-one': return '1:1';
      case 'one-to-many': return '1:N';
      case 'many-to-many': return 'N:M';
      default: return '';
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex flex-col gap-1">
          <button
            onClick={() => setZoom(prev => Math.min(prev * 1.2, 2))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(prev * 0.8, 0.5))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Reset View"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-3 text-sm">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16">
              <rect width="16" height="16" fill="#3b82f6" rx="2" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">Primary Key</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16">
              <rect width="16" height="16" fill="#10b981" rx="2" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">Foreign Key</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16">
              <line x1="0" y1="8" x2="16" y2="8" stroke="#8b5cf6" strokeWidth="2" />
            </svg>
            <span className="text-gray-700 dark:text-gray-300">Relationship</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move er-background"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#d1d5db" opacity="0.3" />
          </pattern>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
          </marker>
        </defs>
        
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid Background */}
          <rect x="-1000" y="-1000" width="3000" height="3000" fill="url(#grid)" />
          
          {/* Relationships */}
          <g className="relationships">
            {schemaData.relationships.map((rel, idx) => {
              const fromTable = schemaData.tables.find(t => t.name === rel.from.table);
              const toTable = schemaData.tables.find(t => t.name === rel.to.table);
              
              if (!fromTable || !toTable) return null;
              
              const path = getRelationshipPath(fromTable, toTable, rel.from.column, rel.to.column);
              const midX = (fromTable.position.x + 300 + toTable.position.x) / 2;
              const midY = (fromTable.position.y + toTable.position.y) / 2;
              
              return (
                <g key={idx}>
                  <path
                    d={path}
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    opacity="0.6"
                  />
                  <text
                    x={midX}
                    y={midY}
                    fontSize="10"
                    fill="#8b5cf6"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {getRelationshipSymbol(rel.type)}
                  </text>
                </g>
              );
            })}
          </g>
          
          {/* Tables */}
          {schemaData.tables.map((table, idx) => (
            <g
              key={table.name}
              transform={`translate(${table.position.x}, ${table.position.y})`}
              onClick={() => setSelectedTable(table.name === selectedTable ? null : table.name)}
              className="cursor-pointer"
            >
              <motion.g
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                {/* Table Container */}
                <rect
                  width="300"
                  height={table.columns.length * 24 + 30}
                  fill="white"
                  stroke={selectedTable === table.name ? '#3b82f6' : '#d1d5db'}
                  strokeWidth={selectedTable === table.name ? 3 : 2}
                  rx="8"
                  className="dark:fill-gray-800 dark:stroke-gray-700"
                />
                
                {/* Table Header */}
                <rect
                  width="300"
                  height="30"
                  fill="#3b82f6"
                  rx="8"
                  className="dark:fill-blue-700"
                />
                <rect
                  y="8"
                  width="300"
                  height="22"
                  fill="#3b82f6"
                  className="dark:fill-blue-700"
                />
                
                <text
                  x="10"
                  y="20"
                  fontSize="14"
                  fontWeight="bold"
                  fill="white"
                  className="pointer-events-none"
                >
                  📊 {table.name}
                </text>
                
                {/* Columns */}
                {table.columns.map((column, colIdx) => {
                  const y = 30 + colIdx * 24;
                  const bgColor = column.isPrimaryKey ? '#dbeafe' : column.isForeignKey ? '#d1fae5' : colIdx % 2 === 0 ? '#f9fafb' : '#ffffff';
                  const darkBgColor = column.isPrimaryKey ? '#1e3a8a' : column.isForeignKey ? '#065f46' : colIdx % 2 === 0 ? '#1f2937' : '#111827';
                  
                  return (
                    <g key={column.name}>
                      <rect
                        y={y}
                        width="300"
                        height="24"
                        fill={bgColor}
                        className={`dark:fill-[${darkBgColor}]`}
                      />
                      
                      {/* Key Icon */}
                      {column.isPrimaryKey && (
                        <text x="8" y={y + 16} fontSize="12" className="pointer-events-none">🔑</text>
                      )}
                      {column.isForeignKey && !column.isPrimaryKey && (
                        <text x="8" y={y + 16} fontSize="12" className="pointer-events-none">🔗</text>
                      )}
                      
                      {/* Column Name */}
                      <text
                        x={column.isPrimaryKey || column.isForeignKey ? "28" : "10"}
                        y={y + 16}
                        fontSize="11"
                        fontWeight={column.isPrimaryKey ? "bold" : "normal"}
                        fill="#374151"
                        className="dark:fill-gray-300 pointer-events-none"
                      >
                        {column.name}
                      </text>
                      
                      {/* Data Type */}
                      <text
                        x="290"
                        y={y + 16}
                        fontSize="10"
                        fill="#6b7280"
                        textAnchor="end"
                        className="dark:fill-gray-500 pointer-events-none"
                      >
                        {column.type}
                      </text>
                      
                      {/* Nullable indicator */}
                      {column.nullable && (
                        <text
                          x="170"
                          y={y + 16}
                          fontSize="9"
                          fill="#9ca3af"
                          className="dark:fill-gray-600 pointer-events-none italic"
                        >
                          NULL
                        </text>
                      )}
                    </g>
                  );
                })}
              </motion.g>
            </g>
          ))}
        </g>
      </svg>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
        🖱️ Drag to pan • 🖱️ Scroll to zoom • 🖱️ Click tables to highlight
      </div>
    </div>
  );
}
