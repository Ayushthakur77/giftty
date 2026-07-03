import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Search, Calendar, User, ChevronDown, ChevronUp, ShieldAlert, Activity } from "lucide-react";

export default function AdminAuditLogs() {
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filters
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (actionType) q.append("action", actionType);
      if (startDate) q.append("start", startDate);
      if (endDate) q.append("end", endDate);

      const res = await fetch(`/api/admin/audit-logs?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchLogs();
  }, [token, actionType, startDate, endDate]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600" /> Audit Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Tamper-proof record of all administrative actions.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
            <input 
              type="text" 
              placeholder="e.g. UPDATE_ORDER" 
              value={actionType}
              onChange={e => setActionType(e.target.value)}
              className="w-full p-2 text-sm border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 text-sm border rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 text-sm border rounded"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-sm">
                  <th className="p-4 font-medium text-gray-600">Timestamp</th>
                  <th className="p-4 font-medium text-gray-600">Admin User ID</th>
                  <th className="p-4 font-medium text-gray-600">Action Type</th>
                  <th className="p-4 font-medium text-gray-600">Summary</th>
                  <th className="p-4 font-medium text-gray-600 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 text-sm transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                      <td className="p-4 whitespace-nowrap text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-4 whitespace-nowrap font-mono text-xs text-gray-600 bg-gray-100 rounded my-2 inline-block px-2 py-1 mx-4">{log.userId}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-gray-700 truncate max-w-xs">{log.details.substring(0, 50)}...</td>
                      <td className="p-4 text-gray-400 text-center">
                        {expandedId === log.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <td colSpan={5} className="p-6">
                          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-green-400">
                              {JSON.stringify(JSON.parse(log.details || "{}"), null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No audit logs found matching criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
