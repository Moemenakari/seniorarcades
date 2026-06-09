/**
 * ============================================================
 * ADMIN REGISTERED USERS MANAGEMENT PAGE
 * ============================================================
 * Final Graduation Project Refactor
 * Purpose: View and manage registered users who use the 
 * frontend application and submit reviews.
 * ============================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Phone, User, 
  Trash2, Mail, Users as UsersIcon, 
  Calendar, Activity 
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL as API } from '../../config';

// Helper to format/clean phone numbers for WhatsApp API
const cleanPhoneForWhatsapp = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Omit leading '00' international prefix if present
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // Lebanese local format: if starts with 0 and is 8 digits (e.g., 03123456)
  if (cleaned.startsWith('0') && cleaned.length === 8) {
    cleaned = '961' + cleaned.substring(1);
  } 
  // If it's a 7-digit number (e.g., 3123456)
  else if (cleaned.length === 7) {
    cleaned = '961' + cleaned;
  }
  // If it's an 8-digit number starting with standard mobile digits (3, 7, 8) but missing country code
  else if (cleaned.length === 8 && (cleaned.startsWith('3') || cleaned.startsWith('7') || cleaned.startsWith('8'))) {
    cleaned = '961' + cleaned;
  }
  
  return cleaned;
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Send the master key header to authenticate with the backend
      const res = await axios.get(`${API}/auth/users`, {
        headers: { 'x-admin-master-key': 'admin123' }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Users fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.phone || '').includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Registered Users</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium mt-1 sm:mt-2">View all accounts registered via the frontend application.</p>
        </div>
      </div>

      <div className="premium-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Search by name or phone..." 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-indigo-500 text-sm font-bold shadow-sm transition-all" 
              />
           </div>
        </div>

        <div className="divide-y divide-slate-100">
           {loading ? (
             <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest">Loading Users...</div>
           ) : filteredUsers.map(user => (
             <div key={user.id} className="bg-white hover:bg-slate-50 transition-colors p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
                   <div className="w-10 h-10 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-base sm:text-xl shadow-lg shadow-indigo-900/10 flex-shrink-0">
                      {user.name[0].toUpperCase()}
                   </div>
                   <div>
                      <div className="flex items-center gap-2">
                         <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none">{user.name}</h3>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                            {user.role}
                         </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                         <p className="text-sm font-bold text-slate-400 flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-300" /> {user.phone}</p>
                         <p className="text-sm font-bold text-slate-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> Joined {new Date(user.created_at).toLocaleDateString()}</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   {user.phone ? (
                      <a 
                        href={`https://wa.me/${cleanPhoneForWhatsapp(user.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-emerald-200"
                        title="Chat on WhatsApp"
                      >
                         <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                           <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.415 9.86-9.852.002-2.633-1.02-5.107-2.88-6.97C16.59 1.96 14.12 1.937 11.488 1.938c-5.437 0-9.857 4.418-9.859 9.856-.001 1.705.452 3.37 1.31 4.815l-.979 3.57 3.677-.965zm11.385-4.62c-.3-.15-1.77-.875-2.046-.975-.276-.1-.477-.15-.677.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-1.025-.916-1.554-1.89-1.637-2.04-.082-.15-.009-.23.066-.305.068-.067.15-.175.225-.263.075-.088.1-.15.15-.25.05-.1.025-.187-.012-.262-.038-.075-.325-.785-.45-1.084-.125-.299-.25-.258-.35-.258H8.8c-.175 0-.462.063-.705.325-.243.262-.927.906-.927 2.212 0 1.306.949 2.568 1.08 2.743.132.175 1.868 2.85 4.524 3.998.632.272 1.125.435 1.509.557.635.201 1.213.173 1.67.104.51-.077 1.77-.723 2.02-1.387.25-.663.25-1.233.175-1.35-.075-.117-.275-.167-.575-.317z"/>
                         </svg>
                      </a>
                    ) : (
                      <span className="p-3 bg-slate-50 text-slate-300 rounded-2xl cursor-not-allowed" title="No phone number available">
                        <Phone className="w-5 h-5" />
                      </span>
                    )}
                </div>
             </div>
           ))}
           {!loading && filteredUsers.length === 0 && (
             <div className="py-20 text-center">
                <UsersIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-base font-bold text-slate-300 uppercase tracking-[0.2em] italic">No users found</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
