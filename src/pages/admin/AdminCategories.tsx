import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { Loader2, Plus, Edit, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminCategories() {
  const { token } = useAuthStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState<any>({
    name: '', slug: '', description: '', parentId: '', type: 'CATEGORY',
    bannerImage: '', icon: '', isEnabled: true, seoTitle: '', seoDescription: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      // Actually we have a public route for this but auth token is optional
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: number) => {
    const hasChildren = categories.some(c => c.parentId === id);
    if (hasChildren) {
      alert("Cannot delete this category because it has child categories. Please reassign or delete them first.");
      return;
    }
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : `/api/admin/categories`;
      
      const payload = { ...formData };
      if (!payload.parentId) payload.parentId = null;
      else payload.parentId = Number(payload.parentId);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      alert('Error saving category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (cat: any) => {
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      parentId: cat.parentId || '',
      type: cat.type || 'CATEGORY',
      bannerImage: cat.bannerImage || '',
      icon: cat.icon || '',
      isEnabled: cat.isEnabled ?? true,
      seoTitle: cat.seoTitle || '',
      seoDescription: cat.seoDescription || ''
    });
    setEditingCategory(cat);
    setShowForm(true);
  };

  const handleReorder = async (category: any, direction: 'up' | 'down') => {
    const siblings = categories.filter(c => c.parentId === category.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
    const index = siblings.findIndex(c => c.id === category.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === siblings.length - 1) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const siblingToSwap = siblings[swapIndex];

    const updates = [
      { id: category.id, sortOrder: siblingToSwap.sortOrder, parentId: category.parentId },
      { id: siblingToSwap.id, sortOrder: category.sortOrder, parentId: siblingToSwap.parentId }
    ];

    // Optimistic update
    setCategories(prev => {
      const next = [...prev];
      const cat1 = next.find(c => c.id === category.id);
      const cat2 = next.find(c => c.id === siblingToSwap.id);
      if (cat1 && cat2) {
        const temp = cat1.sortOrder;
        cat1.sortOrder = cat2.sortOrder;
        cat2.sortOrder = temp;
      }
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    try {
      await fetch('/api/admin/categories/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });
    } catch (err) {
      console.error(err);
      fetchCategories(); // Revert on failure
    }
  };

  // Helper to build tree
  const buildTree = (cats: any[], parentId: number | null = null): any[] => {
    return cats
      .filter(c => c.parentId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({
        ...c,
        children: buildTree(cats, c.id)
      }));
  };

  const tree = buildTree(categories);

  const renderTree = (nodes: any[], depth = 0) => {
    return nodes.map((node, index) => (
      <React.Fragment key={node.id}>
        <tr className="hover:bg-surface-container-low transition-colors group">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3" style={{ paddingLeft: `${depth * 2}rem` }}>
              {node.icon ? (
                <img src={node.icon} alt="" className="w-8 h-8 rounded object-cover border border-outline bg-surface-container" />
              ) : (
                <div className="w-8 h-8 rounded bg-surface-container border border-outline flex items-center justify-center">
                  <span className="text-[10px] text-on-surface-variant">No img</span>
                </div>
              )}
              <div>
                <p className="font-bold text-on-surface">{node.name}</p>
                <div className="flex gap-1 mt-1">
                  <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant text-[8px] uppercase tracking-wider font-bold rounded">
                    {node.type}
                  </span>
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-on-surface-variant font-mono text-xs">{node.slug || '-'}</td>
          <td className="px-4 py-3">
            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
              node.isEnabled ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant'
            }`}>
              {node.isEnabled ? 'Active' : 'Disabled'}
            </span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1">
              <button 
                disabled={index === 0} 
                onClick={() => handleReorder(node, 'up')}
                className="p-1 hover:bg-surface-container rounded disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button 
                disabled={index === nodes.length - 1} 
                onClick={() => handleReorder(node, 'down')}
                className="p-1 hover:bg-surface-container rounded disabled:opacity-30"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(node)} className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-primary transition-colors" title="Edit">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(node.id)} className="p-1.5 hover:bg-error-container rounded text-on-surface-variant hover:text-error transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        {node.children && node.children.length > 0 && renderTree(node.children, depth + 1)}
      </React.Fragment>
    ));
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Categories</h2>
        <button 
          onClick={() => {
            setFormData({ name: '', slug: '', description: '', parentId: '', type: 'CATEGORY', bannerImage: '', icon: '', isEnabled: true, seoTitle: '', seoDescription: '' });
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Category
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
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Name</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Slug</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs">Status</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs w-24">Order</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-widest text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {renderTree(tree)}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-on-surface-variant">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Name *</label>
                  <input required value={formData.name} onChange={e => {
                    setFormData({...formData, name: e.target.value, slug: formData.slug || e.target.value.toLowerCase().replace(/\s+/g, '-')})
                  }} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Slug *</label>
                  <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container font-mono text-xs" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container min-h-[80px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Parent Category</label>
                  <select value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container">
                    <option value="">None (Top-Level)</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container">
                    <option value="CATEGORY">Category (Standard)</option>
                    <option value="OCCASION">Occasion</option>
                    <option value="FESTIVAL">Festival</option>
                    <option value="RELATIONSHIP">Relationship</option>
                    <option value="PRICE_COLLECTION">Price Collection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Icon URL</label>
                  <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Banner Image URL</label>
                  <input value={formData.bannerImage} onChange={e => setFormData({...formData, bannerImage: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">SEO Title</label>
                  <input value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">SEO Description</label>
                  <input value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" checked={formData.isEnabled} onChange={e => setFormData({...formData, isEnabled: e.target.checked})} className="w-4 h-4" />
                  Enabled
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-outline">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-outline rounded-lg font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-bold">
                  {loading ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
