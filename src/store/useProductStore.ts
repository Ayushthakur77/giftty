import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, data: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  getProducts: () => Product[];
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Artisanal Truffle Box",
    price: 49.00,
    description: "12 Handcrafted Dark & Milk Truffles",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0HBYR_gpxNANLbHc5O3GZyrkq_HKKj7-TPjSp-CKRSdrYJt9P4lGBcdN74VLcMOnNw5XWZV_ZrfZRZP3Zm1gX4Y2rAwwKPCWALOkWY6E5WCpKP6twGdu9gH5hY3wvQc7anW1YfxQ2YvUmLr2moeZr9vbDLddu5NWllNUjespCc82wtTutIA4gHyeS6cjxKaM7ho2Em--89hNnOZSfEKu02Wsiz9Y1v249AbQM6AsNvaQRT1jEAdIVMg",
    category: "Chocolates",
    badge: "BEST SELLER"
  },
  {
    id: "2",
    name: "Engraved Memory Frame",
    price: 64.00,
    description: "Personalized Solid Oak Wood",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC030bEdig645hBz-kkByEbRU4eycFliaQh2CX-2JvVUqLbNTRgGOEbObNFROgHEsSILteGWYSvD4sHxQYTz4FxAMemMxywQgvRdqiVGAVME3OxBfj6JNfga1YEmA5b_UzZ0f7lJIO1M0cvkzrM3pte2DfjsWUbWQS1ev48_fcT8pkJqWe6eFFiaBJJcIz_NRWumzygWlzvvhAVcSK9kfe2oCb6mOe0cou5K3jmU1bHoKBXZD4eyI4jSQ",
    category: "Personalized",
  },
  {
    id: "3",
    name: "Serene Self-Care Kit",
    price: 120.00,
    description: "Curated Spa Experience at Home",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGuTmTkqCD8l-dp-PsC2fcXtGuJ6D3V10QLTObkaAwh8puD56XE9XQnp07XruhVQq2Ifo8HxGoGnskvZ64WvZLEMD9xKtKjMXhGzI0a_pzQ3S6j0Qwi5NWQt7B1z-NetvpEOeQiuf6xzLR5DFnDQSVJvaTzE3yfADt2JVC6EICWfT8stAK4PgmsNgl4b5_ZoLZbM82Z86loHOZKi3ItmcFH4Ei4NynR3eIad5n2U3EDDnugTATZ1QXWA",
    category: "Spa",
    badge: "NEW ARRIVAL",
    badgeColor: "bg-tertiary-container text-on-tertiary-container"
  },
  {
    id: "4",
    name: "Geometric Terrarium",
    price: 85.00,
    description: "Low-maintenance Indoor Greenery",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJgsGJFfXKafnGax6iyec9uR-X3ucWi8KNb5yXmwnZUdWQElikq91IIrTmjzVAtObAtnwgtajgCja7dTXYGO1bFB5ZRNrlJSbU1Q8h62n9n5s4eVnD0DJ2Y4_Zc1Petzc-8SNqoeGVoQeRP3pEUGHjV7sA22KllBdT1RRrCx_431VJW1H2M3mJT_p-91GE38UsBIHioJ67cu3yOE5Qai27PnA8oAeRMrokGhEBG6Ts_3EM0WObZSKp9g",
    category: "Home"
  }
];

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: DEFAULT_PRODUCTS,
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      updateProduct: (productId, data) => set((state) => ({
        products: state.products.map((p) => p.id === productId ? { ...p, ...data } : p)
      })),
      deleteProduct: (productId) => set((state) => ({
        products: state.products.filter((p) => p.id !== productId)
      })),
      getProducts: () => get().products,
    }),
    {
      name: 'product-storage',
    }
  )
);
