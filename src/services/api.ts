import { User, ActivityLog, Order, Product, TableReservation } from '../types';

export interface LaravelApiResponse<T = any> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  meta: {
    framework: string;
    version: string;
    endpoint: string;
    method: string;
    executionTimeMs: number;
    timestamp: string;
  };
}

export interface ApiCallRecord {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  payload?: any;
  response: any;
}

const API_HISTORY_KEY = 'aura_cafe_api_history';

export const getApiHistory = (): ApiCallRecord[] => {
  try {
    const raw = localStorage.getItem(API_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const recordApiCall = (call: Omit<ApiCallRecord, 'id' | 'timestamp'>) => {
  try {
    const history = getApiHistory();
    const newRecord: ApiCallRecord = {
      ...call,
      id: 'req_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    const updated = [newRecord, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(API_HISTORY_KEY, JSON.stringify(updated));
    // dispatch custom event so API console can update reactively
    window.dispatchEvent(new Event('aura_api_called'));
  } catch (err) {
    console.error('Failed to log API call', err);
  }
};

/**
 * Creates standardized Laravel Sanctum REST API response wrapper
 */
export const makeLaravelResponse = <T>(
  data: T,
  endpoint: string,
  method: string,
  message = 'Request executed successfully',
  status = 200,
  latency = 180
): LaravelApiResponse<T> => {
  const response: LaravelApiResponse<T> = {
    success: status >= 200 && status < 300,
    status,
    message,
    data,
    meta: {
      framework: 'Laravel 11.x (PHP 8.3)',
      version: 'v1.4.0-sanctum-rest',
      endpoint,
      method,
      executionTimeMs: latency,
      timestamp: new Date().toISOString(),
    },
  };

  recordApiCall({
    method: method as any,
    endpoint,
    status,
    response,
  });

  return response;
};
