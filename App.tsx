
import React, { useState, useEffect, createContext, useContext, useRef, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  ShoppingCart, Search, Menu, X, Star, Trash2, Package, LogOut, LogIn, 
  LayoutDashboard, Sparkles, ShieldCheck, Layers, MessageCircle, Send, MapPin, Phone
} from 'lucide-react';

import { Product, User, CartItem, Category, Order, ChatMessage } from './types';
import { CATEGORIES, ADMIN_CREDENTIALS } from './constants';
import { db } from './services/databaseService';
import { getSmartSearchSuggestions } from './services/geminiService';

// الاستيراد الكسول لتحسين الأداء وتجنب أخطاء التحميل الأولي
const Home = React.lazy(() => import('./pages/Home'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const Login = React.lazy(() => import('./pages/Login'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Orders = React.lazy(() => import('./pages/Orders'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));

interface StoreContextType {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  user: User | null;
  chats: ChatMessage[];
  customers: User[];
  isChatOpen: boolean;
  pendingMessage: string;
  setChatOpen: (o: boolean) => void;
  setChatInitialMessage: (m: string) => void;
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  login: (u: User) => void;
  logout: () => void;
  sendChatMessage: (t: string, isAdmin?: boolean, targetUser?: string) => void;
  markChatsAsRead: (userId: string) => void;
  placeOrder: (o: Order) => void;
  updateOrderStatus: (id: string, s: string) => void;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
export const useStore = () => {
  const c = useContext(StoreContext);
  if (!c) throw new Error("useStore error");
  return c;
};

const ChatWidget = () => {
  const { user, chats, sendChatMessage, isChatOpen, setChatOpen, pendingMessage, setChatInitialMessage } = useStore();
  const [msg, setMsg] = useState('');
  const scroll = useRef<HTMLDivElement>(null);
  const loc = useLocation();

  // Fix: Consumer for pendingMessage from product detail inquiry
  useEffect(() => {
    if (pendingMessage) {
      setMsg(pendingMessage);
      setChatInitialMessage('');
    }
  }, [pendingMessage, setChatInitialMessage]);

  useEffect(() => {
    if (scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [chats, isChatOpen]);

  if (loc.pathname.startsWith('/admin')) return null;

  const myChats = chats.filter(c => 
    (user && c.senderId === user.email) || 
    (user && c.senderId === `admin-${user.email}`) ||
    (!user && c.senderId === 'guest')
  );

  const unread = myChats.filter(c => c.isAdmin && !c.isRead).length;

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col items-end">
      {isChatOpen && (
        <div className="mb-4 w-[320px] h-[450px] bg-white rounded-3xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-4 bg-primary text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center font-bold">س</div>
              <span className="text-xs font-bold">دعم سما العراق</span>
            </div>
            <button onClick={() => setChatOpen(false)}><X size={18}/></button>
          </div>
          <div ref={scroll} className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {myChats.map(c => (
              <div key={c.id} className={`flex ${c.isAdmin ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-bold shadow-sm ${c.isAdmin ? 'bg-white text-primary border' : 'bg-secondary text-white'}`}>
                  {c.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t flex gap-2">
            <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter' && (sendChatMessage(msg), setMsg(''))} className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-[11px] outline-none" placeholder="اكتب استفسارك..." />
            <button onClick={() => {sendChatMessage(msg); setMsg('');}} className="p-2 bg-secondary text-white rounded-xl"><Send size={16}/></button>
          </div>
        </div>
      )}
      <button onClick={() => setChatOpen(!isChatOpen)} className="w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-2xl relative transition-transform hover:scale-110">
        <MessageCircle size={28} />
        {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{unread}</span>}
      </button>
    </div>
  );
};

export default function App() {
  const [products, setProducts] = useState<Product[]>(db.getProducts());
  const [orders, setOrders] = useState<Order[]>(db.getOrders());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>(db.getChats());
  const [isChatOpen, setChatOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');

  // Fix: Mock customers list for Admin Dashboard
  const customers: User[] = [
    { email: 'ali@example.com', name: 'علي حسن', role: 'customer' },
    { email: 'noor@example.com', name: 'نور الهدى', role: 'customer' }
  ];

  const sendChatMessage = (text: string, isAdmin = false, targetUser?: string) => {
    if(!text.trim()) return;
    const n: ChatMessage = {
      id: Date.now().toString(),
      senderId: isAdmin ? `admin-${targetUser}` : (user?.email || 'guest'),
      senderName: isAdmin ? 'إدارة سما' : (user?.name || 'زائر'),
      text, timestamp: new Date().toISOString(), isRead: false, isAdmin
    };
    const updated = [...chats, n];
    setChats(updated);
    db.saveChats(updated);
  };

  // Fix: markChatsAsRead implementation
  const markChatsAsRead = (userId: string) => {
    const updated = chats.map(c => 
      (c.senderId === userId && !c.isAdmin) ? { ...c, isRead: true } : c
    );
    setChats(updated);
    db.saveChats(updated);
  };

  // Fix: addProduct implementation
  const addProduct = (p: Product) => {
    const up = [...products, p];
    setProducts(up);
    db.saveProducts(up);
  };

  // Fix: updateProduct implementation
  const updateProduct = (p: Product) => {
    const up = products.map(item => item.id === p.id ? p : item);
    setProducts(up);
    db.saveProducts(up);
  };

  // Fix: deleteProduct implementation
  const deleteProduct = (id: string) => {
    const up = products.filter(p => p.id !== id);
    setProducts(up);
    db.saveProducts(up);
  };

  return (
    <Router>
      <StoreContext.Provider value={{
        products, orders, cart, user, chats, customers, isChatOpen, pendingMessage, setChatOpen,
        setChatInitialMessage: (m) => setPendingMessage(m),
        addToCart: (p) => setCart(prev => {
          const ex = prev.find(i => i.id === p.id);
          return ex ? prev.map(i => i.id === p.id ? {...i, quantity: i.quantity+1} : i) : [...prev, {...p, quantity: 1}];
        }),
        removeFromCart: (id) => setCart(prev => prev.filter(i => i.id !== id)),
        clearCart: () => setCart([]),
        login: (u) => setUser(u),
        logout: () => setUser(null),
        sendChatMessage,
        markChatsAsRead,
        placeOrder: (o) => { const up = [o, ...orders]; setOrders(up); db.saveOrders(up); },
        updateOrderStatus: (id, s) => { const up = orders.map(o => o.id === id ? {...o, status: s as any} : o); setOrders(up); db.saveOrders(up); },
        addProduct, updateProduct, deleteProduct
      }}>
        <div className="min-h-screen flex flex-col font-sans" dir="rtl">
          <nav className="bg-primary text-white sticky top-0 z-50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-secondary p-2 rounded-xl"><Layers size={22} /></div>
                <span className="text-lg font-black tracking-tight">سما <span className="text-secondary">العراق</span></span>
              </Link>
              <div className="flex items-center gap-4">
                {user?.role === 'admin' && <Link to="/admin" className="text-secondary hover:scale-110 transition"><LayoutDashboard size={22}/></Link>}
                <Link to="/orders" className="hover:text-secondary"><Package size={22}/></Link>
                <Link to="/checkout" className="relative">
                  <ShoppingCart size={22}/>
                  {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.length}</span>}
                </Link>
                {user ? (
                  <button onClick={() => setUser(null)} className="p-2 bg-white/10 rounded-xl"><LogOut size={18}/></button>
                ) : (
                  <Link to="/login" className="bg-secondary px-4 py-2 rounded-xl text-xs font-bold">دخول</Link>
                )}
              </div>
            </div>
          </nav>
          
          <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
            <Suspense fallback={<div className="py-20 text-center font-bold">جاري تحميل سما العراق...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/track/:id" element={<OrderTracking />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>

          <footer className="bg-white border-t py-10 mt-10">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
              <div className="space-y-3">
                <h4 className="font-black text-primary">عن سما العراق</h4>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">متجرنا يوفر أفضل المنتجات التقنية والطبيعية بضمان حقيقي وتوصيل فوري لجميع محافظات العراق.</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-black text-primary">تواصل معنا</h4>
                <p className="text-xs text-gray-500 font-bold flex items-center justify-center md:justify-start gap-2"><MapPin size={14} className="text-secondary"/> بغداد - الكرادة</p>
                <p className="text-xs text-gray-500 font-bold flex items-center justify-center md:justify-start gap-2"><Phone size={14} className="text-secondary"/> 6644</p>
              </div>
              <div className="space-y-3">
                <h4 className="font-black text-primary">الأمان SamaShield</h4>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 py-2 rounded-xl">
                  <ShieldCheck size={14} className="text-green-500"/> محمي بواسطة SamaShield v2.4
                </div>
              </div>
            </div>
          </footer>
          <ChatWidget />
        </div>
      </StoreContext.Provider>
    </Router>
  );
}
