import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Plus, Edit, Trash2, X, Globe, Save } from "lucide-react";

export default function AdminCMS() {
  const { token } = useAuthStore();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    content: "",
    isPublished: false
  });

  // Homepage sections settings
  const [homepageSections, setHomepageSections] = useState<string[]>([]);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const fetchPages = async () => {
    try {
      const res = await fetch("/api/admin/cms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings/cms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const hw = data.find((d: any) => d.key === 'homepage_sections_order');
      if (hw && hw.value) {
        try {
          setHomepageSections(JSON.parse(hw.value));
        } catch(e) { console.error(e); }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPages();
      fetchSettings();
    }
  }, [token]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch(`/api/admin/cms/${formData.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          isPublished: formData.isPublished
        })
      });
      setFormModalOpen(false);
      fetchPages();
    } catch (err) {
      console.error(err);
    }
  };

  const saveHomepageSections = async () => {
    setSettingsLoading(true);
    try {
      await fetch(`/api/admin/settings/cms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ homepage_sections_order: JSON.stringify(homepageSections) })
      });
      alert('Saved!');
    } catch (err) {
      console.error(err);
    } finally {
      setSettingsLoading(false);
    }
  };

  const defaultSections = ['Hero', 'Trending', 'Categories', 'Festival Highlights', 'Testimonials'];
  const toggleSection = (s: string) => {
    if (homepageSections.includes(s)) {
      setHomepageSections(homepageSections.filter(x => x !== s));
    } else {
      setHomepageSections([...homepageSections, s]);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CMS & Pages</h1>
        <button
          onClick={() => {
            setFormData({ slug: "", title: "", content: "", isPublished: false });
            setFormModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" /> Add Page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 font-medium text-gray-900">
              Content Pages
            </div>
            <ul className="divide-y divide-gray-200">
              {pages.map((page) => (
                <li key={page.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Globe className="w-6 h-6 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{page.title}</h3>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${page.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-gray-500">{new Date(page.updatedAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => {
                        setFormData({
                          slug: page.slug,
                          title: page.title,
                          content: page.content || "",
                          isPublished: page.isPublished
                        });
                        setFormModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
              {pages.length === 0 && (
                <li className="p-8 text-center text-gray-500">No pages created yet. Add one above.</li>
              )}
            </ul>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="font-medium text-gray-900 mb-4">Homepage Sections</h2>
            <p className="text-sm text-gray-500 mb-4">Select which sections to display on the homepage.</p>
            
            <div className="space-y-3">
              {defaultSections.map(s => (
                <div key={s} className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id={`section-${s}`}
                    checked={homepageSections.includes(s)}
                    onChange={() => toggleSection(s)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor={`section-${s}`} className="text-sm text-gray-700">{s}</label>
                </div>
              ))}
            </div>

            <button 
              onClick={saveHomepageSections}
              disabled={settingsLoading}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {settingsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Layout
            </button>
          </div>
        </div>
      </div>

      {formModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h2 className="text-xl font-bold">Edit Page</h2>
              <button onClick={() => setFormModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug} 
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. about-us"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (HTML/Rich Text)</label>
                <textarea 
                  value={formData.content} 
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  rows={12}
                  placeholder="<p>Enter page content here...</p>"
                />
                <p className="text-xs text-gray-500 mt-1">For simplicity, paste HTML directly here.</p>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">Published (visible to public)</label>
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
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
