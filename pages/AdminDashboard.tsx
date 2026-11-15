
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, ShoppingBag, DollarSign, Package, Plus, Search, Edit3, Trash2, 
  CheckCircle, Clock, Truck, Eye, X, ShieldCheck, Server, RefreshCw, 
  Camera, Save, MessageSquare, Send, ChevronLeft, LayoutDashboard, Settings,
  Activity, ArrowUpRight, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useStore } from '../App';
import { Product, ChatMessage, Order } from '../types';
import { db, AuditLog } from '../services/databaseService';
import { CATEGORIES } from '../constants';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, CartesianGrid 
} from 'recharts';

const salesData = [
  { name: 'السبت', sales: 4000 },
  { name: 'الأحد', sales: 3000 },
  { name: 'الاثنين', sales: 5000 },
  { name: 'الثلاثاء', sales: 2780 },
  { name: 'الأربعاء', sales: 1890 },
  { name: 'الخميس', sales: 2390 },
  { name: 'الجمعة', sales: 3490 },
];

type Tab = 'dashboard' | 'products' | 'orders' | 'messages' | 'security' | 'settings';

export default function AdminDashboard() {
  const { 
    user, products, orders, chats, customers, 
    updateProduct, deleteProduct, addProduct, updateOrderStatus, 
    sendChatMessage, markChatsAsRead 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedUserChat, setSelectedUserChat] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const [productForm, setProductForm] = useState({
    name: '', price: '', stock: '', category: CATEGORIES[0].name, description: '', imageUrl: '', isOffer: false, discountPrice: ''
  });

  useEffect(() => {
    setLogs(db.getLogs());
    const interval = setInterval(() => setLogs(db.getLogs()), 5000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chats, selectedUserChat]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  // حساب الإحصائيات الحقيقية
  const totalSales = orders.reduce((acc, curr) => acc + curr.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // تجميع المحادثات
  const userChats = Array.from(new Set(chats.map(c => c.senderId.replace('admin-', '')))).map((userId: string) => {
    const userMessages = chats.filter(c => c.senderId === userId || c.senderId === `admin-${userId}`);
    const lastMsg = userMessages[userMessages.length - 1];
    const unreadCount = userMessages.filter(c => !c.isAdmin && !c.isRead).length;
    return { userId, lastMsg, unreadCount };
  });

  const handleSendReply = () => {
    if (!adminReply.trim() || !selectedUserChat) return;
    sendChatMessage(adminReply, true, selectedUserChat);
    setAdminReply('');
  };

  const handleSelectChat = (userId: string) => {
    setSelectedUserChat(userId);
    markChatsAsRead(userId);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => { 
    setProductForm({ name: '', price: '', stock: '', category: CATEGORIES[0].name, description: '', imageUrl: '', isOffer: false, discountPrice: '' });
    setIsEditing(false); 
    setShowProductModal(true); 
  };

  const openEditModal = (p: Product) => {
    setIsEditing(true); 
    setEditingId(p.id);
    setProductForm({
      name: p.name, price: p.price.toString(), stock: p.stock.toString(), category: p.category, 
      description: p.description, imageUrl: p.images[0], isOffer: !!p.isOffer, discountPrice: p.discountPrice?.toString() || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.imageUrl) return alert("يرجى إكمال جميع الحقول الأساسية");
    const pData: Product = {
      id: isEditing && editingId ? editingId : `p-${Date.now()}`,
      name: productForm.name, price: Number(productForm.price), stock: Number(productForm.stock),
      category: productForm.category, description: productForm.description, images: [productForm.imageUrl],
      rating: 5, reviews: 0, isNew: !isEditing, isOffer: productForm.isOffer,
      discountPrice: productForm.isOffer ? Number(productForm.discountPrice) : undefined
    };
    isEditing ? updateProduct(pData) : addProduct(pData);
    setShowProductModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12" dir="rtl">
      {/* الترويسة الرئيسية */}
      <div className="bg-primary text-white p-6 rounded-[2rem] shadow-2xl flex flex-wrap justify-between items-center gap-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center shadow-xl transform -rotate-6">
            <LayoutDashboard size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">لوحة تحكم الأدمن</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Sama Iraq Store Management</p>
          </div>
        </div>
        <div className="flex gap-2 relative z-10 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {[
            { id: 'dashboard', label: 'الرئيسية', icon: <DollarSign size={16}/> },
            { id: 'products', label: 'المنتجات', icon: <Package size={16}/> },
            { id: 'orders', label: 'الطلبات', icon: <ShoppingBag size={16}/> },
            { id: 'messages', label: 'الدردشات', icon: <MessageSquare size={16}/> },
            { id: 'security', label: 'الأمان', icon: <ShieldCheck size={16}/> },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
            >
              {tab.icon} {tab.label}
              {tab.id === 'messages' && chats.filter(c => !c.isAdmin && !c.isRead).length > 0 && (
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'إجمالي المبيعات', value: totalSales.toLocaleString() + ' د.ع', icon: <DollarSign />, color: 'bg-blue-600', trend: '+12%' },
                { label: 'الطلبات النشطة', value: pendingOrders, icon: <ShoppingBag />, color: 'bg-orange-600', trend: 'تحديث حي' },
                { label: 'إجمالي المنتجات', value: products.length, icon: <Package />, color: 'bg-green-600', trend: 'متوفر' },
                { label: 'زبائن المتجر', value: customers.length + 150, icon: <Users />, color: 'bg-indigo-600', trend: '+5 اليوم' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border shadow-sm group hover:shadow-md transition-all relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className={`${stat.color} text-white p-3 rounded-2xl shadow-lg mb-4`}>{stat.icon}</div>
                    <span className="text-[10px] font-black text-green-500 flex items-center gap-1"><ArrowUpRight size={12}/> {stat.trend}</span>
                  </div>
                  <p className="text-gray-400 text-xs font-bold mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-primary">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border shadow-sm">
                <h3 className="font-black mb-8 text-primary flex items-center gap-3">
                  <TrendingUp className="text-secondary" /> أداء المبيعات الأسبوعي
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{fontSize: 12, fontWeight: 700}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900, color: '#0F172A' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#F97316" fill="url(#colorSales)" strokeWidth={4} />
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-primary text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                 <div className="relative z-10">
                    <h3 className="font-black text-xl mb-4 flex items-center gap-3 text-secondary">
                      <ShieldCheck size={24}/> SamaShield Pro
                    </h3>
                    <p className="text-sm text-gray-400 font-bold leading-relaxed mb-8">نظام الحماية مفعل بالكامل. يتم تشفير كافة بيانات الزبائن والطلبات بنظام AES-256 المتطور.</p>
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                             <span>استقرار قاعدة البيانات</span>
                             <span className="text-green-400">99.9%</span>
                          </div>
                          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                             <div className="w-full h-full bg-green-500 shadow-[0_0_15px_#22c55e]"></div>
                          </div>
                       </div>
                       <button onClick={() => db.resetDatabase()} className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-2xl text-xs font-black transition-all border border-red-500/20 flex items-center justify-center gap-2">
                          <RefreshCw size={16}/> إعادة تهيئة النظام
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in slide-in-from-bottom-6">
            <div className="p-8 border-b flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
               <div>
                  <h3 className="font-black text-xl text-primary">إدارة المخزون والمنتجات</h3>
                  <p className="text-xs text-gray-400 font-bold mt-1">تعديل وإضافة مشتقات الخضار، الموبايلات والإلكترونيات</p>
               </div>
               <button onClick={openAddModal} className="bg-secondary text-white px-8 py-4 rounded-2xl text-sm font-black shadow-xl flex items-center gap-3 hover:bg-orange-600 transition-all hover:scale-105">
                  <Plus size={20}/> إضافة منتج جديد
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-right">
                 <thead className="bg-gray-100/50 text-gray-500 text-xs font-black uppercase tracking-widest">
                   <tr>
                     <th className="p-6">المنتج</th>
                     <th className="p-6">الفئة</th>
                     <th className="p-6">السعر</th>
                     <th className="p-6">المخزون</th>
                     <th className="p-6">الحالة</th>
                     <th className="p-6">الإجراءات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {products.map(p => (
                     <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="p-6 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl border overflow-hidden bg-white flex-shrink-0">
                           <img src={p.images[0]} className="w-full h-full object-cover" alt="" />
                         </div>
                         <span className="font-black text-sm text-primary">{p.name}</span>
                       </td>
                       <td className="p-6 text-gray-500 font-bold text-xs">{p.category}</td>
                       <td className="p-6 font-black text-primary text-sm">{p.price.toLocaleString()} د.ع</td>
                       <td className="p-6">
                         <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                           {p.stock} قطعة
                         </span>
                       </td>
                       <td className="p-6">
                         {p.isOffer ? <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[9px] font-black">عليه عرض</span> : <span className="text-gray-300 text-[9px] font-bold">عادي</span>}
                       </td>
                       <td className="p-6 flex gap-3">
                         <button onClick={() => openEditModal(p)} className="p-2.5 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition shadow-sm"><Edit3 size={16}/></button>
                         <button onClick={() => { if(window.confirm(`هل أنت متأكد من حذف المنتج: ${p.name}؟`)) deleteProduct(p.id) }} className="p-2.5 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition shadow-sm"><Trash2 size={16}/></button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in slide-in-from-right duration-500">
             <div className="p-8 border-b bg-gray-50/30">
               <h3 className="font-black text-xl text-primary">طلبات الزبائن واللوجستيك</h3>
               <p className="text-xs text-gray-400 font-bold mt-1">تتبع وتحديث حالة شحن الطلبات في جميع المحافظات</p>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-right text-xs">
                 <thead className="bg-gray-100 text-gray-500 font-black">
                    <tr><th className="p-6">رقم الطلب</th><th className="p-6">الزبون</th><th className="p-6">المحافظة</th><th className="p-6">الحالة</th><th className="p-6">المبلغ</th><th className="p-6">الإجراءات</th></tr>
                 </thead>
                 <tbody className="divide-y">
                   {orders.map(o => (
                     <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                       <td className="p-6 font-black text-secondary">#{o.id}</td>
                       <td className="p-6">
                          <p className="font-bold text-primary">{o.userId}</p>
                          <p className="text-[9px] text-gray-400">{o.date}</p>
                       </td>
                       <td className="p-6 font-bold text-gray-500">{o.province}</td>
                       <td className="p-6">
                          <select 
                            value={o.status} 
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)} 
                            className={`border rounded-xl p-2 font-black text-[10px] focus:ring-2 focus:ring-secondary outline-none ${o.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="processing">تجهيز الطلب</option>
                            <option value="shipped">تم الشحن</option>
                            <option value="delivered">تم التوصيل</option>
                          </select>
                       </td>
                       <td className="p-6 font-black text-primary">{o.total.toLocaleString()} د.ع</td>
                       <td className="p-6">
                          <Link to={`/track/${o.id}`} className="text-primary hover:text-secondary font-black flex items-center gap-2 transition">
                             <Eye size={16}/> عرض المسار
                          </Link>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {orders.length === 0 && <div className="p-20 text-center text-gray-400 font-black">لا توجد طلبات مسجلة حالياً.</div>}
             </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
             <div className="bg-white rounded-[2.5rem] border shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                   <h3 className="font-black text-primary text-sm">محادثات الزبائن</h3>
                   {userChats.length > 0 && <span className="bg-secondary text-white text-[9px] px-2 py-1 rounded-full font-black">{userChats.length}</span>}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                   {userChats.map(chat => (
                     <button 
                       key={chat.userId} 
                       onClick={() => handleSelectChat(chat.userId)}
                       className={`w-full text-right p-5 border-b hover:bg-gray-50 transition-colors flex items-center gap-4 ${selectedUserChat === chat.userId ? 'bg-orange-50 border-r-4 border-r-secondary' : ''}`}
                     >
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center font-black text-primary border shadow-inner">
                           {chat.userId.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                              <h4 className="font-black text-xs text-primary truncate">{chat.userId}</h4>
                              <span className="text-[9px] text-gray-400">{new Date(chat.lastMsg.timestamp).toLocaleTimeString('ar-IQ', {hour:'2-digit', minute:'2-digit'})}</span>
                           </div>
                           <p className="text-[10px] text-gray-500 truncate font-bold">{chat.lastMsg.text}</p>
                        </div>
                        {chat.unreadCount > 0 && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                     </button>
                   ))}
                </div>
             </div>
             
             <div className="lg:col-span-2 bg-white rounded-[2.5rem] border shadow-sm flex flex-col overflow-hidden">
                {selectedUserChat ? (
                  <>
                    <div className="p-6 border-b bg-gray-50/50 flex justify-between items-center">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black shadow-lg">{selectedUserChat.charAt(0).toUpperCase()}</div>
                          <div>
                             <h4 className="font-black text-sm text-primary">{selectedUserChat}</h4>
                             <p className="text-[10px] text-green-500 font-black flex items-center gap-1">نشط الآن</p>
                          </div>
                       </div>
                       <button onClick={() => setSelectedUserChat(null)} className="p-2 hover:bg-gray-200 rounded-xl transition text-gray-400"><X size={20}/></button>
                    </div>
                    <div ref={chatScrollRef} className="flex-1 p-8 overflow-y-auto space-y-6 bg-gray-50/20 custom-scrollbar">
                       {chats.filter(c => c.senderId === selectedUserChat || c.senderId === `admin-${selectedUserChat}`).map(msg => (
                         <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start flex-row-reverse' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-4 rounded-3xl shadow-sm text-xs font-bold leading-relaxed ${msg.isAdmin ? 'bg-primary text-white rounded-tr-none' : 'bg-white border text-primary rounded-tl-none'}`}>
                               {msg.text}
                               <p className={`text-[8px] mt-2 opacity-50 ${msg.isAdmin ? 'text-left' : 'text-right'}`}>
                                 {new Date(msg.timestamp).toLocaleTimeString('ar-IQ')}
                               </p>
                            </div>
                         </div>
                       ))}
                    </div>
                    <div className="p-6 bg-white border-t flex gap-4">
                       <input 
                         type="text" 
                         placeholder="اكتب رسالتك الرسمية هنا..." 
                         className="flex-1 bg-gray-50 border rounded-2xl px-6 py-4 text-xs font-black focus:ring-2 focus:ring-secondary outline-none"
                         value={adminReply}
                         onChange={e => setAdminReply(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                       />
                       <button onClick={handleSendReply} className="bg-secondary text-white p-4 rounded-2xl shadow-xl hover:bg-orange-600 transition transform active:scale-95">
                          <Send size={24} />
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                     <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-200 border-2 border-dashed">
                        <MessageSquare size={48} />
                     </div>
                     <div>
                        <h3 className="font-black text-lg text-primary">مركز تواصل زبائن سما</h3>
                        <p className="text-xs text-gray-400 font-bold max-w-xs mx-auto mt-2">اختر أحد الزبائن من القائمة الجانبية للرد على استفساراته وتقديم الدعم الفني له.</p>
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden animate-in zoom-in duration-500">
             <div className="p-8 border-b bg-primary text-white flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="bg-secondary p-3 rounded-2xl shadow-lg"><Activity size={24}/></div>
                   <div>
                      <h3 className="font-black text-lg">سجل العمليات والأمان (Audit Log)</h3>
                      <p className="text-xs text-white/50 font-bold uppercase tracking-widest">SamaShield System Logs</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> نظام آمن
                </div>
             </div>
             <div className="p-4 bg-black/90 font-mono text-[10px] text-green-500 h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                   <p className="text-white/30 border-b border-white/5 pb-2"># SAMASHIELD_SECURE_LOGS [VERSION 2.4.0]</p>
                   {logs.map(log => (
                     <p key={log.id} className={`flex gap-4 p-2 rounded hover:bg-white/5 ${log.status === 'error' ? 'text-red-400' : log.status === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                        <span className="text-white/40">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className="font-bold">[{log.type.toUpperCase()}]</span>
                        <span className="text-white">USER: {log.user}</span>
                        <span className="flex-1">ACTION: {log.action}</span>
                        <span className="font-black">STATUS: {log.status.toUpperCase()}</span>
                     </p>
                   ))}
                </div>
             </div>
          </div>
        )}
      </div>

      {/* مودال المنتجات */}
      {showProductModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[200] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20">
              <div className="p-8 bg-primary text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-secondary rounded-2xl shadow-lg transform rotate-6">{isEditing ? <Edit3 size={24} /> : <Plus size={24} />}</div>
                    <h3 className="text-xl font-black">{isEditing ? 'تعديل بيانات المنتج' : 'إضافة منتج للسوق'}</h3>
                 </div>
                 <button onClick={() => setShowProductModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-all relative z-10"><X size={24}/></button>
              </div>
              <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <label className="relative group cursor-pointer aspect-square rounded-[2rem] border-4 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-secondary/40">
                       {productForm.imageUrl ? (
                         <>
                           <img src={productForm.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-black text-xs">
                             تغيير الصورة
                           </div>
                         </>
                       ) : (
                         <div className="text-center p-6 space-y-3">
                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-secondary"><Camera size={32}/></div>
                           <p className="text-xs font-black text-primary">ارفع صورة المنتج</p>
                         </div>
                       )}
                       <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">اسم المنتج</label>
                          <input type="text" className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-secondary" value={productForm.name} onChange={e=>setProductForm({...productForm, name: e.target.value})} placeholder="مثال: لوشن اليقطين الطبيعي" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">السعر (د.ع)</label>
                          <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl font-black text-sm outline-none focus:ring-2 focus:ring-secondary" value={productForm.price} onChange={e=>setProductForm({...productForm, price: e.target.value})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">المخزون الحالي</label>
                          <input type="number" className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-secondary" value={productForm.stock} onChange={e=>setProductForm({...productForm, stock: e.target.value})} />
                       </div>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">القسم</label>
                       <select className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-sm outline-none" value={productForm.category} onChange={e=>setProductForm({...productForm, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">تفعيل عرض خاص؟</label>
                       <div className="flex gap-4">
                          <label className={`flex-1 p-4 rounded-2xl border font-black text-xs cursor-pointer transition flex items-center justify-center gap-2 ${productForm.isOffer ? 'bg-orange-50 border-secondary text-secondary' : 'bg-gray-50 text-gray-400'}`}>
                             <input type="checkbox" className="hidden" checked={productForm.isOffer} onChange={e=>setProductForm({...productForm, isOffer: e.target.checked})} />
                             {productForm.isOffer ? <CheckCircle size={16}/> : <div className="w-4 h-4 border-2 rounded-full"></div>} نعم، عرض
                          </label>
                       </div>
                    </div>
                 </div>

                 {productForm.isOffer && (
                    <div className="space-y-1 animate-in slide-in-from-top-4 duration-300">
                       <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">سعر العرض الجديد (د.ع)</label>
                       <input type="number" className="w-full p-4 bg-orange-50 border-orange-200 border rounded-2xl font-black text-sm outline-none" value={productForm.discountPrice} onChange={e=>setProductForm({...productForm, discountPrice: e.target.value})} />
                    </div>
                 )}

                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">وصف المنتج الكامل</label>
                    <textarea rows={3} className="w-full p-4 bg-gray-50 border rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-secondary" value={productForm.description} onChange={e=>setProductForm({...productForm, description: e.target.value})} placeholder="اشرح للزبائن مميزات هذا المنتج..."></textarea>
                 </div>

                 <button onClick={handleSaveProduct} className="w-full bg-primary text-white py-5 rounded-3xl font-black shadow-2xl hover:bg-secondary transition transform active:scale-[0.98] flex items-center justify-center gap-3 text-lg">
                    <Save size={24}/> {isEditing ? 'تحديث البيانات' : 'نشر المنتج في المتجر'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
