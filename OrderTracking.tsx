
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  MapPin, 
  Phone, 
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  User,
  Star,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../App';

const STATUS_STEPS = [
  { id: 'pending', label: 'تم تقديم الطلب', time: '10:00 ص', icon: Clock },
  { id: 'processing', label: 'جاري التجهيز', time: '11:30 ص', icon: ShieldCheck },
  { id: 'shipped', label: 'تم الشحن', time: '02:15 م', icon: Truck },
  { id: 'delivered', label: 'تم التوصيل', time: '--:--', icon: CheckCircle2 },
];

// بيانات مناديب التوصيل المحاكية
const DRIVERS = [
  { name: 'محمد جاسم', photo: 'https://i.pravatar.cc/150?u=jassim', rating: 4.9, phone: '07701234567' },
  { name: 'علي ستار', photo: 'https://i.pravatar.cc/150?u=ali', rating: 4.8, phone: '07809876543' },
  { name: 'كرار ناصر', photo: 'https://i.pravatar.cc/150?u=karrar', rating: 4.7, phone: '07501112233' }
];

export default function OrderTracking() {
  const { id } = useParams();
  const { orders } = useStore();
  
  // البحث عن الطلب الفعلي من الحالة العامة
  // Fix: Corrected property 'location' to 'province' to match Order interface
  const orderData = useMemo(() => {
    const found = orders.find(o => o.id === id);
    if (found) return found;
    return { id, status: 'processing', province: 'بغداد' };
  }, [orders, id]);

  const [currentStatus, setCurrentStatus] = useState(orderData.status);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // اختيار المندوب بناءً على طول معرف الطلب لضمان ثباته لهذا الطلب تحديداً
  const driver = useMemo(() => {
    const index = (id?.length || 0) % DRIVERS.length;
    return DRIVERS[index];
  }, [id]);

  const currentStep = useMemo(() => {
    const idx = STATUS_STEPS.findIndex(step => step.id === currentStatus);
    return idx === -1 ? 1 : idx;
  }, [currentStatus]);

  const [progressWidth, setProgressWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgressWidth((currentStep / (STATUS_STEPS.length - 1)) * 100);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const refreshStatus = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (currentStatus === 'pending') setCurrentStatus('processing');
      else if (currentStatus === 'processing') setCurrentStatus('shipped');
      else if (currentStatus === 'shipped') setCurrentStatus('delivered');
      setIsRefreshing(false);
    }, 1500);
  };

  // التحقق مما إذا كانت حالة الطلب تسمح بظهور المندوب
  const showDriverInfo = currentStatus === 'shipped' || currentStatus === 'delivered';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* مسار الصفحة وزر التحديث */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
          <Link to="/" className="hover:text-secondary">الرئيسية</Link>
          <ChevronLeft size={14} />
          <Link to="/orders" className="hover:text-secondary">طلباتي</Link>
          <ChevronLeft size={14} />
          <span className="text-primary">تتبع الطلب #{id}</span>
        </div>
        <button 
          onClick={refreshStatus}
          disabled={isRefreshing || currentStatus === 'delivered'}
          className="flex items-center gap-2 text-xs font-bold text-secondary hover:bg-orange-50 px-3 py-2 rounded-xl transition"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {currentStatus === 'delivered' ? 'الطلب مكتمل' : 'تحديث الحالة'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
        {/* هيدر تتبع الطلب */}
        <div className="p-8 bg-primary text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
             <div className="flex items-center gap-3 mb-2">
               <h1 className="text-2xl font-extrabold">تتبع الطلب #{id}</h1>
               <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-lg ${
                 currentStatus === 'delivered' ? 'bg-green-500' : 'bg-secondary animate-pulse'
               }`}>
                 {currentStatus === 'delivered' ? 'مكتمل' : 'قيد التتبع'}
               </span>
             </div>
             <p className="text-gray-400 text-sm">الحالة الحالية: <span className="text-white font-bold">{STATUS_STEPS[currentStep].label}</span></p>
           </div>
           
           {/* عرض معلومات المندوب فقط في حالة الشحن أو التوصيل */}
           {showDriverInfo && (
             <div className="flex items-center gap-4 bg-white/10 p-4 rounded-3xl border border-white/10 shadow-inner backdrop-blur-sm animate-in zoom-in duration-500">
                <div className="relative">
                  <img src={driver.photo} alt={driver.name} className="w-14 h-14 rounded-full border-2 border-secondary object-cover shadow-lg" />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-primary"></div>
                </div>
                <div>
                   <p className="text-xs text-gray-300 font-bold mb-0.5">مندوب التوصيل</p>
                   <p className="text-sm font-black text-white">{driver.name}</p>
                   <div className="flex items-center gap-1 text-[10px] text-yellow-400 font-black mt-1">
                      <Star size={12} fill="currentColor" /> {driver.rating} • موثوق
                   </div>
                </div>
                <div className="flex gap-3 mr-6">
                  <a 
                    href={`tel:${driver.phone}`} 
                    className="p-3 bg-secondary rounded-2xl hover:bg-orange-600 transition-all transform hover:scale-110 shadow-lg"
                    title="اتصال هاتفي"
                  >
                    <Phone size={18} />
                  </a>
                  <button 
                    className="p-3 bg-accent rounded-2xl hover:bg-blue-600 transition-all transform hover:scale-110 shadow-lg"
                    title="مراسلة فورية"
                  >
                    <MessageCircle size={18} />
                  </button>
                </div>
             </div>
           )}
        </div>

        {/* شريط التقدم المرئي */}
        <div className="p-10 border-b relative">
           <h3 className="text-lg font-bold mb-12 flex items-center gap-2">
              <Truck className="text-secondary" /> 
              {currentStatus === 'delivered' ? 'تم توصيل طلبك بنجاح' : 'جاري العمل على طلبك'}
           </h3>

           <div className="absolute top-[164px] left-10 right-10 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary transition-all duration-1000 ease-out rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                style={{ width: `${progressWidth}%` }}
              ></div>
           </div>

           <div className="flex justify-between relative z-10">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center gap-4 w-32">
                     <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-md ${
                       isCompleted ? 'bg-secondary text-white border-white scale-110' : 'bg-white text-gray-300 border-gray-100'
                     } ${isCurrent ? 'ring-8 ring-orange-50' : ''}`}>
                        <Icon size={24} />
                     </div>
                     <div className="text-center">
                        <p className={`text-xs font-bold ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>{step.label}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{isCompleted ? step.time : '--:--'}</p>
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* التحديثات والموقع */}
        <div className="grid grid-cols-1 md:grid-cols-2">
           <div className="p-8 border-l border-gray-100">
              <h4 className="font-bold mb-6 flex items-center gap-2 text-primary">
                 <Clock size={18} className="text-secondary" /> سجل التحديثات المباشرة
              </h4>
              <div className="space-y-8">
                 {STATUS_STEPS.slice(0, currentStep + 1).reverse().map((step, idx) => (
                    <div key={step.id} className="flex gap-4 relative animate-in slide-in-from-right duration-300">
                       {idx < currentStep && <div className="absolute top-6 right-2.5 w-0.5 h-10 bg-gray-100"></div>}
                       <div className={`w-5 h-5 rounded-full mt-1 border-2 z-10 ${idx === 0 ? 'bg-secondary border-secondary shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-white border-gray-200'}`}></div>
                       <div>
                          <p className={`text-sm font-bold ${idx === 0 ? 'text-primary' : 'text-gray-500'}`}>{step.label}</p>
                          {/* Fix: Property 'location' corrected to 'province' */}
                          <p className="text-xs text-gray-400">اليوم، {step.time} - {('province' in orderData ? orderData.province : 'بغداد')}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="p-8 bg-gray-50/50">
              <h4 className="font-bold mb-6 flex items-center gap-2 text-primary">
                 <MapPin size={18} className="text-secondary" /> تفاصيل التوصيل
              </h4>
              <div className="bg-white p-5 rounded-2xl border border-dashed border-gray-200 space-y-4 shadow-sm">
                 <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary border border-primary/10">
                       <MapPin size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-primary">الموقع المسجل</p>
                       {/* Fix: Property 'location' corrected to 'province' */}
                       <p className="text-xs text-gray-500 leading-relaxed">العراق، {('province' in orderData ? orderData.province : 'بغداد')}، منطقة حي الجامعة، شارع الربيع، دار 5</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary border border-primary/10">
                       <User size={20} />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-primary">المستلم</p>
                       <p className="text-xs text-gray-500">أحمد علي - 0770 123 4567</p>
                    </div>
                 </div>
              </div>

              {/* ضمان التوصيل */}
              <div className="mt-8 p-5 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
                 <div className="bg-white p-3 rounded-full shadow-md text-green-600">
                    <ShieldCheck size={28} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-green-800">توصيل آمن 100%</p>
                    <p className="text-[10px] text-green-600 font-bold mt-0.5">سيطلب منك المندوب رمز التأكيد الخاص بك عند وصوله.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* أزرار التنقل */}
      <div className="flex justify-center gap-4">
         <Link to="/orders" className="bg-white border border-gray-200 text-primary px-10 py-4 rounded-2xl font-black hover:bg-gray-50 transition shadow-sm flex items-center gap-2">
            <ArrowRight size={20} className="rotate-180" /> العودة لطلباتي
         </Link>
         <Link to="/" className="bg-primary text-white px-10 py-4 rounded-2xl font-black hover:bg-secondary transition shadow-xl transform active:scale-95">تسوق المزيد</Link>
      </div>
    </div>
  );
}
