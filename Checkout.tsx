
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, Truck, ShieldCheck, MapPin, ShoppingCart } from 'lucide-react';
import { useStore } from '../App';
import { Province, Order } from '../types';

export default function Checkout() {
  const { cart, removeFromCart, addToCart, clearCart, user, placeOrder } = useStore();
  const navigate = useNavigate();
  const [province, setProvince] = useState<string>(Province.BAGHDAD);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  const subtotal = cart.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);
  const shipping = province === Province.BAGHDAD ? 5000 : 8000;
  const total = subtotal + (cart.length > 0 ? shipping : 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=checkout');
      return;
    }
    if (cart.length === 0) return;
    
    setIsSubmitting(true);
    // محاكاة الطلب
    const id = `SAM-${Math.floor(Math.random() * 10000)}`;
    setOrderId(id);

    // Fix: Corrected Order object properties to match types.ts
    const newOrder: Order = {
      id: id,
      userId: user.email,
      total: total,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      province: province as Province,
      shippingAddress: address,
      items: [...cart]
    };

    await new Promise(r => setTimeout(r, 1500));
    placeOrder(newOrder);
    setIsSubmitting(false);
    setOrderComplete(true);
    clearCart();
  };

  if (orderComplete) {
    return (
      <div className="py-20 text-center space-y-6 max-w-lg mx-auto bg-white p-12 rounded-2xl shadow-sm border">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Truck size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-primary">شكراً لطلبك!</h1>
        <p className="text-gray-500">رقم طلبك هو <span className="font-bold text-secondary">#{orderId}</span>. سنتصل بك قريباً لتأكيد الموعد.</p>
        <div className="flex flex-col gap-3">
          <Link to={`/track/${orderId}`} className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition">
            تتبع طلبي الآن
          </Link>
          <Link to="/" className="text-gray-400 font-bold hover:underline">
            العودة للتسوق
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={40} className="text-gray-300" />
        </div>
        <h1 className="text-2xl font-bold">سلة التسوق فارغة</h1>
        <p className="text-gray-400">لم تقم بإضافة أي منتجات للسلة بعد.</p>
        <Link to="/" className="inline-block bg-secondary text-white px-8 py-3 rounded-xl font-bold">تسوق الآن</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Items Section */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <ShoppingCart className="text-secondary" />
          سلة التسوق ({cart.length} منتجات)
        </h1>
        
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 group">
              <img src={item.images[0]} alt={item.name} className="w-20 h-20 rounded-lg object-cover border" />
              <div className="flex-1">
                <Link to={`/product/${item.id}`} className="font-bold text-sm hover:text-secondary mb-1 block">{item.name}</Link>
                <div className="text-secondary font-bold">{(item.discountPrice || item.price).toLocaleString()} د.ع</div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border">
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="hover:text-red-600 transition p-1"
                >
                  <Minus size={16} />
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => addToCart(item)}
                  className="hover:text-secondary transition p-1"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-gray-300 hover:text-red-500 transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Shipping Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-4">
            <MapPin className="text-secondary" /> معلومات التوصيل
          </h3>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">المحافظة</label>
                <select 
                  className="w-full p-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-secondary focus:outline-none"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                >
                  {Object.values(Province).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">رقم الهاتف (للتواصل)</label>
                <input 
                  type="tel" 
                  placeholder="07XX XXX XXXX"
                  className="w-full p-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-secondary focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
             </div>
             <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700">العنوان بالتفصيل (منطقة، شارع، دار)</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-lg border bg-gray-50 focus:ring-2 focus:ring-secondary focus:outline-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
             </div>
          </form>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-6 lg:sticky lg:top-24">
        <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
          <h3 className="font-bold text-lg border-b pb-4">ملخص الطلب</h3>
          <div className="flex justify-between text-gray-600">
            <span>المجموع الفرعي</span>
            <span>{subtotal.toLocaleString()} د.ع</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>تكلفة التوصيل ({province})</span>
            <span>{shipping.toLocaleString()} د.ع</span>
          </div>
          <div className="flex justify-between items-center text-xl font-extrabold text-primary pt-4 border-t">
            <span>الإجمالي</span>
            <span className="text-secondary">{total.toLocaleString()} د.ع</span>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-3 border border-dashed border-gray-300">
             <CreditCard className="text-gray-400 mt-1" size={20} />
             <div>
                <p className="text-xs font-bold text-gray-700">الدفع عند الاستلام</p>
                <p className="text-[10px] text-gray-500">متوفر حالياً لجميع محافظات العراق.</p>
             </div>
          </div>

          <button 
            onClick={handlePlaceOrder}
            disabled={isSubmitting || !phone || !address}
            className={`w-full py-4 rounded-xl font-bold transition shadow-lg ${isSubmitting || !phone || !address ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'}`}
          >
            {isSubmitting ? 'جاري إتمام الطلب...' : 'إتمام الطلب الآن'}
          </button>
          
          <div className="flex flex-col gap-2 pt-4">
            <div className="flex items-center gap-2 text-green-600 text-[10px] font-bold">
              <ShieldCheck size={14} /> حماية المشتري كاملة
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-[10px]">
              <Truck size={14} /> توصيل آمن وموثوق لجميع المحافظات
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
