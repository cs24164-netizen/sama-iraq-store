
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useStore } from '../App';
import { ADMIN_CREDENTIALS } from '../constants';
import { db } from '../services/databaseService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');

    // محاكاة تأخير بسيط للتحقق الأمني (SamaShield)
    await new Promise(r => setTimeout(r, 1000));

    if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
      db.log('دخول ناجح للأدمن', email, 'auth', 'success');
      login({ email, name: 'مدير المتجر', role: 'admin' });
      navigate('/admin');
    } else if (email && pass.length >= 6) {
      db.log('دخول زبون', email, 'auth', 'success');
      login({ email, name: email.split('@')[0], role: 'customer' });
      navigate(redirect);
    } else {
      db.log('محاولة دخول فاشلة', email, 'auth', 'error');
      setErr('البيانات غير صحيحة. يرجى التحقق من البريد وكلمة السر.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 animate-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10 shadow-inner">
            <ShieldCheck className="text-primary" size={40} />
          </div>
          <h2 className="text-2xl font-black text-primary">دخول آمن</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">SamaShield Secure Gateway</p>
        </div>

        {err && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3 border border-red-100 animate-shake">
            <AlertCircle size={18}/> {err}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-700 block mr-2">البريد الإلكتروني</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="example@domain.com"
                required 
              />
              <Mail className="absolute left-4 top-4 text-gray-300" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-700 block mr-2">كلمة السر</label>
            <div className="relative">
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                className="w-full p-4 bg-gray-50 border rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary outline-none transition-all" 
                placeholder="••••••••"
                required 
              />
              <Lock className="absolute left-4 top-4 text-gray-300" size={18} />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary text-white py-4 rounded-2xl font-black hover:bg-secondary transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20}/> : <LogIn size={20}/>}
            {loading ? 'جاري التحقق...' : 'دخول للمتجر'}
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 font-medium">نظام حماية متجر سما - الإصدار 2.4.0</p>
        </div>
      </div>
    </div>
  );
}
