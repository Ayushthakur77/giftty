import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  
  const [formData, setFormData] = useState<any>({
    name: '', slug: '', shortDescription: '', description: '', brand: '',
    subcategoryId: '', occasionTags: [], 
    price: '', salePrice: '', costPrice: '', gstPercent: '', 
    sku: '', barcode: '', inventoryCount: '', lowStockThreshold: '5', 
    weight: '', length: '', width: '', height: '',
    image: '', galleryImages: [], video: '',
    status: 'DRAFT', isFeatured: false, isTrending: false, isBestseller: false, isRecommended: false,
    isCustomizationEnabled: false, isPersonalizationEnabled: false, hasGreetingCard: false, isGiftBoxCompatible: true,
    estimatedDelivery: '', returnPolicy: '', warranty: '',
    seoTitle: '', seoDescription: '', tags: []
  });

  const [customization, setCustomization] = useState<any>({
    canEngrave: false, canUploadImage: false, canUploadLogo: false, canWriteMessage: false,
    characterLimit: 0, availableFonts: [], availableColors: [], availableEngravingPositions: [],
    availableRibbonColors: [], availableGreetingCardTemplates: [],
    maxCustomizations: 1, extraCharge: '0.00'
  });

  // Simple array states for multi-inputs
  const [tagInput, setTagInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');
  const [occasionInput, setOccasionInput] = useState('');

  useEffect(() => {
    if (isEditing && token) {
      fetch(`/api/products`) // For admin we should ideally have a specific GET by ID, but products works
        .then(res => res.json())
        .then(data => {
          const prod = data.find((p: any) => p.id === Number(id));
          if (prod) {
            setFormData({
              ...prod,
              length: prod.dimensions?.length || '',
              width: prod.dimensions?.width || '',
              height: prod.dimensions?.height || '',
              subcategoryId: prod.subcategoryId || '',
            });
            return fetch(`/api/admin/products/${id}/customization-options`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
        })
        .then(res => res?.json())
        .then(data => {
          if (data) {
            setCustomization(data);
          }
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
      if (name === 'name' && !isEditing) {
        setFormData((prev: any) => ({ ...prev, slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }));
      }
    }
  };

  const handleCustomizationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setCustomization((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addArrayItem = (stateKey: string, value: string, setter: any, inputSetter: any) => {
    if (value.trim()) {
      setter((prev: any) => ({ ...prev, [stateKey]: [...(prev[stateKey] || []), value.trim()] }));
      inputSetter('');
    }
  };

  const removeArrayItem = (stateKey: string, index: number, setter: any) => {
    setter((prev: any) => {
      const arr = [...(prev[stateKey] || [])];
      arr.splice(index, 1);
      return { ...prev, [stateKey]: arr };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        dimensions: { length: formData.length, width: formData.width, height: formData.height },
        subcategoryId: formData.subcategoryId ? Number(formData.subcategoryId) : null,
      };
      
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing ? `/api/admin/products/${id}` : `/api/admin/products`;
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error(await res.text());
      const savedProduct = await res.json();
      
      if (formData.isCustomizationEnabled) {
        const custRes = await fetch(`/api/admin/products/${savedProduct.id}/customization-options`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(customization)
        });
        if (!custRes.ok) throw new Error(await custRes.text());
      }
      
      alert('Product saved successfully');
      navigate('/admin/products');
    } catch (err: any) {
      console.error(err);
      alert('Error saving product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/products')} className="p-2 hover:bg-surface-container rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Basic Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Name *</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Slug</label>
                <input required name="slug" value={formData.slug} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Short Description</label>
              <input name="shortDescription" value={formData.shortDescription} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Full Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container min-h-[100px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Brand</label>
                <input name="brand" value={formData.brand} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Subcategory ID</label>
                <input type="number" name="subcategoryId" value={formData.subcategoryId} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Pricing & Inventory</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Price *</label>
                <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Sale Price</label>
                <input type="number" step="0.01" name="salePrice" value={formData.salePrice} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Cost Price</label>
                <input type="number" step="0.01" name="costPrice" value={formData.costPrice} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">GST %</label>
                <input type="number" step="0.01" name="gstPercent" value={formData.gstPercent} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">SKU *</label>
                <input required name="sku" value={formData.sku} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Barcode</label>
                <input name="barcode" value={formData.barcode} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Stock Qty</label>
                <input type="number" name="inventoryCount" value={formData.inventoryCount} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Low Stock Thresh</label>
                <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Weight</label>
                <input type="number" step="0.01" name="weight" value={formData.weight} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Length</label>
                <input type="number" name="length" value={formData.length} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Width</label>
                <input type="number" name="width" value={formData.width} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Height</label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              </div>
            </div>
          </div>

          {/* Gifting Options */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Gifting Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isCustomizationEnabled" checked={formData.isCustomizationEnabled} onChange={handleChange} className="w-4 h-4" />
                Customization Enabled
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isPersonalizationEnabled" checked={formData.isPersonalizationEnabled} onChange={handleChange} className="w-4 h-4" />
                Personalization Enabled
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="hasGreetingCard" checked={formData.hasGreetingCard} onChange={handleChange} className="w-4 h-4" />
                Greeting Card Available
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isGiftBoxCompatible" checked={formData.isGiftBoxCompatible} onChange={handleChange} className="w-4 h-4" />
                Gift Box Compatible
              </label>
            </div>

            {formData.isCustomizationEnabled && (
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline mt-4 space-y-4">
                <h4 className="font-bold text-sm">Customization Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="canEngrave" checked={customization.canEngrave} onChange={handleCustomizationChange} className="w-4 h-4" />
                    Can Engrave
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="canUploadImage" checked={customization.canUploadImage} onChange={handleCustomizationChange} className="w-4 h-4" />
                    Can Upload Image
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="canUploadLogo" checked={customization.canUploadLogo} onChange={handleCustomizationChange} className="w-4 h-4" />
                    Can Upload Logo
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="canWriteMessage" checked={customization.canWriteMessage} onChange={handleCustomizationChange} className="w-4 h-4" />
                    Can Write Message
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1">Max Customizations</label>
                    <input type="number" name="maxCustomizations" value={customization.maxCustomizations} onChange={handleCustomizationChange} className="w-full px-3 py-1.5 border border-outline rounded-lg bg-surface" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Extra Charge</label>
                    <input type="number" step="0.01" name="extraCharge" value={customization.extraCharge} onChange={handleCustomizationChange} className="w-full px-3 py-1.5 border border-outline rounded-lg bg-surface" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Media */}
          <div className="bg-surface p-6 rounded-2xl border border-outline shadow-sm space-y-4">
            <h3 className="font-bold border-b border-outline pb-2">Media</h3>
            <div>
              <label className="block text-xs font-bold mb-1">Main Image URL</label>
              <input name="image" value={formData.image} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
              {formData.image && <img src={formData.image} alt="preview" className="mt-2 w-full h-32 object-cover rounded-lg border border-outline" />}
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Video URL</label>
              <input name="video" value={formData.video} onChange={handleChange} className="w-full px-3 py-2 border border-outline rounded-lg bg-surface-container" />
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
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isBestseller" checked={formData.isBestseller} onChange={handleChange} className="w-4 h-4" />
                Bestseller
              </label>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" name="isRecommended" checked={formData.isRecommended} onChange={handleChange} className="w-4 h-4" />
                Recommended
              </label>
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-bold py-3 rounded-lg hover:opacity-90 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
