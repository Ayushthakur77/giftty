export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
  badgeColor?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface CustomBoxItem {
  product: Product;
}

export interface CustomBox {
  id: string;
  name?: string;
  basePrice?: number | string;
  image?: string;
  isGiftBox?: boolean;
  items: any[];
  giftNote?: string;
  greetingCard?: string;
  ribbon?: string;
  filler?: string;
  totalPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: (CartItem | CustomBox)[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
}
