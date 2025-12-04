import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@templatepass.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
           <div className="w-12 h-12 bg-brand-600 rounded-lg flex items-center justify-center text-white mb-4">
             <LayoutDashboard size={24} />
           </div>
           <h1 className="text-2xl font-bold text-slate-900">TemplatePass Admin</h1>
           <p className="text-slate-500 mt-2">Sign in to manage your templates</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value="password"
              readOnly
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors"
          >
            Sign In
          </button>
        </form>
        
        <div className="mt-4 text-center text-xs text-slate-400">
          (This is a mock login. Just click Sign In)
        </div>
      </div>
    </div>
  );
};
