import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Users, 
  Receipt, 
  DollarSign, 
  History, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Banknote,
  MapPin,
  Star,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CalendarPlus } from 'lucide-react';

// Pages
import Dashboard from './pages/DashboardPage/DashboardPage';
import Products from './pages/ProductsPage/ProductsPage';
import Clients from './pages/ClientsPage/ClientsPage';
import Expenses from './pages/FinancePage/Expenses';
import Income from './pages/FinancePage/Income';
import Reports from './pages/ReportsPage/ReportsPage';
import Finance from './pages/FinancePage/FinancePage';
import Events from './pages/EventsPage/EventsPage';
import UpcomingEvents from './pages/UpcomingEventsPage/UpcomingEventsPage';
import Locations from './pages/LocationsPage/LocationsPage';
import Ratings from './pages/RatingsPage/RatingsPage';
import SponsorshipGallery from './pages/SponsorshipPage/SponsorshipPage';
import ScrollToTop from './ScrollToTop';

function LoginScreen({ onLogin }) {
  const [creds, setCreds] = useState({ user: '', pass: '' });
  
  const handleLogin = (e) => {
    e.preventDefault();
    if ((creds.user === 'moemen' || creds.user === 'abd') && creds.pass === 'admin123') {
       localStorage.setItem('nlg_admin', creds.user);
       localStorage.setItem('nlg_admin_role', creds.user === 'moemen' ? 'super' : 'admin');
       axios.defaults.headers.common['x-admin-master-key'] = 'admin123';
       axios.defaults.headers.common['x-admin-name'] = creds.user;
       onLogin();
    } else {
       alert("Invalid credentials. Founders only.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
       <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-sm text-center"
       >
          <div className="mb-10 text-center">
             <div className="w-20 h-20 bg-[#1e3a8a] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20">
                <Gamepad2 className="text-white w-10 h-10" />
             </div>
             <h2 className="text-3xl font-black uppercase tracking-tighter text-navy mb-1">Founders Only</h2>
             <p className="text-slate-400 text-sm font-black uppercase tracking-[0.2em]">Next Level Game Control</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
             <div className="space-y-2 text-left">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none ml-1">Username</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-navy font-bold text-slate-800 transition-all"
                  onChange={e => setCreds({...creds, user: e.target.value})}
                />
             </div>
             <div className="space-y-2 text-left">
                <label className="text-sm font-black text-slate-500 uppercase tracking-widest leading-none ml-1">Master Password</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-navy font-bold text-slate-800 transition-all"
                  onChange={e => setCreds({...creds, pass: e.target.value})}
                />
             </div>
             <button className="w-full py-5 bg-[#1e3a8a] text-white font-black uppercase tracking-widest rounded-2xl hover:bg-[#1e40af] transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                Enter Control Center
             </button>
             <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-8">Secure Hardware Token Required</p>
          </form>
       </motion.div>
    </div>
  )
}

const Sidebar = ({ isOpen, toggle }) => {
  const location = useLocation();
  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upcoming Events', path: '/upcoming', icon: CalendarPlus },
    { name: 'Event', path: '/events', icon: Calendar },
    { name: 'Machines', path: '/products', icon: Gamepad2 },
    { name: 'Partners', path: '/clients', icon: Users },
    { name: 'Finance', path: '/finance', icon: Banknote },
    { name: 'Footprint', path: '/locations', icon: MapPin },
    { name: 'Ratings', path: '/ratings', icon: Star },
    { name: 'Sponsorship', path: '/sponsorship', icon: Camera },
    { name: 'Reports', path: '/reports', icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden" onClick={toggle} />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="w-10 h-10 bg-[#0f172a] rounded-xl flex items-center justify-center text-white">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tighter text-slate-900 leading-none">NLG HUB</span>
          </div>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && toggle()}
                  className={`sidebar-link ${active ? 'sidebar-link-active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => { localStorage.removeItem('nlg_admin'); localStorage.removeItem('nlg_admin_role'); window.location.reload(); }}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('nlg_admin') != null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      axios.defaults.headers.common['x-admin-master-key'] = 'admin123';
      axios.defaults.headers.common['x-admin-name'] = localStorage.getItem('nlg_admin') || 'Admin';
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-50 text-slate-800 flex">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 lg:ml-64 p-4 md:p-8">
           <header className="flex justify-between items-center mb-10 lg:hidden">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                 <Menu className="w-5 h-5 text-[#0f172a]" />
              </button>
              <div className="text-base font-black tracking-widest text-[#0f172a]">NLG HUB</div>
           </header>

           <div className="max-w-6xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/upcoming" element={<UpcomingEvents />} />
                <Route path="/events" element={<Events />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/finance" element={<Finance />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/ratings" element={<Ratings />} />
                <Route path="/sponsorship" element={<SponsorshipGallery />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
           </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
