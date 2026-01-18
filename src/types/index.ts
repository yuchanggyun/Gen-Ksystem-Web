// Database connection configuration
export interface DbConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

// SP Response wrapper
export interface SPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  recordset?: T[];
  recordsets?: T[][];  // Added for multiple recordsets support
  returnValue?: number;
}

// Production data types
export interface ProductionItem {
  modelName: string;
  processCode: string;
  unit: string;
  quantity: number;
  status: 'normal' | 'warning' | 'error';
}

export interface WorkCenter {
  code: string;
  name: string;
}

export interface ProcessStatus {
  type: 'bench' | 'exception';
  items: string[];
}
