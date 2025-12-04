import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { TemplatePreviewCanvas } from '../components/editor/TemplatePreviewCanvas';
import { generateTemplateImage } from '../utils/imageGenerator';
import { Loader2, Download, Upload, Phone, User, Image as ImageIcon, Eye, X, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';

export const PublicDownload: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useStore();
  
  // Form State
  const [userName, setUserName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // --- QUERY FOR SINGLE TEMPLATE ---
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['public-template', id],
    queryFn: () => api.getTemplate(id!),
    enabled: !!id,
    retry: false
  });

  // --- QUERY FOR TEMPLATE GALLERY (If no ID) ---
  const { data: allTemplates, isLoading: isLoadingAll } = useQuery({
    queryKey: ['public-templates-list'],
    queryFn: () => api.getTemplates({}),
    enabled: !id
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUserPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    if (!template || !userName || !whatsappNumber || !userPhoto) {
        addToast('Please fill all fields and upload a photo.', 'error');
        return;
    }

    try {
      setIsGenerating(true);
      setShowPreviewModal(false); // Close preview if open
      
      const blob = await generateTemplateImage(template, {
          name: userName,
          photoUrl: userPhoto
      });

      // Trigger Download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, '_')}_poster.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Save Data to DB
      await api.recordDownload({
          templateId: template.id,
          templateName: template.name,
          userName: userName,
          userPhoto: userPhoto,
          whatsappNumber: whatsappNumber
      });

      addToast('Image downloaded & details saved!', 'success');
      
    } catch (err) {
      console.error(err);
      addToast('Failed to generate image.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewOpen = () => {
      if (!userPhoto) {
          addToast('Please upload a photo to preview.', 'info');
          return;
      }
      setShowPreviewModal(true);
  };

  // --- RENDER LOADING ---
  if (isLoading || isLoadingAll) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="animate-spin text-brand-600" size={48} />
      </div>
  );

  // --- RENDER GALLERY VIEW (If No ID) ---
  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
         <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
               <div className="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2">
                  <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white">
                     <ImageIcon size={18} />
                  </div>
                  App Downloads
               </div>
            </div>
         </header>

         <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-8">
            <div className="mb-8 text-center">
               <h1 className="text-3xl font-bold text-slate-900 mb-2">Select a Template</h1>
               <p className="text-slate-500">Choose a design below to customize and download.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               {allTemplates?.data.map((t) => (
                 <Link 
                   to={`/download/${t.id}`} 
                   key={t.id}
                   className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col"
                 >
                    <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                       <img 
                         src={t.thumbnailUrl || t.imageUrl} 
                         alt={t.name} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                             Customize
                          </span>
                       </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                       <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">{t.name}</h3>
                       <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-500">
                          <span>{t.downloadCount} downloads</span>
                          <span className="flex items-center gap-1 text-brand-600 font-medium group-hover:underline">
                             Use Template <ArrowRight size={14} />
                          </span>
                       </div>
                    </div>
                 </Link>
               ))}
               {allTemplates?.data.length === 0 && (
                 <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No public templates available yet.</p>
                 </div>
               )}
            </div>
         </main>
      </div>
    );
  }

  // --- RENDER ERROR (If ID invalid) ---
  if (error || !template) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
          <div className="bg-white p-8 rounded-xl shadow border border-slate-200 max-w-md">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Template Not Found</h1>
            <p className="text-slate-500">The link you followed may be broken, expired, or the template was removed.</p>
            <Link to="/download" className="inline-block mt-4 text-brand-600 hover:underline font-medium">Browse All Templates</Link>
          </div>
      </div>
  );

  // --- RENDER DETAIL FORM VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Public Header */}
       <header className="bg-white border-b border-slate-200 py-3 px-4 md:px-6 shadow-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
             <Link to="/download" className="font-bold text-lg md:text-xl text-slate-800 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center text-white">
                   <ImageIcon size={18} />
                </div>
                TemplatePass
             </Link>
          </div>
       </header>

       <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col-reverse md:flex-row">
             
             {/* Left: Form Area (Bottom on Mobile, Left on Desktop) */}
             <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white z-10">
                <div className="mb-6 md:mb-8">
                   <Link to="/download" className="text-xs font-bold text-slate-400 hover:text-brand-600 uppercase mb-2 inline-flex items-center gap-1">
                      &larr; Back to Gallery
                   </Link>
                   <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">{template.name}</h1>
                   <p className="text-slate-500 text-sm">Create your personalized poster in seconds. Enter your details below.</p>
                </div>

                <form onSubmit={handleDownload} className="space-y-5 flex-1">
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                         Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            required
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                         WhatsApp Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="tel" 
                            required
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="e.g. +1 234 567 8900"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                         Your Photo
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:bg-slate-50 transition-colors group cursor-pointer relative">
                         <input 
                           type="file" 
                           required={!userPhoto}
                           accept="image/*" 
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                           onChange={handleFileChange} 
                         />
                         <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                {userPhoto ? (
                                   <img src={userPhoto} alt="Upload" className="w-full h-full object-cover" />
                                ) : (
                                   <Upload size={24} className="text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">
                                    {userPhoto ? 'Change Image' : 'Click to Upload Image'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-4 flex gap-3 flex-col sm:flex-row">
                      <button
                        type="button"
                        onClick={handlePreviewOpen}
                        className="flex-1 bg-slate-100 text-slate-700 font-bold py-3.5 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-300"
                      >
                         <Eye size={20} /> Preview
                      </button>
                      
                      <button 
                        type="submit" 
                        disabled={isGenerating}
                        className="flex-[2] bg-brand-600 text-white font-bold py-3.5 rounded-lg shadow-md shadow-brand-200 hover:bg-brand-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
                      >
                         {isGenerating ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                         {isGenerating ? 'Processing...' : 'Download'}
                      </button>
                   </div>
                </form>
             </div>

             {/* Right: Live Preview Area (Top on Mobile, Right on Desktop) */}
             <div className="w-full md:w-1/2 bg-slate-100 border-b md:border-b-0 md:border-l border-slate-200 flex flex-col">
                <div className="p-6 md:p-10 flex-1 flex items-center justify-center">
                    <div className="w-full max-w-[400px] relative">
                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-sm z-10">
                          Live Preview
                       </div>
                       <div className="rounded-lg shadow-xl overflow-hidden bg-white border border-slate-200 ring-4 ring-white">
                           <TemplatePreviewCanvas 
                              imageUrl={template.imageUrl}
                              imagePlaceholder={template.placeholder}
                              nameField={template.nameField}
                              activeElement="image" 
                              onSelectElement={() => {}} 
                              onImagePlaceholderChange={() => {}}
                              mode="preview"
                              sampleData={{
                                 photoUrl: userPhoto || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Your+Photo',
                                 name: userName || 'Your Name Here'
                              }}
                           />
                       </div>
                    </div>
                </div>
                <div className="p-4 text-center border-t border-slate-200/50">
                    <p className="text-xs text-slate-400">
                        Designed by TemplatePass. <a href="#" className="underline hover:text-brand-500">Create your own</a>
                    </p>
                </div>
             </div>
          </div>
       </main>

       {/* Full Screen Preview Modal */}
       {showPreviewModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
               <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                   <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                       <h3 className="font-bold text-slate-700">Preview Result</h3>
                       <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                           <X size={20} />
                       </button>
                   </div>
                   <div className="p-6 bg-slate-100 overflow-y-auto flex items-center justify-center">
                       <div className="shadow-lg max-w-full">
                            <TemplatePreviewCanvas 
                                imageUrl={template.imageUrl}
                                imagePlaceholder={template.placeholder}
                                nameField={template.nameField}
                                activeElement="image" 
                                onSelectElement={() => {}} 
                                onImagePlaceholderChange={() => {}}
                                mode="preview"
                                sampleData={{
                                    photoUrl: userPhoto || 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Your+Photo',
                                    name: userName || 'Your Name Here'
                                }}
                            />
                       </div>
                   </div>
                   <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                       <button 
                           onClick={() => setShowPreviewModal(false)}
                           className="px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-lg"
                       >
                           Close
                       </button>
                       <button 
                           onClick={() => handleDownload()}
                           className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-md shadow-brand-200"
                       >
                           Download Now
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};