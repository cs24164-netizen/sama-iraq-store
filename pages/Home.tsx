
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Star, Heart, TrendingUp, ShieldCheck, Truck, RotateCcw, Search, Sparkles } from 'lucide-react';
import { MOCK_PRODUCTS, CATEGORIES } from '../constants';
import { useStore } from '../App';
import { Product } from '../types';

interface HomeProps {
  showOffersOnly?: boolean;
}

export default function Home({ showOffersOnly }: HomeProps) {
  const { addToCart } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const categoryFilter = queryParams.get('cat');
  const searchQuery = queryParams.get('q');
  const minPrice = queryParams.get('min');
  const maxPrice = queryParams.get('max');

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    let list = [...MOCK_PRODUCTS];
    
    // Set New Arrivals for specific section
    setNewArrivals(list.filter(p => p.isNew).slice(0, 6));

    if (showOffersOnly) {
      list = list.filter(p => p.isOffer);
    }
    
    if (categoryFilter) {
      list = list.filter(p => p.category === categoryFilter);
    }

    if (searchQuery) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (minPrice) {
      list = list.filter(p => (p.discountPrice || p.price) >= parseInt(minPrice));
    }

    if (maxPrice) {
      list = list.filter(p => (p.discountPrice || p.price) <= parseInt(maxPrice));
    }

    setFilteredProducts(list);
  }, [categoryFilter, showOffersOnly, searchQuery, minPrice, maxPrice]);

  const hasActiveFilters = categoryFilter || searchQuery || minPrice || maxPrice;

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      {!hasActiveFilters && !showOffersOnly && (
        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[16/6] md:aspect-[21/7] bg-primary">
          <img 
            src="https://picsum.photos/seed/sama-iraq-banner/1200/400" 
            alt="العروض الكبرى" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white space-y-4">
            <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold w-fit">عروض نهاية الأسبوع</span>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              خصومات تصل إلى <span className="text-secondary">50%</span> <br /> 
              على جميع الموبايلات
            </h1>
            <p className="text-gray-200 text-sm md:text-lg max-w-lg">
              لا تفوت الفرصة! اشتري الآن أفضل الأجهزة من سما العراق بأسعار لا تقبل المنافسة وتوصيل سريع.
            </p>
            <button className="bg-white text-primary px-8 py-3 rounded-lg font-bold w-fit hover:bg-secondary hover:text-white transition-all transform hover:scale-105 shadow-lg">
              تسوق الآن
            </button>
          </div>
        </div>
      )}

      {/* Trust Features */}
      {!hasActiveFilters && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Truck className="text-secondary" />, title: 'توصيل سريع', desc: 'لكل محافظات العراق' },
            { icon: <ShieldCheck className="text-secondary" />, title: 'ضمان أصلي', desc: 'منتجات أصلية 100%' },
            { icon: <RotateCcw className="text-secondary" />, title: 'إرجاع سهل', desc: 'خلال 7 أيام عمل' },
            { icon: <TrendingUp className="text-secondary" />, title: 'أفضل الأسعار', desc: 'عروض حصرية يومية' },
          ].map((feat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-full">{feat.icon}</div>
              <div>
                <h4 className="font-bold text-sm">{feat.title}</h4>
                <p className="text-xs text-gray-500">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Arrivals Section */}
      {!hasActiveFilters && !showOffersOnly && newArrivals.length > 0 && (
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-accent" />
              وصل حديثاً
            </h2>
            <Link to="/?q=جديد" className="text-accent text-sm font-bold hover:underline">عرض الكل</Link>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
             {newArrivals.map(product => (
               <div key={product.id} className="flex-shrink-0 w-48 md:w-60 bg-gray-50 rounded-2xl p-4 group hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-accent/10">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-4">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <span className="absolute top-2 right-2 bg-accent text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">جديد</span>
                  </div>
                  <h4 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h4>
                  <div className="text-primary font-black">{(product.discountPrice || product.price).toLocaleString()} د.ع</div>
                  <Link to={`/product/${product.id}`} className="mt-4 block text-center text-xs font-bold text-accent py-2 bg-accent/5 rounded-lg group-hover:bg-accent group-hover:text-white transition">التفاصيل</Link>
               </div>
             ))}
          </div>
        </section>
      )}

      {/* Categories Horizontal */}
      {!showOffersOnly && !hasActiveFilters && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="w-2 h-8 bg-secondary rounded-full"></span>
              تسوق حسب القسم
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
            {CATEGORIES.map(cat => (
              <Link 
                to={`/?cat=${cat.name}`} 
                key={cat.id} 
                className="flex-shrink-0 w-28 md:w-40 bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:border-secondary transition-all hover:shadow-md group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary/10 transition">
                  <span className="text-gray-600 group-hover:text-secondary transition text-xl">📦</span>
                </div>
                <span className="font-bold text-sm md:text-base">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Product Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="w-2 h-8 bg-secondary rounded-full"></span>
            {showOffersOnly ? 'عروض نهاية الأسبوع' : (hasActiveFilters ? 'منتجات مختارة' : 'كل المنتجات')}
          </h2>
          {filteredProducts.length > 0 && <span className="text-gray-500 text-sm">{filteredProducts.length} منتج</span>}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">لا توجد منتجات تطابق معاييرك</h3>
            <p className="text-gray-400 text-sm mt-1">حاول البحث بكلمات أخرى أو تقليل الفلاتر.</p>
            <Link to="/" className="mt-6 inline-block text-secondary font-bold hover:underline">العودة للمتجر الرئيسي</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col h-full relative">
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                  {product.isOffer && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm text-center">خصم حصرى</span>
                  )}
                  {product.isNew && (
                    <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm text-center">جديد</span>
                  )}
                </div>
                <Link to={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-gray-50">
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </Link>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1 text-yellow-400 mb-1">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] text-gray-400 font-bold">{product.rating} ({product.reviews})</span>
                  </div>
                  <Link to={`/product/${product.id}`} className="font-bold text-sm mb-2 hover:text-secondary line-clamp-2 min-h-[40px]">
                    {product.name}
                  </Link>
                  <div className="mt-auto">
                    {product.isOffer ? (
                      <div className="flex flex-col">
                        <span className="text-secondary font-bold text-lg">{product.discountPrice?.toLocaleString()} د.ع</span>
                        <span className="text-gray-400 line-through text-xs">{product.price.toLocaleString()} د.ع</span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold text-lg">{product.price.toLocaleString()} د.ع</span>
                    )}
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full mt-4 bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary transition font-bold text-sm"
                    >
                      <ShoppingCart size={16} /> أضف للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badge Section */}
      {!hasActiveFilters && (
        <section className="bg-secondary/10 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-extrabold text-primary mb-2">تطبيق سما العراق قادم قريباً</h3>
            <p className="text-gray-600">احصل على أفضل تجربة تسوق مباشرة من هاتفك مع إشعارات حصرية للعروض.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-primary text-white p-3 rounded-xl flex items-center gap-3 w-40 cursor-not-allowed opacity-50">
              <span className="text-2xl">📱</span>
              <div className="text-[10px]">حمل من <br/><span className="text-xs font-bold">App Store</span></div>
            </div>
            <div className="bg-primary text-white p-3 rounded-xl flex items-center gap-3 w-40 cursor-not-allowed opacity-50">
              <span className="text-2xl">🤖</span>
              <div className="text-[10px]">حمل من <br/><span className="text-xs font-bold">Google Play</span></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
