import { useState, useEffect } from 'react';
import { Search, Bell, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const Header = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userEmail = user?.email || 'Admin User';
  const userInitial = userEmail.charAt(0).toUpperCase();

  useEffect(() => {
    const fetchRecentEvents = async () => {
      try {
        const students = await api.students.getAll();
        const payments = await api.payments.getAll();
        
        const combined = [
          ...students.slice(0, 3).map(s => ({
            id: `s-${s.id}`,
            type: 'REG',
            text: `New student: ${s.full_name}`,
            time: s.created_at
          })),
          ...payments.slice(0, 3).map(p => ({
            id: `p-${p.id}`,
            type: 'PAY',
            text: `Payment: ₹${p.amount_paid} from ${p.students?.full_name || 'Student'}`,
            time: p.created_at
          }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
        
        setNotifications(combined);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchRecentEvents();
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 items-center gap-4">
        <div className="hidden md:block mr-4">
          <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] truncate">
            ST. MARY'S SCHOOL & JR. COLLEGE
          </h1>
        </div>
        <form className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search students, roll numbers..."
            className="w-full bg-slate-50 border-none pl-10 h-10 md:w-[300px] lg:w-[400px] rounded-xl focus:ring-0"
          />
        </form>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest">Notifications</h3>
                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">{notifications.length} NEW</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        n.type === 'REG' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        {n.type === 'REG' ? <CheckCircle2 className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-xs font-bold text-slate-900 leading-tight">{n.text}</p>
                        <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No new alerts</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50 text-center">
                <button className="text-[10px] font-black text-slate-400 uppercase hover:text-primary transition-colors">Clear All Notifications</button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-black text-slate-900 truncate max-w-[150px] uppercase italic tracking-tight">{userEmail.split('@')[0]}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-slate-200">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
