export interface TableRow {
  [key: string]: any;
}

export interface TableData {
  name: string;
  rows: TableRow[];
  highlightRows?: number[];
  dimRows?: number[];
  highlightColumns?: string[];
}

export interface ScanStep {
  type: 'scan';
  tables: TableData[];
  description: string;
}

export interface JoinStep {
  type: 'join';
  leftTable: TableData;
  rightTable: TableData;
  joinType: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL' | 'CROSS';
  condition: string;
  matchedPairs: Array<[number, number]>;
  unmatchedLeft: number[];
  unmatchedRight: number[];
  resultTable: TableData;
  description: string;
}

export interface FilterStep {
  type: 'filter';
  table: TableData;
  condition: string;
  keptRows: number[];
  filteredOutRows: number[];
  resultTable: TableData;
  description: string;
}

export interface GroupByStep {
  type: 'groupBy';
  table: TableData;
  groupKeys: string[];
  groups: Array<{
    key: Record<string, any>;
    rowIds: number[];
    aggregates: Record<string, any>;
  }>;
  resultTable: TableData;
  description: string;
}

export interface HavingStep {
  type: 'having';
  table: TableData;
  condition: string;
  keptGroups: number[];
  filteredOutGroups: number[];
  resultTable: TableData;
  description: string;
}

export interface ProjectStep {
  type: 'project';
  table: TableData;
  selectedColumns: string[];
  resultTable: TableData;
  description: string;
}

export interface OrderByStep {
  type: 'orderBy';
  table: TableData;
  orderBy: Array<{ column: string; direction: 'ASC' | 'DESC' }>;
  resultTable: TableData;
  description: string;
}

export interface LimitStep {
  type: 'limit';
  table: TableData;
  limit: number;
  offset?: number;
  resultTable: TableData;
  description: string;
}

export interface SetOperationStep {
  type: 'setOperation';
  operation: 'UNION' | 'UNION ALL' | 'INTERSECT' | 'EXCEPT';
  leftTable: TableData;
  rightTable: TableData;
  resultTable: TableData;
  uniqueLeft: number[];
  uniqueRight: number[];
  common: Array<[number, number]>;
  description: string;
}

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

export type VisualizationStep =
  | ScanStep
  | JoinStep
  | FilterStep
  | GroupByStep
  | HavingStep
  | ProjectStep
  | OrderByStep
  | LimitStep
  | SetOperationStep
  | WindowFunctionStep;

export interface QueryExecutionResult {
  steps: VisualizationStep[];
  finalResult: TableData;
  error?: string;
  executionTime: number;
}

export interface SchemaInfo {
  name: string;
  tables: Array<{
    name: string;
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      primaryKey: boolean;
      foreignKey?: {
        table: string;
        column: string;
      };
    }>;
    rowCount: number;
  }>;
  description: string;
}
