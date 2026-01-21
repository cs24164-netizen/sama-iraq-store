
import React, { useState, useMemo } from 'react';
import { Package, Truck, CheckCircle2, Clock, Search, MapPin, Filter, X, Calendar, AlertCircle } from 'lucide-react';
import { useStore } from '../App';
import { Navigate, Link } from 'react-router-dom';

export default function Orders() {
  const { user, orders } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!user) return <Navigate to="/login?redirect=orders" />;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search by Order ID
      const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by Status
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      // Filter by Date Range
      const orderDate = new Date(order.date);
      const matchesStartDate = !startDate || orderDate >= new Date(startDate);
      // For end date, we check if it's before or equal to the selected date (end of day)
      const matchesEndDate = !endDate || orderDate <= new Date(endDate + 'T23:59:59');

      return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, searchQuery, statusFilter, startDate, endDate]);

  const clearFilters = () => {
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const hasActiveFilters = statusFilter !== 'all' || startDate || endDate || searchQuery;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
          <Package className="text-secondary" size={32} /> طلباتي
        </h1>
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="ابحث برقم الطلب..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 border rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary" 
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 font-bold text-primary">
            <Filter size={18} className="text-secondary" />
            <span>خيارات التصفية والفرز</span>
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition"
            >
              <X size={14} /> مسح جميع الفلاتر
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 mr-1">حالة الطلب</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border bg-gray-50 text-sm focus:ring-2 focus:ring-secondary focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التوصيل</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 mr-1">من تاريخ</label>
            <div className="relative">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-gray-50 text-sm focus:ring-2 focus:ring-secondary focus:outline-none pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 mr-1">إلى تاريخ</label>
            <div className="relative">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border bg-gray-50 text-sm focus:ring-2 focus:ring-secondary focus:outline-none pl-10"
              />
              <Calendar className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
              <div className="p-6 border-b bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                 <div className="flex gap-8 md:gap-12">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">تاريخ الطلب</p>
                      <p className="font-bold text-sm">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">رقم الطلب</p>
                      <p className="font-bold text-sm text-secondary">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">الإجمالي</p>
                      <p className="font-bold text-sm">{order.total?.toLocaleString()} د.ع</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                   <Link 
                     to={`/track/${order.id}`} 
                     className="bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-orange-600 transition flex items-center gap-2 shadow-sm"
                   >
                      <MapPin size={14} /> تتبع الطلب
                   </Link>
                   <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 transition shadow-sm">
                     تفاصيل الطلب
                   </button>
                 </div>
              </div>
              
              <div className="p-8">
                 <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 z-0"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-secondary -translate-y-1/2 z-0 transition-all duration-1000"
                      style={{ 
                        width: order.status === 'delivered' ? '100%' : 
                               order.status === 'shipped' ? '66%' : 
                               (order.status === 'processing' || order.status === 'pending') ? '33%' : '0%' 
                      }}
                    ></div>

                    {/* Steps */}
                    {[
                      { id: 'placed', label: 'تم الاستلام', icon: <Clock size={16}/>, active: true },
                      { id: 'processing', label: 'قيد المعالجة', icon: <Package size={16}/>, active: ['pending', 'processing', 'shipped', 'delivered'].includes(order.status) },
                      { id: 'shipped', label: 'تم الشحن', icon: <Truck size={16}/>, active: ['shipped', 'delivered'].includes(order.status) },
                      { id: 'delivered', label: 'تم التوصيل', icon: <CheckCircle2 size={16}/>, active: order.status === 'delivered' }
                    ].map((step, idx) => (
                      <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${
                           step.active ? 'bg-secondary text-white border-white' : 'bg-white text-gray-300 border-gray-100'
                         }`}>
                            {step.icon}
                         </div>
                         <span className={`text-[10px] font-bold ${step.active ? 'text-primary' : 'text-gray-400'}`}>{step.label}</span>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">لا توجد نتائج تطابق بحثك</h3>
            <p className="text-gray-400 text-sm mt-1">حاول تغيير معايير التصفية أو البحث برقم طلب آخر.</p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="mt-6 text-secondary font-bold hover:underline text-sm"
              >
                مسح جميع الفلاتر والعودة للكل
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
