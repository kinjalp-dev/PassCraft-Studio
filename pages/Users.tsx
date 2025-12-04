
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { Download, Loader2, Search, User as UserIcon } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';

export const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { addToast } = useStore();

  const { data, isLoading } = useQuery({ 
    queryKey: ['users', searchTerm], 
    queryFn: () => api.getUsers({ q: searchTerm }) 
  });

  const handleExport = async () => {
    setIsExportModalOpen(false);
    try {
      const csvContent = await api.exportUsersCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'user_downloads.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('CSV Export downloaded', 'success');
    } catch (e) {
      addToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Users & Downloads</h1>
        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by user name or whatsapp..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        {isLoading ? (
           <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Photo</th>
                <th className="p-4">User Details</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Template</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.data.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                   <td className="p-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                       {user.userPhoto ? (
                           <img src={user.userPhoto} className="w-full h-full object-cover" alt="User" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400"><UserIcon size={16} /></div>
                       )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-800">{user.userName}</div>
                  </td>
                  <td className="p-4 text-slate-700 font-mono text-sm">{user.whatsappNumber}</td>
                  <td className="p-4 text-slate-700">{user.templateName}</td>
                  <td className="p-4 text-slate-500 text-sm">{new Date(user.downloadedAt).toLocaleString()}</td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No downloads recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        title="Export Data"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Export download history to CSV.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs text-slate-500 mb-1 block">From</label>
               <input type="date" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
               <label className="text-xs text-slate-500 mb-1 block">To</label>
               <input type="date" className="w-full border rounded px-2 py-1" />
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="w-full bg-brand-600 text-white py-2 rounded hover:bg-brand-700 font-medium"
          >
            Download CSV
          </button>
        </div>
      </Modal>
    </div>
  );
};
