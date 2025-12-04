import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Share2, Eye, Copy, Loader2, Download, Upload, Type, ExternalLink } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { TemplatePreviewCanvas } from '../components/editor/TemplatePreviewCanvas';
import { useStore } from '../store';
import { Template } from '../types';
import { generateTemplateImage } from '../utils/imageGenerator';

export const TemplatesList: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['templates'], queryFn: () => api.getTemplates({}) });
  const queryClient = useQueryClient();
  const { addToast } = useStore();
  
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [modalType, setModalType] = useState<'preview' | 'share' | null>(null);

  // State for the interactive preview modal
  const [previewName, setPreviewName] = useState('John Doe');
  const [previewPhoto, setPreviewPhoto] = useState('https://picsum.photos/id/64/400/400');

  const deleteMutation = useMutation({
    mutationFn: api.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      addToast('Template deleted successfully', 'success');
    }
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const openShare = (t: Template) => {
    setSelectedTemplate(t);
    setModalType('share');
  };

  const openPreview = (t: Template) => {
    setSelectedTemplate(t);
    // Reset preview data to defaults when opening
    setPreviewName('John Doe');
    setPreviewPhoto('https://picsum.photos/id/64/400/400');
    setModalType('preview');
  };

  const copyLink = () => {
    if (!selectedTemplate) return;
    const link = `${window.location.origin}/#/download/${selectedTemplate.id}`;
    navigator.clipboard.writeText(link);
    addToast('Link copied to clipboard', 'success');
  };

  const openPublicPopup = () => {
    if (!selectedTemplate) return;
    const url = `${window.location.origin}/#/download/${selectedTemplate.id}`;
    window.open(url, 'TemplatePublicView', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  const handlePreviewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadMock = async () => {
    if (!selectedTemplate) return;

    try {
      addToast('Generating image...', 'info');
      
      const blob = await generateTemplateImage(selectedTemplate, {
          name: previewName,
          photoUrl: previewPhoto
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedTemplate.name}-download.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 7. SAVE TO DB (Record Download) - Using dummy number for admin test
      await api.recordDownload({
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          userName: previewName,
          userPhoto: previewPhoto,
          whatsappNumber: 'AdminTest'
      });

      // Update UI counts
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      addToast('Download started & Data saved', 'success');

    } catch (e) {
        console.error(e);
        addToast('Failed to generate image. Ensure base images support CORS.', 'error');
    }
  };

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Templates</h1>
      </div>

      <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Preview</th>
              <th className="p-4">Name</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-center">Downloads</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data?.data.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div 
                    onClick={() => openPreview(t)}
                    className="w-16 h-12 bg-slate-200 rounded overflow-hidden cursor-pointer relative group"
                  >
                    <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                      <Eye className="text-white opacity-0 group-hover:opacity-100" size={16} />
                    </div>
                  </div>
                </td>
                <td className="p-4 font-medium text-slate-800">{t.name}</td>
                <td className="p-4 text-slate-500 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-center">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{t.downloadCount}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => openPreview(t)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded" 
                      title="View & Test"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => openShare(t)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded" 
                      title="Share Public Link"
                    >
                      <Share2 size={18} />
                    </button>
                    <Link 
                      to={`/admin/templates/${t.id}`}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded" 
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data?.data.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No templates found. <Link to="/admin/templates/create" className="text-brand-600 underline">Create one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Share Modal */}
      <Modal 
        isOpen={modalType === 'share'} 
        onClose={() => setModalType(null)} 
        title="Share Template"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Share this link with users so they can customize and download this template.
          </p>
          
          <div className="flex gap-2">
            <input 
              readOnly 
              value={selectedTemplate ? `${window.location.origin}/#/download/${selectedTemplate.id}` : ''} 
              className="flex-1 border border-slate-300 rounded px-3 py-2 bg-slate-50 text-sm font-mono text-slate-600"
              onClick={(e) => e.currentTarget.select()}
            />
            <button 
              onClick={copyLink}
              className="bg-white border border-slate-300 text-slate-700 px-3 rounded hover:bg-slate-50 flex items-center gap-2 transition-colors"
              title="Copy Link"
            >
              <Copy size={16} />
            </button>
          </div>

          <div className="pt-2">
             <button 
               onClick={openPublicPopup}
               className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-lg hover:bg-brand-700 transition-colors font-medium text-sm"
             >
               <ExternalLink size={16} /> Open Public Page
             </button>
          </div>
        </div>
      </Modal>

      {/* View & Test Modal */}
      <Modal
        isOpen={modalType === 'preview'}
        onClose={() => setModalType(null)}
        title={selectedTemplate ? `Test Template: ${selectedTemplate.name}` : 'Preview'}
        size="xl"
      >
        <div className="flex flex-col md:flex-row gap-6 h-[65vh]">
          {/* Canvas Section */}
          <div className="flex-1 bg-slate-100 rounded border border-slate-200 overflow-hidden relative flex items-center justify-center">
            {selectedTemplate && (
              <TemplatePreviewCanvas 
                imageUrl={selectedTemplate.imageUrl}
                imagePlaceholder={selectedTemplate.placeholder}
                onImagePlaceholderChange={() => {}}
                nameField={selectedTemplate.nameField}
                activeElement="image"
                onSelectElement={() => {}}
                mode="preview"
                sampleData={{ photoUrl: previewPhoto, name: previewName }}
              />
            )}
          </div>

          {/* Controls Section */}
          <div className="w-full md:w-80 flex flex-col gap-4 border-l pl-0 md:pl-6 border-slate-100 md:border-l-slate-200">
             <div>
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Test Data</h3>
                
                <div className="space-y-5">
                   {/* Photo Upload */}
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 mb-2">SAMPLE PHOTO</label>
                     <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded bg-slate-100 border border-slate-300 overflow-hidden flex-shrink-0">
                           <img src={previewPhoto} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                        <label className="cursor-pointer bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded text-xs font-medium flex items-center gap-2 transition-colors">
                           <Upload size={14} /> Change Photo
                           <input type="file" className="hidden" accept="image/*" onChange={handlePreviewFileChange} />
                        </label>
                     </div>
                   </div>

                   {/* Name Input - Conditionally Rendered */}
                   {selectedTemplate?.nameField && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-2">SAMPLE NAME</label>
                        <div className="relative">
                           <Type className="absolute left-3 top-2.5 text-slate-400" size={14} />
                           <input 
                             type="text" 
                             value={previewName}
                             onChange={(e) => setPreviewName(e.target.value)}
                             className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                             placeholder="Enter a name"
                           />
                        </div>
                      </div>
                   )}
                </div>
             </div>

             <div className="mt-auto pt-6 border-t border-slate-100">
               <button 
                 onClick={handleDownloadMock}
                 className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold shadow-sm hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
               >
                 <Download size={18} /> Download Image
               </button>
               <p className="text-center text-[10px] text-slate-400 mt-2">
                 This simulates the final image generation that users will receive.
               </p>
             </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};