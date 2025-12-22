import { getDatabase } from '../database/init';
import {
  QueryExecutionResult,
  VisualizationStep,
  TableData,
  TableRow,
  ScanStep,
  JoinStep,
  FilterStep,
  GroupByStep,
  ProjectStep,
  OrderByStep,
  LimitStep,
} from '../types/visualization.types';

export class QueryExecutor {
  private getTableFromStep(step: VisualizationStep): TableData | undefined {
    if ('resultTable' in step && step.resultTable) {
      return step.resultTable;
    }
    if ('tables' in step && step.tables && step.tables.length > 0) {
      return step.tables[0];
    }
    return undefined;
  }
  
  async execute(query: string, schemaName: string = 'default'): Promise<QueryExecutionResult> {
    const startTime = Date.now();
    const steps: VisualizationStep[] = [];
    
    try {
      // Validate query is not empty
      if (!query || !query.trim()) {
        throw new Error('Query cannot be empty. Please enter a SQL statement.');
      }
      
      // Normalize and parse query
      const normalizedQuery = query.trim().replace(/;$/, '');
      const queryUpper = normalizedQuery.toUpperCase();
      
      // Validate SQL syntax basics
      this.validateQuerySyntax(normalizedQuery);
      
      // Determine query type and generate steps
      if (queryUpper.startsWith('SELECT')) {
        await this.executeSelectQuery(normalizedQuery, steps);
      } else if (queryUpper.startsWith('INSERT')) {
        await this.executeInsertQuery(normalizedQuery, steps);
      } else if (queryUpper.startsWith('UPDATE')) {
        await this.executeUpdateQuery(normalizedQuery, steps);
      } else if (queryUpper.startsWith('DELETE')) {
        await this.executeDeleteQuery(normalizedQuery, steps);
      } else {
        throw new Error('Unsupported query type. Only SELECT, INSERT, UPDATE, and DELETE are supported.');
      }
      
      const lastStep = steps[steps.length - 1];
      const finalResult = this.getTableFromStep(lastStep) || { name: 'result', rows: [] };
      
      return {
        steps,
        finalResult,
        executionTime: Date.now() - startTime,
      };
    } catch (error: any) {
      // Enhanced error messages
      let errorMessage = error.message || 'Unknown error occurred';
      
      // Parse SQLite error messages to make them user-friendly
      if (errorMessage.includes('no such table')) {
        const tableMatch = errorMessage.match(/no such table: (\w+)/);
        if (tableMatch) {
          errorMessage = `Table "${tableMatch[1]}" does not exist. Available tables: employees, departments, customers, orders, products, students, courses, enrollments, transactions.`;
        }
      } else if (errorMessage.includes('no such column')) {
        const colMatch = errorMessage.match(/no such column: (\w+)/);
        if (colMatch) {
          errorMessage = `Column "${colMatch[1]}" does not exist. Check your table schema or use the correct table alias.`;
        }
      } else if (errorMessage.includes('syntax error')) {
        errorMessage = `SQL syntax error: ${errorMessage}. Please check your query for typos or missing keywords.`;
      }
      
      return {
        steps,
        finalResult: { name: 'error', rows: [] },
        error: errorMessage,
        executionTime: Date.now() - startTime,
      };
    }
  }
  
  private validateQuerySyntax(query: string): void {
    const queryUpper = query.toUpperCase();
    
    // Check for common syntax errors
    if (queryUpper.startsWith('SELECT')) {
      if (!queryUpper.includes('FROM')) {
        throw new Error('SELECT query must include a FROM clause specifying the table.');
      }
      
      // Check for balanced parentheses
      const openParens = (query.match(/\(/g) || []).length;
      const closeParens = (query.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        throw new Error(`Unbalanced parentheses: ${openParens} opening, ${closeParens} closing. Check your query syntax.`);
      }
      
      // Check for common typos
      if (query.match(/\bSELCT\b/i)) {
        throw new Error('Did you mean SELECT? Check spelling.');
      }
      if (query.match(/\bFROM\s+WHERE\b/i)) {
        throw new Error('Missing table name between FROM and WHERE.');
      }
    }
  }
  
  private async executeSelectQuery(query: string, steps: VisualizationStep[]): Promise<void> {
    // Parse query components
    const queryAnalysis = this.analyzeSelectQuery(query);
    
    // Step 1: Table scan(s)
    if (queryAnalysis.fromTables.length > 0) {
      const scanStep = await this.createScanStep(queryAnalysis.fromTables);
      steps.push(scanStep);
    }
    
    // Step 2: Joins (if any)
    if (queryAnalysis.joins.length > 0) {
      let currentTable = this.getTableFromStep(steps[steps.length - 1])!;
      
      for (const join of queryAnalysis.joins) {
        const joinStep = await this.createJoinStep(currentTable, join);
        steps.push(joinStep);
        currentTable = joinStep.resultTable;
      }
    }
    
    // Step 3: WHERE filter
    if (queryAnalysis.whereClause) {
      const tableData = this.getTableFromStep(steps[steps.length - 1])!;
      const filterStep = await this.createFilterStep(
        tableData,
        queryAnalysis.whereClause,
        query
      );
      steps.push(filterStep);
    }
    
    // Step 4: GROUP BY
    if (queryAnalysis.groupBy) {
      const tableData = this.getTableFromStep(steps[steps.length - 1])!;
      const groupByStep = await this.createGroupByStep(
        tableData,
        queryAnalysis.groupBy,
        queryAnalysis.aggregates,
        query
      );
      steps.push(groupByStep);
    }
    
    // Step 5: HAVING (if present)
    if (queryAnalysis.having) {
      // Similar to filter but on grouped data
      const tableData = this.getTableFromStep(steps[steps.length - 1])!;
      const filterStep = await this.createFilterStep(
        tableData,
        queryAnalysis.having,
        query
      );
      filterStep.type = 'having' as any;
      steps.push(filterStep);
    }
    
    // Step 6: SELECT projection
    if (queryAnalysis.selectColumns && queryAnalysis.selectColumns !== '*') {
      const tableData = this.getTableFromStep(steps[steps.length - 1])!;
      const projectStep = await this.createProjectStep(
        tableData,
        queryAnalysis.selectColumns,
        queryAnalysis
      );
      steps.push(projectStep);
    }
    
    // Step 7: ORDER BY
    if (queryAnalysis.orderBy) {
      const tableData = this.getTableFromStep(steps[steps.length - 1])!;
      const orderByStep = await this.createOrderByStep(
        tableData,
        queryAnalysis.orderBy,
        query
      );
      steps.push(orderByStep);
    }
    
    // Step 8: LIMIT/OFFSET
    if (queryAnalysis.limit !== null) {
      const tableData = this.getTableFromStep(steps[steps.length - 1])!;
      const limitStep = await this.createLimitStep(
        tableData,
        queryAnalysis.limit,
        queryAnalysis.offset,
        query
      );
      steps.push(limitStep);
    }
  }
  
  private analyzeSelectQuery(query: string): any {
    const queryUpper = query.toUpperCase();
    const result: any = {
      fromTables: [],
      fromAlias: null,
      joins: [],
      whereClause: null,
      groupBy: null,
      having: null,
      selectColumns: '*',
      orderBy: null,
      limit: null,
      offset: null,
      aggregates: [],
      tableAliasMap: {}, // Maps alias -> table name
    };
    
    // Extract SELECT columns
    const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/is);
    if (selectMatch) {
      result.selectColumns = selectMatch[1].trim();
      
      // Check for aggregates
      if (/COUNT|SUM|AVG|MIN|MAX/i.test(result.selectColumns)) {
        result.aggregates = result.selectColumns.match(/(COUNT|SUM|AVG|MIN|MAX)\s*\([^)]+\)/gi) || [];
      }
    }
    
    // Extract FROM tables (with optional alias)
    const fromMatch = query.match(/FROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i);
    if (fromMatch) {
      const tableName = fromMatch[1];
      const tableAlias = fromMatch[2] || tableName;
      result.fromTables.push(tableName);
      result.fromAlias = tableAlias;
      result.tableAliasMap[tableAlias] = tableName;
    }
    
    // Extract JOINs (with optional alias)
    const joinRegex = /(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|FULL\s+OUTER\s+JOIN|CROSS\s+JOIN|JOIN)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(.+?)(?=\s+WHERE|\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/gis;
    let joinMatch;
    while ((joinMatch = joinRegex.exec(query)) !== null) {
      const tableName = joinMatch[2];
      const tableAlias = joinMatch[3] || tableName;
      result.tableAliasMap[tableAlias] = tableName;
      result.joins.push({
        type: joinMatch[1].replace(/\s+/g, ' ').trim(),
        table: tableName, // actual table name
        alias: tableAlias, // alias or table name if no alias
        condition: joinMatch[4].trim(),
      });
    }

    
    // Extract WHERE
    const whereMatch = query.match(/WHERE\s+(.+?)(?=\s+GROUP\s+BY|\s+ORDER\s+BY|\s+LIMIT|$)/is);
    if (whereMatch) {
      result.whereClause = whereMatch[1].trim();
    }
    
    // Extract GROUP BY
    const groupByMatch = query.match(/GROUP\s+BY\s+(.+?)(?=\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|$)/is);
    if (groupByMatch) {
      result.groupBy = groupByMatch[1].trim().split(',').map((s: string) => s.trim());
    }
    
    // Extract HAVING
    const havingMatch = query.match(/HAVING\s+(.+?)(?=\s+ORDER\s+BY|\s+LIMIT|$)/is);
    if (havingMatch) {
      result.having = havingMatch[1].trim();
    }
    
    // Extract ORDER BY
    const orderByMatch = query.match(/ORDER\s+BY\s+(.+?)(?=\s+LIMIT|$)/is);
    if (orderByMatch) {
      result.orderBy = orderByMatch[1].trim();
    }
    
    // Extract LIMIT and OFFSET
    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      result.limit = parseInt(limitMatch[1]);
    }
    
    const offsetMatch = query.match(/OFFSET\s+(\d+)/i);
    if (offsetMatch) {
      result.offset = parseInt(offsetMatch[1]);
    }
    
    return result;
  }
  
  private async createScanStep(tables: string[]): Promise<ScanStep> {
    const db = await getDatabase();
    const tableDataList: TableData[] = [];
    
    for (const tableName of tables) {
      const result = db.exec(`SELECT * FROM ${tableName}`);
      const rows = this.convertSqlJsResultToRows(result);
      tableDataList.push({
        name: tableName,
        rows,
      });
    }
    
    return {
      type: 'scan',
      tables: tableDataList,
      description: `Scanning table${tables.length > 1 ? 's' : ''}: ${tables.join(', ')}`,
    };
  }
  
  private async createJoinStep(leftTable: TableData, join: any): Promise<JoinStep> {
    try {
      const db = await getDatabase();
      const rightTableName = join.table;
      const result = db.exec(`SELECT * FROM ${rightTableName}`);
      const rightRows = this.convertSqlJsResultToRows(result);
      const rightTable: TableData = {
        name: rightTableName,
        rows: rightRows,
      };
      
      // Parse join condition
      const conditionParts = join.condition.match(/(\w+)\.(\w+)\s*=\s*(\w+)\.(\w+)/);
      const leftCol = conditionParts ? conditionParts[2] : null;
      const rightCol = conditionParts ? conditionParts[4] : null;
    
    const matchedPairs: Array<[number, number]> = [];
    const unmatchedLeft: number[] = [];
    const unmatchedRight: number[] = [];
    const resultRows: TableRow[] = [];
    
    // Perform join logic
    const joinType = join.type.toUpperCase();
    
    leftTable.rows.forEach((leftRow, leftIdx) => {
      let matched = false;
      
      rightTable.rows.forEach((rightRow, rightIdx) => {
        const leftValue = leftCol ? leftRow[leftCol] : null;
        const rightValue = rightCol ? rightRow[rightCol] : null;
        
        if (leftValue === rightValue && leftValue !== null) {
          matchedPairs.push([leftIdx, rightIdx]);
          // Prefix columns to avoid conflicts
          const prefixedLeftRow: TableRow = {};
          const prefixedRightRow: TableRow = {};
          
          Object.keys(leftRow).forEach(key => {
            prefixedLeftRow[`${leftTable.name}_${key}`] = leftRow[key];
          });
          
          Object.keys(rightRow).forEach(key => {
            prefixedRightRow[`${rightTable.name}_${key}`] = rightRow[key];
          });
          
          resultRows.push({ ...prefixedLeftRow, ...prefixedRightRow });
          matched = true;
        }
      });
      
      if (!matched) {
        unmatchedLeft.push(leftIdx);
        if (joinType.includes('LEFT') || joinType.includes('FULL')) {
          const prefixedLeftRow: TableRow = {};
          Object.keys(leftRow).forEach(key => {
            prefixedLeftRow[`${leftTable.name}_${key}`] = leftRow[key];
          });
          
          const nullRightRow = Object.fromEntries(
            Object.keys(rightTable.rows[0] || {}).map(k => [`${rightTable.name}_${k}`, null])
          );
          resultRows.push({ ...prefixedLeftRow, ...nullRightRow });
        }
      }
    });
    
    // Handle unmatched right rows for RIGHT and FULL joins
    rightTable.rows.forEach((rightRow, rightIdx) => {
      const isMatched = matchedPairs.some(([_, r]) => r === rightIdx);
      if (!isMatched) {
        unmatchedRight.push(rightIdx);
        if (joinType.includes('RIGHT') || joinType.includes('FULL')) {
          const nullLeftRow = Object.fromEntries(
            Object.keys(leftTable.rows[0] || {}).map(k => [`${leftTable.name}_${k}`, null])
          );
          
          const prefixedRightRow: TableRow = {};
          Object.keys(rightRow).forEach(key => {
            prefixedRightRow[`${rightTable.name}_${key}`] = rightRow[key];
          });
          
          resultRows.push({ ...nullLeftRow, ...prefixedRightRow });
        }
      }
    });
    
    return {
      type: 'join',
      leftTable,
      rightTable,
      joinType: joinType.includes('LEFT') ? 'LEFT' : joinType.includes('RIGHT') ? 'RIGHT' : joinType.includes('FULL') ? 'FULL' : 'INNER',
      condition: join.condition,
      matchedPairs,
      unmatchedLeft,
      unmatchedRight,
      resultTable: {
        name: `${leftTable.name}_JOIN_${rightTable.name}`,
        rows: resultRows,
      },
      description: `${joinType} between ${leftTable.name} and ${rightTable.name} on ${join.condition}`,
    };
    } catch (error) {
      console.error('ERROR in createJoinStep:', error);
      throw error;
    }
  }
  
  private async createFilterStep(table: TableData, condition: string, fullQuery: string): Promise<FilterStep> {
    const db = await getDatabase();
    // Build a query to get filtered results
    const tableName = table.name;
    let baseQuery = `SELECT * FROM ${tableName}`;
    
    // If table is a result from previous operations, we need to use a different approach
    // For simplicity, we'll execute the full query and compare
    const allRows = table.rows;
    const filteredQuery = fullQuery.split(/GROUP\s+BY|ORDER\s+BY|LIMIT/i)[0];
    const result = db.exec(filteredQuery);
    const filteredRows = this.convertSqlJsResultToRows(result);
    
    const keptRows: number[] = [];
    const filteredOutRows: number[] = [];
    
    allRows.forEach((row, idx) => {
      const isKept = filteredRows.some(fr => JSON.stringify(fr) === JSON.stringify(row));
      if (isKept) {
        keptRows.push(idx);
      } else {
        filteredOutRows.push(idx);
      }
    });
    
    return {
      type: 'filter',
      table,
      condition,
      keptRows,
      filteredOutRows,
      resultTable: {
        name: table.name,
        rows: filteredRows,
      },
      description: `Filtering rows where ${condition}`,
    };
  }
  
  private async createGroupByStep(table: TableData, groupByColumns: string[], aggregates: string[], fullQuery: string): Promise<GroupByStep> {
    const db = await getDatabase();
    const result = db.exec(fullQuery.split(/ORDER\s+BY|LIMIT/i)[0]);
    const resultRows = this.convertSqlJsResultToRows(result);
    
    // Group rows
    const groups: any[] = [];
    const groupMap = new Map<string, number[]>();
    
    table.rows.forEach((row, idx) => {
      const key = groupByColumns.map(col => row[col]).join('|');
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
      }
      groupMap.get(key)!.push(idx);
    });
    
    groupMap.forEach((rowIds, keyStr) => {
      const keyParts = keyStr.split('|');
      const key = Object.fromEntries(
        groupByColumns.map((col, i) => [col, keyParts[i]])
      );
      
      groups.push({
        key,
        rowIds,
        aggregates: {}, // Will be filled from result
      });
    });
    
    return {
      type: 'groupBy',
      table,
      groupKeys: groupByColumns,
      groups,
      resultTable: {
        name: 'grouped',
        rows: resultRows,
      },
      description: `Grouping by ${groupByColumns.join(', ')}${aggregates.length > 0 ? ' with aggregates: ' + aggregates.join(', ') : ''}`,
    };
  }
  
  private async createProjectStep(table: TableData, columns: string, queryAnalysis?: any): Promise<ProjectStep> {
    const columnList = columns.split(',').map(c => c.trim());
    const aliasMap = queryAnalysis?.tableAliasMap || {};
    
    const resultRows = table.rows.map(row => {
      const newRow: TableRow = {};
      
      columnList.forEach(colExpr => {
        // Handle "column AS alias" or "table.column AS alias"
        const asMatch = colExpr.match(/^(.+?)\s+AS\s+(.+)$/i);
        let sourceCol: string;
        let targetCol: string;
        
        if (asMatch) {
          // e.g., "d.name AS department"
          sourceCol = asMatch[1].trim();
          targetCol = asMatch[2].trim();
        } else {
          sourceCol = colExpr;
          // If no AS clause, extract just the column name (e.g., "e.name" -> "name")
          const extractDot = colExpr.match(/^[a-zA-Z_]+\.(.+)$/);
          targetCol = extractDot ? extractDot[1] : colExpr;
        }
        
        // Check if source has table alias prefix (e.g., "e.name" or "d.name")
        const dotMatch = sourceCol.match(/^([a-zA-Z_]+)\.(.+)$/);
        if (dotMatch) {
          const tableAlias = dotMatch[1];
          const columnName = dotMatch[2];
          
          // Map alias to actual table name (e -> employees, d -> departments)
          const tableName = aliasMap[tableAlias] || tableAlias;
          const prefixedColumn = `${tableName}_${columnName}`;
          
          if (row.hasOwnProperty(prefixedColumn)) {
            newRow[targetCol] = row[prefixedColumn];
          } else if (row.hasOwnProperty(columnName)) {
            // Fallback: try column name directly
            newRow[targetCol] = row[columnName];
          }
        } else {
          // No table prefix - just use column name directly
          if (row.hasOwnProperty(sourceCol)) {
            newRow[targetCol] = row[sourceCol];
          }
        }
      });
      
      return newRow;
    });
    
    return {
      type: 'project',
      table,
      selectedColumns: columnList,
      resultTable: {
        name: 'projected',
        rows: resultRows,
      },
      description: `Selecting columns: ${columns}`,
    };
  }
  
  private async createOrderByStep(table: TableData, orderBy: string, fullQuery: string): Promise<OrderByStep> {
    const db = await getDatabase();
    const result = db.exec(fullQuery.split(/LIMIT/i)[0]);
    const resultRows = this.convertSqlJsResultToRows(result);
    
    const orderByParts = orderBy.split(',').map(part => {
      const match = part.trim().match(/(\w+)\s*(ASC|DESC)?/i);
      return {
        column: match ? match[1] : part.trim(),
        direction: (match && match[2] ? match[2].toUpperCase() : 'ASC') as 'ASC' | 'DESC',
      };
    });
    
    return {
      type: 'orderBy',
      table,
      orderBy: orderByParts,
      resultTable: {
        name: 'ordered',
        rows: resultRows,
      },
      description: `Ordering by ${orderBy}`,
    };
  }
  
  private async createLimitStep(table: TableData, limit: number, offset: number = 0, fullQuery: string): Promise<LimitStep> {
    const db = await getDatabase();
    const result = db.exec(fullQuery);
    const resultRows = this.convertSqlJsResultToRows(result);
    
    return {
      type: 'limit',
      table,
      limit,
      offset,
      resultTable: {
        name: 'limited',
        rows: resultRows,
      },
      description: `Limiting to ${limit} rows${offset > 0 ? ` with offset ${offset}` : ''}`,
    };
  }
  
  private async executeInsertQuery(query: string, steps: VisualizationStep[]): Promise<void> {
    const db = await getDatabase();
    // Execute the insert
    db.run(query);
    
    // Get the affected table
    const tableMatch = query.match(/INSERT\s+INTO\s+(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const result = db.exec(`SELECT * FROM ${tableName}`);
      const rows = this.convertSqlJsResultToRows(result);
      
      steps.push({
        type: 'scan',
        tables: [{
          name: tableName,
          rows,
          highlightRows: [rows.length - 1], // Highlight the new row
        }],
        description: `Inserted new row into ${tableName}`,
      } as ScanStep);
    }
  }
  
  private async executeUpdateQuery(query: string, steps: VisualizationStep[]): Promise<void> {
    const db = await getDatabase();
    const tableMatch = query.match(/UPDATE\s+(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const beforeResult = db.exec(`SELECT * FROM ${tableName}`);
      const beforeRows = this.convertSqlJsResultToRows(beforeResult);
      
      db.run(query);
      
      const afterResult = db.exec(`SELECT * FROM ${tableName}`);
      const afterRows = this.convertSqlJsResultToRows(afterResult);
      
      steps.push({
        type: 'scan',
        tables: [{
          name: tableName,
          rows: afterRows,
        }],
        description: `Updated rows in ${tableName}`,
      } as ScanStep);
    }
  }
  
  private async executeDeleteQuery(query: string, steps: VisualizationStep[]): Promise<void> {
    const db = await getDatabase();
    const tableMatch = query.match(/DELETE\s+FROM\s+(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      const beforeResult = db.exec(`SELECT * FROM ${tableName}`);
      const beforeRows = this.convertSqlJsResultToRows(beforeResult);
      
      db.run(query);
      
      const afterResult = db.exec(`SELECT * FROM ${tableName}`);
      const afterRows = this.convertSqlJsResultToRows(afterResult);
      
      steps.push({
        type: 'scan',
        tables: [{
          name: tableName,
          rows: afterRows,
        }],
        description: `Deleted rows from ${tableName}`,
      } as ScanStep);
    }
  }
  
  private convertSqlJsResultToRows(result: any[]): TableRow[] {
    if (!result || result.length === 0) {
      return [];
    }
    
    const { columns, values } = result[0];
    return values.map((row: any[]) => {
      const rowObj: TableRow = {};
      columns.forEach((col: string, idx: number) => {
        rowObj[col] = row[idx];
      });
      return rowObj;
    });
  }
}
