import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Files, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Globe
} from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../store';
import { ToastContainer } from './Toast';

interface LayoutProps {
  children: React.ReactNode;
}

const NavItem = ({ to, icon: Icon, label, collapsed }: any) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link
      to={to}
      className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-brand-600 text-white" 
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800",
        collapsed && "justify-center"
      )}
      title={collapsed ? label : undefined}
    >
      <Icon size={20} />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout, user } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/templates', icon: Files, label: 'Templates' },
    { to: '/admin/users', icon: Users, label: 'Users & Downloads' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={clsx(
          "fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 flex flex-col border-r border-slate-800",
          collapsed ? "w-16" : "w-64",
          // Mobile responsive logic
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && <span className="font-bold text-lg tracking-tight">TemplatePass</span>}
          {collapsed && <span className="font-bold text-lg mx-auto">TP</span>}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-6 px-2 space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to} 
              {...item} 
              collapsed={collapsed} 
            />
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <Link
              to="/download"
              target="_blank"
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-slate-400 hover:text-green-400 hover:bg-slate-800",
                collapsed && "justify-center"
              )}
              title={collapsed ? "Public Portal" : undefined}
            >
               <Globe size={20} />
               {!collapsed && <span className="text-sm font-medium">Public Portal</span>}
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
           {!collapsed ? (
             <div className="flex items-center gap-3">
               <img src={user?.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-700" />
               <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">{user?.name}</p>
                 <button onClick={logout} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                   <LogOut size={12} /> Sign out
                 </button>
               </div>
             </div>
           ) : (
             <button onClick={logout} className="mx-auto block text-slate-400 hover:text-white">
               <LogOut size={20} />
             </button>
           )}
        </div>
      </aside>

      {/* Main Content */}
      <div 
        className={clsx(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          collapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-2 text-slate-500 hover:bg-slate-100 rounded"
            >
              <Menu size={20} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
             <Link 
               to="/admin/templates/create"
               className="bg-brand-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-700 flex items-center gap-2"
             >
               <Plus size={16} />
               <span className="hidden sm:inline">New Template</span>
             </Link>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};