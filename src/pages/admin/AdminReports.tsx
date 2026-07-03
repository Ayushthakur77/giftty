import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Download, BarChart2, Calendar, FileSpreadsheet } from "lucide-react";

export default function AdminReports() {
  const { token } = useAuthStore();
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reportOptions = [
    { id: 'sales', name: 'Sales Report' },
    { id: 'revenue', name: 'Revenue Report' },
    { id: 'products', name: 'Product Performance' },
    { id: 'inventory', name: 'Inventory & Stock' },
    { id: 'customers', name: 'Customer Insights' },
    { id: 'coupons', name: 'Coupon Usage' },
    { id: 'taxes', name: 'Tax Report' },
    { id: 'payments', name: 'Payments & Refunds' },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (startDate) q.append("start", startDate);
      if (endDate) q.append("end", endDate);
      
      const res = await fetch(`/api/admin/reports/${reportType}?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(Array.isArray(json) ? json : Object.values(json || {}));
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReport();
  }, [token, reportType]);

  const exportCSV = () => {
    if (!data.length) return alert("No data to export");
    
    // Extract headers
    let allKeys = new Set<string>();
    data.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));
    const headers = Array.from(allKeys);
    
    // Convert to CSV string
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `giftjoy-${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" /> Reports & Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">Exportable metrics and business insights.</p>
        </div>
        <button 
          onClick={exportCSV}
          disabled={loading || data.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <FileSpreadsheet className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b bg-gray-50 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Report Type</label>
            <select 
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full p-2 text-sm border rounded bg-white"
            >
              {reportOptions.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full p-2 text-sm border rounded bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full p-2 text-sm border rounded bg-white"
            />
          </div>
          <button 
            onClick={fetchReport}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-sm font-medium hover:bg-indigo-100 transition-colors h-[38px]"
          >
            Apply Filters
          </button>
        </div>

        {loading ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No data found for the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
                <tr>
                  {Object.keys(data[0] || {}).map(k => (
                    <th key={k} className="p-4 font-semibold text-gray-700 text-xs uppercase tracking-wider border-b">
                      {k.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-4 text-sm text-gray-700">
                        {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
