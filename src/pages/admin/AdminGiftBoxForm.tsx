import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { ArrowLeft, Search, Plus, Trash2 } from "lucide-react";

export default function AdminGiftBoxForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const isEditing = !!id;

  const typeParam = new URLSearchParams(window.location.search).get('type') || 'READY_MADE';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState<any>({
    name: '', description: '', coverImage: '', galleryImages: [],
    boxType: typeParam, basePrice: '', offerPrice: '', stock: '',
    capacity: 3, maxProducts: 3, maxWeight: '', material: '', color: '', shape: '',
    includedProductIds: [], allowedProductIds: [], requiredProductIds: [], allowedCategoryIds: [],
    ribbonOptions: [], fillerOptions: [], availableGreetingCards: [],
    mandatoryGreetingCard: false, mandatoryNote: false,
    defaultNote: '', status: 'DRAFT', isFeatured: false, isTrending: false
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    // Fetch all published products for the picker
    fetch('/api/admin/products?status=PUBLISHED', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(console.error);

    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    if (isEditing && token) {
      fetch(`/api/admin/gift-boxes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const box = data.find((b: any) => b.id === Number(id));
          if (box) setFormData(box);
          setInitialLoading(false);
        })
        .catch(err => {
          console.error(err);
          setInitialLoading(false);
        });
    }
  }, [id, isEditing, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = (productId: number) => {
    setFormData((prev: any) => {
      const existing = prev.includedProductIds.find((p: any) => p.productId === productId);
      if (existing) {
        return {
          ...prev,
          includedProductIds: prev.includedProductIds.map((p: any) => 
            p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p
          )
        };
      }
      return {
        ...prev,
        includedProductIds: [...prev.includedProductIds, { productId, quantity: 1 }]
      };
    });
  };

  const handleUpdateProductQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      setFormData((prev: any) => ({
        ...prev,
        includedProductIds: prev.includedProductIds.filter((p: any) => p.productId !== productId)
      }));
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      includedProductIds: prev.includedProductIds.map((p: any) => 
        p.productId === productId ? { ...p, quantity: qty } : p
      )
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/admin/gift-boxes/${id}` : `/api/admin/gift-boxes`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      alert('Gift Box saved successfully');
      navigate('/admin/gift-boxes');
    } catch (err: any) {
      console.error(err);
      alert('Error saving gift box: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  if (initialLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/gift-boxes')} className="p-2 hover:bg-surface-container rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Gift Box' : (formData.boxType === 'CUSTOM_BUILDER' ? 'Add Custom Builder Box' : 'Add Ready-Made Box')}</h2>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Box Details</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Capacity (Max Items)</label>
                <input type="number" required name="capacity" value={formData.capacity} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              {formData.boxType === 'CUSTOM_BUILDER' && (
                <div>
                  <label className="block text-xs font-bold mb-1">Maximum Weight</label>
                  <input type="number" step="0.01" name="maxWeight" value={formData.maxWeight} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
              )}
            </div>
            
            {formData.boxType === 'CUSTOM_BUILDER' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Material</label>
                  <input name="material" value={formData.material} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Color</label>
                  <input name="color" value={formData.color} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Shape</label>
                  <input name="shape" value={formData.shape} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
              </div>
            )}
          </div>

          {/* Included Products (Ready Made only) */}
          {formData.boxType === 'READY_MADE' && (
            <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
              <h3 className="font-bold border-b border-outline pb-2">Included Products</h3>
            
            <div className="space-y-3 mb-6">
              {formData.includedProductIds.length === 0 && <p className="text-sm text-on-surface-variant">No products added yet.</p>}
              {formData.includedProductIds.map((item: any) => {
                const p = products.find(prod => prod.id === item.productId);
                if (!p) return null;
                return (
                  <div key={item.productId} className="flex items-center justify-between bg-surface-container-low p-3 rounded-lg border border-outline">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-xs text-on-surface-variant">${Number(p.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number" 
                        min="0"
                        value={item.quantity} 
                        onChange={e => handleUpdateProductQuantity(item.productId, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center border border-outline rounded bg-surface"
                      />
                      <button type="button" onClick={() => handleUpdateProductQuantity(item.productId, 0)} className="p-1 hover:text-error">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border border-outline rounded-xl overflow-hidden">
              <div className="p-3 bg-surface-container-low border-b border-outline flex items-center gap-2">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input 
                  placeholder="Search products to add..." 
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full"
                />
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-outline">
                {filteredProducts.map(p => (
                  <div key={p.id} className="p-3 flex items-center justify-between hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />}
                      <div>
                        <p className="font-bold text-sm line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-on-surface-variant">${Number(p.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleAddProduct(p.id)} className="p-1.5 hover:bg-primary-container hover:text-on-primary-container rounded transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {filteredProducts.length === 0 && <div className="p-4 text-center text-sm text-on-surface-variant">No products found</div>}
              </div>
            </div>
          </div>
          )}

          {/* Box Rules (Custom Builder only) */}
          {formData.boxType === 'CUSTOM_BUILDER' && (
            <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
              <h3 className="font-bold border-b border-outline pb-2">Custom Box Rules</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Max Products Allowed</label>
                  <input type="number" name="maxProducts" value={formData.maxProducts} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Allowed Categories</label>
                <div className="border border-outline rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-surface-container-low">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={formData.allowedCategoryIds.includes(c.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData((prev: any) => ({
                            ...prev,
                            allowedCategoryIds: isChecked 
                              ? [...prev.allowedCategoryIds, c.id]
                              : prev.allowedCategoryIds.filter((id: number) => id !== c.id)
                          }));
                        }}
                      />
                      {c.name}
                    </label>
                  ))}
                  {categories.length === 0 && <span className="text-sm text-on-surface-variant">No categories found</span>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Required Products (Must be included)</label>
                <div className="border border-outline rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-surface-container-low">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={formData.requiredProductIds.includes(p.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData((prev: any) => ({
                            ...prev,
                            requiredProductIds: isChecked 
                              ? [...prev.requiredProductIds, p.id]
                              : prev.requiredProductIds.filter((id: number) => id !== p.id)
                          }));
                        }}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold mb-1">Explicitly Allowed Products (Optional)</label>
                <p className="text-[10px] text-on-surface-variant mb-2">If empty, allows anything from allowed categories (or all if both empty).</p>
                <div className="border border-outline rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-surface-container-low">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={formData.allowedProductIds.includes(p.id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData((prev: any) => ({
                            ...prev,
                            allowedProductIds: isChecked 
                              ? [...prev.allowedProductIds, p.id]
                              : prev.allowedProductIds.filter((id: number) => id !== p.id)
                          }));
                        }}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" name="mandatoryGreetingCard" checked={formData.mandatoryGreetingCard} onChange={handleChange} className="w-4 h-4" />
                  Mandatory Greeting Card
                </label>
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input type="checkbox" name="mandatoryNote" checked={formData.mandatoryNote} onChange={handleChange} className="w-4 h-4" />
                  Mandatory Note
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-outline pt-4">
                <div>
                  <label className="block text-xs font-bold mb-1">Ribbon Options (comma separated)</label>
                  <input 
                    value={formData.ribbonOptions?.join(', ') || ''} 
                    onChange={e => setFormData({...formData, ribbonOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                    className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Filler Options (comma separated)</label>
                  <input 
                    value={formData.fillerOptions?.join(', ') || ''} 
                    onChange={e => setFormData({...formData, fillerOptions: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                    className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Available Greeting Cards (comma separated)</label>
                  <input 
                    value={formData.availableGreetingCards?.join(', ') || ''} 
                    onChange={e => setFormData({...formData, availableGreetingCards: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} 
                    className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container text-sm" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Pricing & Stock */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Pricing & Stock</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Total Box Price *</label>
              <input required type="number" step="0.01" name="basePrice" value={formData.basePrice} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Offer Price</label>
              <input type="number" step="0.01" name="offerPrice" value={formData.offerPrice} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Stock Quantity *</label>
              <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
            </div>
          </div>

          {/* Media */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Media</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Cover Image URL</label>
              <input name="coverImage" value={formData.coverImage} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              {formData.coverImage && <img src={formData.coverImage} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-outline" />}
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Flags & Visibility</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isTrending" checked={formData.isTrending} onChange={handleChange} className="w-4 h-4" />
                Trending
              </label>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Gift Box'}
          </button>
        </div>
      </form>
    </div>
  );
}
