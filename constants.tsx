
import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'موبايلات', icon: 'Smartphone' },
  { id: '2', name: 'إلكترونيات', icon: 'Laptop' },
  { id: '3', name: 'إكسسوارات', icon: 'Watch' },
  { id: '4', name: 'أجهزة منزلية', icon: 'Home' },
  { id: '5', name: 'منتجات طبيعية', icon: 'Leaf' },
  { id: '6', name: 'منتجات رقمية', icon: 'Cpu' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'آيفون 15 برو ماكس 256 جيجا',
    description: 'أحدث هاتف من شركة آبل مع معالج A17 Pro وكاميرا احترافية.',
    price: 1650000,
    category: 'موبايلات',
    images: ['https://picsum.photos/seed/iphone15/600/600'],
    stock: 12,
    rating: 4.8,
    reviews: 125,
    isOffer: true,
    discountPrice: 1580000,
    isNew: true
  },
  {
    id: 'p2',
    name: 'مستخلص بذور اليقطين الطبيعي',
    description: 'مشتق نباتي طبيعي 100% غني بالمعادن والفوائد الصحية، من إنتاج مزارعنا.',
    price: 35000,
    category: 'منتجات طبيعية',
    images: ['https://picsum.photos/seed/veg-derivative/600/600'],
    stock: 45,
    rating: 4.9,
    reviews: 64,
    isNew: true
  },
  {
    id: 'p3',
    name: 'ماك بوك اير M3 الجديد',
    description: 'الأداء الأسرع في العراق، مثالي للمصممين والمبرمجين.',
    price: 1850000,
    category: 'إلكترونيات',
    images: ['https://picsum.photos/seed/macm3/600/600'],
    stock: 8,
    rating: 5.0,
    reviews: 42,
    isNew: true
  }
];

export const ADMIN_CREDENTIALS = {
  email: 'cs.24.164@student.uotechnology.edu.iq',
  password: '20061128'
};
