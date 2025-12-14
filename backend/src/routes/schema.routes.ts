import { Router, Request, Response } from 'express';
import { getDatabase } from '../database/init';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const schemas = [
      {
        id: 'employees',
        name: 'Employees & Departments',
        description: 'Employee management system with departments',
        tables: ['employees', 'departments'],
      },
      {
        id: 'orders',
        name: 'E-commerce Orders',
        description: 'Online store with customers, products, and orders',
        tables: ['customers', 'products', 'orders', 'order_items'],
      },
      {
        id: 'students',
        name: 'University Enrollments',
        description: 'Student course enrollment system',
        tables: ['students', 'courses', 'enrollments'],
      },
      {
        id: 'transactions',
        name: 'Financial Transactions',
        description: 'Bank account transactions',
        tables: ['transactions'],
      },
    ];
    
    res.json(schemas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:schemaId', async (req: Request, res: Response) => {
  try {
    const { schemaId } = req.params;
    const db = await getDatabase();
    
    let tables: string[] = [];
    
    switch (schemaId) {
      case 'employees':
        tables = ['employees', 'departments'];
        break;
      case 'orders':
        tables = ['customers', 'products', 'orders', 'order_items'];
        break;
      case 'students':
        tables = ['students', 'courses', 'enrollments'];
        break;
      case 'transactions':
        tables = ['transactions'];
        break;
      default:
        return res.status(404).json({ error: 'Schema not found' });
    }
    
    const schemaInfo: any = {
      id: schemaId,
      tables: [],
    };
    
    for (const tableName of tables) {
      const columnsResult = db.exec(`PRAGMA table_info(${tableName})`);
      const columns = columnsResult.length > 0 ? columnsResult[0].values.map((row: any) => ({
        cid: row[0],
        name: row[1],
        type: row[2],
        notnull: row[3],
        dflt_value: row[4],
        pk: row[5]
      })) : [];
      
      // Get foreign keys
      const foreignKeysResult = db.exec(`PRAGMA foreign_key_list(${tableName})`);
      const foreignKeys = foreignKeysResult.length > 0
        ? foreignKeysResult[0].values.map((row: any) => ({
            from: row[3],
            table: row[2],
            to: row[4],
          }))
        : [];
      
      const countResult = db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
      const rowCount = countResult.length > 0 ? countResult[0].values[0][0] : 0;
      
      const sampleResult = db.exec(`SELECT * FROM ${tableName} LIMIT 5`);
      const sampleRows = sampleResult.length > 0 ? sampleResult[0].values.map((row: any) => {
        const obj: any = {};
        sampleResult[0].columns.forEach((col: string, idx: number) => {
          obj[col] = row[idx];
        });
        return obj;
      }) : [];
      
      schemaInfo.tables.push({
        name: tableName,
        columns: columns.map((col: any) => {
          const fk = foreignKeys.find((fk: any) => fk.from === col.name);
          return {
            name: col.name,
            type: col.type,
            nullable: !col.notnull,
            primaryKey: col.pk === 1,
            ...(fk && {
              foreignKey: {
                table: fk.table,
                column: fk.to,
              },
            }),
          };
        }),
        rowCount,
        sampleRows,
      });
    }
    
    res.json(schemaInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
