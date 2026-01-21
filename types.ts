
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  isOffer?: boolean;
  isNew?: boolean;
  discountPrice?: number;
}

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export interface ChatMessage {
  id: string;
  senderId: string; // email or 'admin'
  senderName: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  shippingAddress: string;
  province: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export enum Province {
  BAGHDAD = 'بغداد',
  BASRA = 'البصرة',
  NINEVEH = 'نينوى',
  ERBIL = 'أربيل',
  NAJAF = 'النجف',
  KARBALA = 'كربلاء',
  DHI_QAR = 'ذي قار',
  BABYLON = 'بابل',
  ANBAR = 'الأنبار',
  DIYALA = 'ديالى',
  KIRKUK = 'كركوك',
  MUTHANNA = 'المثنى',
  QADISIYAH = 'القادسية',
  MAYSAN = 'ميسان',
  WASIT = 'واسط',
  SULAYMANIYAH = 'السليمانية',
  DUHOK = 'دهوك',
  SALAH_AL_DIN = 'صلاح الدين'
}
