import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Plus, Edit, Copy, Trash2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminGiftBoxes() {
  const { token } = useAuthStore();
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'READY_MADE' | 'CUSTOM_BUILDER'>('READY_MADE');

  const fetchBoxes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/gift-boxes?boxType=${activeTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBoxes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBoxes();
  }, [token, activeTab]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this box?')) return;
    try {
      await fetch(`/api/admin/gift-boxes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBoxes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await fetch(`/api/admin/gift-boxes/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchBoxes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gift Boxes</h2>
        <Link 
          to={`/admin/gift-boxes/new?type=${activeTab}`}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Box
        </Link>
      </div>

      <div className="flex border-b border-outline gap-6">
        <button 
          onClick={() => setActiveTab('READY_MADE')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'READY_MADE' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Ready-Made Boxes
        </button>
        <button 
          onClick={() => setActiveTab('CUSTOM_BUILDER')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'CUSTOM_BUILDER' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          Custom Builder Boxes
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-outline shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline">
                <tr>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Gift Box</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Price</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Stock</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {boxes.map(box => (
                  <tr key={box.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {box.coverImage ? (
                          <img src={box.coverImage} alt="" className="w-10 h-10 rounded object-cover border border-outline" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-surface-container border border-outline flex items-center justify-center">
                            <span className="text-xs text-on-surface-variant">No img</span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-on-surface">{box.name}</p>
                          <div className="flex gap-1 mt-1">
                            {box.isFeatured && <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container text-[8px] uppercase tracking-wider font-bold rounded">Featured</span>}
                            {box.isTrending && <span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container text-[8px] uppercase tracking-wider font-bold rounded">Trending</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold">${Number(box.basePrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-bold bg-surface-container text-on-surface-variant">
                        {box.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        box.status === 'PUBLISHED' ? 'bg-primary-container text-on-primary-container' : 
                        box.status === 'DRAFT' ? 'bg-surface-container text-on-surface-variant' : 
                        'bg-error-container text-error'
                      }`}>
                        {box.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/gift-boxes/${box.id}/edit`} className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDuplicate(box.id)} className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(box.id)} className="p-1.5 hover:bg-error-container rounded text-on-surface-variant hover:text-error transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a href={`/gift-boxes/${box.id}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="View">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {boxes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No ready-made gift boxes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
