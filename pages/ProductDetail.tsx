
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Share2, 
  Heart, 
  CheckCircle2, 
  TrendingUp,
  Eye,
  MessageCircle
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import { useStore } from '../App';
import { Product } from '../types';
import { getAIRecommendations } from '../services/geminiService';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, setChatOpen, setChatInitialMessage } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [alsoViewed, setAlsoViewed] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const found = MOCK_PRODUCTS.find(p => p.id === id);
    if (found) {
      setProduct(found);
      setSelectedImage(0);
      window.scrollTo(0, 0);
      
      const fetchRecs = async () => {
        const recIds = await getAIRecommendations(found.name + " " + found.category, MOCK_PRODUCTS);
        const recList = MOCK_PRODUCTS.filter(p => recIds.includes(p.id) && p.id !== id);
        setRecommendations(recList.length > 0 ? recList : MOCK_PRODUCTS.slice(0, 3).filter(p => p.id !== id));
      };
      fetchRecs();

      const viewed = MOCK_PRODUCTS
        .filter(p => p.category === found.category && p.id !== id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);
      setAlsoViewed(viewed);
    }
  }, [id]);

  const handleInquiry = () => {
    if (product) {
      setChatInitialMessage(`أهلاً، أود الاستفسار عن منتج: ${product.name}`);
      setChatOpen(true);
    }
  };

  if (!product) return <div className="py-20 text-center">جاري التحميل...</div>;

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-4 md:p-8 rounded-2xl shadow-sm border">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border">
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition ${selectedImage === idx ? 'border-secondary' : 'border-transparent'}`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
            <Link to="/" className="hover:text-secondary">الرئيسية</Link>
            <span>/</span>
            <Link to={`/?cat=${product.category}`} className="hover:text-secondary">{product.category}</Link>
          </div>
          
          <h1 className="text-3xl font-extrabold text-primary">{product.name}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-yellow-400">
              <Star fill="currentColor" size={18} />
              <span className="text-primary font-bold">{product.rating}</span>
            </div>
            <span className="text-gray-400 text-sm">({product.reviews} تقييم)</span>
            <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
              <CheckCircle2 size={16} /> متوفر
            </div>
          </div>

          <div className="p-6 bg-gray-50 rounded-xl space-y-2 border border-gray-100">
            {product.isOffer ? (
              <div className="space-y-1">
                <div className="text-gray-400 line-through text-lg">{product.price.toLocaleString()} د.ع</div>
                <div className="text-secondary text-4xl font-extrabold">{product.discountPrice?.toLocaleString()} د.ع</div>
              </div>
            ) : (
              <div className="text-primary text-4xl font-extrabold">{product.price.toLocaleString()} د.ع</div>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-orange-600 transition shadow-lg"
            >
              <ShoppingCart size={24} /> أضف إلى السلة
            </button>
            <button 
              onClick={handleInquiry}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition shadow-lg"
            >
              <MessageCircle size={24} /> دردشة مع الإدارة
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-6 border-t">
             <div className="text-center p-2">
                <Truck className="mx-auto text-secondary mb-1" size={20} />
                <span className="text-[10px] block font-bold">توصيل سريع</span>
             </div>
             <div className="text-center p-2">
                <ShieldCheck className="mx-auto text-secondary mb-1" size={20} />
                <span className="text-[10px] block font-bold">ضمان أصلي</span>
             </div>
             <div className="text-center p-2">
                <RotateCcw className="mx-auto text-secondary mb-1" size={20} />
                <span className="text-[10px] block font-bold">إرجاع سهل</span>
             </div>
          </div>
        </div>
      </div>

      {/* Recommended by AI */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
           <TrendingUp className="text-secondary" />
           مقترحات الذكاء الاصطناعي
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {recommendations.map(p => (
            <Link 
              key={p.id} 
              to={`/product/${p.id}`} 
              className="bg-white p-4 rounded-xl border hover:shadow-lg transition group"
            >
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-3">
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition" />
              </div>
              <h4 className="font-bold text-sm mb-2 line-clamp-1">{p.name}</h4>
              <div className="text-secondary font-bold">{(p.discountPrice || p.price).toLocaleString()} د.ع</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
