import React from 'react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
       <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
       <div className="bg-white p-8 rounded-lg border border-slate-200">
         <p className="text-slate-500">Settings configuration for watermarks and default expiry times would go here.</p>
       </div>
    </div>
  );
};
