import React, { useState, useEffect } from 'react';
import { getApiHistory, ApiCallRecord } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { X, Code2, Server, Database, Key, Play, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ApiArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiArchitectureModal: React.FC<ApiArchitectureModalProps> = ({ isOpen, onClose }) => {
  const { token } = useAuth();
  const [history, setHistory] = useState<ApiCallRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ApiCallRecord | null>(null);

  const refreshHistory = () => {
    const list = getApiHistory();
    setHistory(list);
    if (list.length > 0 && !selectedRecord) {
      setSelectedRecord(list[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshHistory();
      const handler = () => refreshHistory();
      window.addEventListener('aura_api_called', handler);
      return () => window.removeEventListener('aura_api_called', handler);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const routes = [
    { method: 'POST', path: '/api/v1/auth/login', desc: 'Sanctum JWT Authentication' },
    { method: 'POST', path: '/api/v1/auth/register', desc: 'Customer Account Creation' },
    { method: 'POST', path: '/api/v1/auth/change-password', desc: 'Secure Password Modification' },
    { method: 'GET', path: '/api/v1/products', desc: 'Artisanal Catalog with Stock' },
    { method: 'POST', path: '/api/v1/orders', desc: 'Place Order with Dine-in/KHQR' },
    { method: 'PATCH', path: '/api/v1/orders/{id}/status', desc: 'Barista Fulfillment Stage' },
    { method: 'POST', path: '/api/v1/reservations', desc: 'Table Booking Engine' },
    { method: 'GET', path: '/api/v1/admin/logs', desc: 'Audit Login & Activity Logs' },
    { method: 'POST', path: '/api/v1/admin/users', desc: 'Staff/Member Onboarding' },
    { method: 'PATCH', path: '/api/v1/admin/users/{id}/role', desc: 'Role Permission Assignment' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-[#140e0a] border border-[#38261b] rounded-2xl shadow-2xl text-[#f4efe9] overflow-hidden my-auto sm:my-4 flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="p-5 bg-[#1a120d] border-b border-[#2d1e16] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#d97706]/20 border border-[#d97706]/40 flex items-center justify-center text-[#d97706]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-[#fcfaf7]">
                  PHP Laravel 11.x REST API Architecture
                </h2>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] font-bold">
                  Sanctum Active
                </span>
              </div>
              <p className="text-xs text-[#8c7461]">
                Clean Client-Server API contract connecting Frontend React SPA to Laravel REST Controller endpoints.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20150e] hover:bg-[#2a1d15] text-[#d97706] hover:text-[#f4efe9] border border-[#38261b] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#20150e] hover:bg-[#2a1d15] text-[#a8988b] hover:text-[#f4efe9] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Architecture Badges & Token Info */}
        <div className="p-4 bg-[#17100b] border-b border-[#2d1e16] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1a120d] border border-[#2d1e16]">
            <Server className="w-4 h-4 text-[#d97706]" />
            <div>
              <div className="font-bold text-[#fcfaf7]">Backend Engine</div>
              <div className="text-[10px] text-[#8c7461]">Laravel 11.x / PHP 8.3 / REST</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1a120d] border border-[#2d1e16]">
            <Database className="w-4 h-4 text-[#d97706]" />
            <div>
              <div className="font-bold text-[#fcfaf7]">Database & Eloquent</div>
              <div className="text-[10px] text-[#8c7461]">Users, Orders, Tables, AuditLogs</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#1a120d] border border-[#2d1e16]">
            <Key className="w-4 h-4 text-[#d97706]" />
            <div className="overflow-hidden">
              <div className="font-bold text-[#fcfaf7]">Active Bearer Token</div>
              <div className="text-[10px] font-mono text-[#8c7461] truncate">
                {token || 'Guest Session (No token)'}
              </div>
            </div>
          </div>
        </div>

        {/* Dual pane: Route specification & Live call inspector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left: Endpoint Catalog */}
          <div className="md:col-span-5 p-4 border-r border-[#2d1e16] overflow-y-auto space-y-2 bg-[#120d0a]/50">
            <span className="text-[11px] font-mono uppercase text-[#8c7461] block mb-2 font-bold">
              API Route Specification
            </span>
            {routes.map((r, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-[#17100b] border border-[#26170f] hover:border-[#38261b] text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      r.method === 'POST'
                        ? 'bg-[#10b981]/15 text-[#10b981]'
                        : r.method === 'PATCH'
                        ? 'bg-[#d97706]/15 text-[#d97706]'
                        : 'bg-[#3b82f6]/15 text-[#3b82f6]'
                    }`}
                  >
                    {r.method}
                  </span>
                  <span className="text-[#fcfaf7] truncate">{r.path}</span>
                </div>
                <div className="text-[10px] text-[#8c7461] mt-1 font-sans">{r.desc}</div>
              </div>
            ))}
          </div>

          {/* Right: Live Request Inspector */}
          <div className="md:col-span-7 p-4 overflow-y-auto bg-[#140e0a] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono uppercase text-[#8c7461] font-bold">
                Live Intercepted API Requests ({history.length})
              </span>
              <button
                onClick={refreshHistory}
                className="text-[11px] text-[#d97706] hover:underline font-mono cursor-pointer"
              >
                Refresh Log
              </button>
            </div>

            {history.length === 0 ? (
              <div className="py-20 text-center text-xs text-[#8c7461]">
                Perform actions in the app (Login, Place Order, Change Status) to view real Laravel API payloads.
              </div>
            ) : (
              <div className="space-y-3 flex-1 flex flex-col">
                {/* Recent requests list */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {history.slice(0, 10).map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedRecord(rec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-all ${
                        selectedRecord?.id === rec.id
                          ? 'bg-[#d97706] text-[#120d0a] font-bold'
                          : 'bg-[#1f150f] text-[#a8988b] border border-[#2d1e16]'
                      }`}
                    >
                      {rec.method} {rec.endpoint.replace('/api/v1', '')}
                    </button>
                  ))}
                </div>

                {/* JSON Inspector View */}
                {selectedRecord && (
                  <div className="p-4 rounded-xl bg-[#0d0907] border border-[#2d1e16] font-mono text-[11px] flex-1 overflow-y-auto max-h-80">
                    <div className="flex items-center justify-between text-[#8c7461] pb-2 mb-2 border-b border-[#241710]">
                      <span>HTTP {selectedRecord.status} OK</span>
                      <span>Recorded: {selectedRecord.timestamp}</span>
                    </div>

                    <div className="text-[#a8988b] mb-1">
                      // Request: <span className="text-[#fcfaf7]">{selectedRecord.method} {selectedRecord.endpoint}</span>
                    </div>
                    <pre className="text-[#d97706] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(selectedRecord.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
