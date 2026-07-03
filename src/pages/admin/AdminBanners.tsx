import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Plus, Edit, Trash2, Check, X, GripVertical } from "lucide-react";

export default function AdminBanners() {
  const { token } = useAuthStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    type: "HOMEPAGE",
    title: "",
    subtitle: "",
    image: "",
    mobileImage: "",
    link: "",
    isActive: true,
    startDate: "",
    endDate: ""
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // Sort by sortOrder
      data.sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchBanners();
  }, [token]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : "/api/admin/banners";
      const method = editingBanner ? "PUT" : "POST";
      
      const payload = { ...formData };
      if (!payload.startDate) delete (payload as any).startDate;
      if (!payload.endDate) delete (payload as any).endDate;
      if (!payload.title) delete (payload as any).title;
      if (!payload.subtitle) delete (payload as any).subtitle;
      if (!payload.mobileImage) delete (payload as any).mobileImage;
      if (!payload.link) delete (payload as any).link;

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      setFormModalOpen(false);
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleMove = async (index: number, direction: 'up'|'down', type: string) => {
    // Filter banners by type first
    const typeBanners = banners.filter(b => b.type === type);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= typeBanners.length) return;
    
    const curr = typeBanners[index];
    const target = typeBanners[targetIndex];
    
    // Swap sortOrder
    const currOrder = curr.sortOrder || index;
    const targetOrder = target.sortOrder || targetIndex;
    
    curr.sortOrder = targetOrder;
    target.sortOrder = currOrder;
    
    // Optimistic update
    setBanners([...banners]);
    
    try {
      await fetch(`/api/admin/banners/${curr.id}/reorder`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sortOrder: targetOrder })
      });
      await fetch(`/api/admin/banners/${target.id}/reorder`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sortOrder: currOrder })
      });
      fetchBanners();
    } catch(err) {
      console.error(err);
      fetchBanners();
    }
  };

  const bannerTypes = ['HOMEPAGE', 'CATEGORY', 'FESTIVAL', 'OFFER', 'SLIDER', 'HERO', 'POPUP'];

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <button
          onClick={() => {
            setFormData({ type: "HOMEPAGE", title: "", subtitle: "", image: "", mobileImage: "", link: "", isActive: true, startDate: "", endDate: "" });
            setEditingBanner(null);
            setFormModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      <div className="space-y-8">
        {bannerTypes.map(type => {
          const typeBanners = banners.filter(b => b.type === type);
          if (typeBanners.length === 0) return null;
          
          return (
            <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-900">
                {type} Banners
              </div>
              <ul className="divide-y divide-gray-200">
                {typeBanners.map((banner, index) => (
                  <li key={banner.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1 text-gray-400">
                        <button onClick={() => handleMove(index, 'up', type)} disabled={index === 0} className="hover:text-gray-900 disabled:opacity-30"><GripVertical className="w-4 h-4" /></button>
                      </div>
                      <img src={banner.image || 'https://picsum.photos/1024/400'} alt="Banner" className="h-16 w-32 object-cover rounded border" />
                      <div>
                        <h3 className="font-medium text-gray-900">{banner.title || "(Untitled)"}</h3>
                        <p className="text-sm text-gray-500">{banner.link}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {banner.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {banner.startDate && <span className="text-gray-500">From {new Date(banner.startDate).toLocaleDateString()}</span>}
                          {banner.endDate && <span className="text-gray-500">Until {new Date(banner.endDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingBanner(banner);
                          setFormData({
                            type: banner.type,
                            title: banner.title || "",
                            subtitle: banner.subtitle || "",
                            image: banner.image || "",
                            mobileImage: banner.mobileImage || "",
                            link: banner.link || "",
                            isActive: banner.isActive,
                            startDate: banner.startDate ? banner.startDate.substring(0,16) : "",
                            endDate: banner.endDate ? banner.endDate.substring(0,16) : ""
                          });
                          setFormModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingBanner ? "Edit Banner" : "Add Banner"}</h2>
              <button onClick={() => setFormModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    {bannerTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.subtitle} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image} 
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  {formData.image && <img src={formData.image} alt="Preview" className="mt-2 h-20 object-contain border rounded" />}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.mobileImage} 
                    onChange={e => setFormData({...formData, mobileImage: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
                <input 
                  type="text" 
                  value={formData.link} 
                  onChange={e => setFormData({...formData, link: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g., /category/gifts or https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                  <input 
                    type="datetime-local" 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded font-medium"
                >
                  Save Banner
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
