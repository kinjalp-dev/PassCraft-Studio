import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../api/client';
import { TemplatePreviewCanvas } from '../components/editor/TemplatePreviewCanvas';
import { PlaceholderConfig, TextFieldConfig } from '../types';
import { Save, ArrowLeft, Upload, Loader2, Maximize, Circle, Square, Type, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, Trash2, LayoutTemplate, ArrowRightLeft, ArrowUpDown } from 'lucide-react';
import { useStore } from '../store';
import clsx from 'clsx';

export const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useStore();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Elements state
  const [placeholder, setPlaceholder] = useState<PlaceholderConfig>({ x: 30, y: 30, width: 40, height: 40, shape: 'rect' });
  const [nameField, setNameField] = useState<TextFieldConfig | undefined>(undefined);
  
  // UI State
  const [previewMode, setPreviewMode] = useState(false);
  const [activeElement, setActiveElement] = useState<'image' | 'name'>('image');
  const [testName, setTestName] = useState('John Doe');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch if editing
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['template', id],
    queryFn: () => api.getTemplate(id!),
    enabled: isEditing
  });

  useEffect(() => {
    if (existingTemplate && !hasLoaded) {
      setName(existingTemplate.name);
      setImageUrl(existingTemplate.imageUrl);
      setPlaceholder(existingTemplate.placeholder);
      setNameField(existingTemplate.nameField);
      setHasLoaded(true);
    }
  }, [existingTemplate, hasLoaded]);

  const createMutation = useMutation({
    mutationFn: api.createTemplate,
    onSuccess: () => {
      addToast('Template created successfully', 'success');
      navigate('/admin/templates');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.updateTemplate(id!, data),
    onSuccess: () => {
      addToast('Template updated successfully', 'success');
      navigate('/admin/templates');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name || !imageUrl) return addToast('Please fill in name and upload an image', 'error');

    const payload = {
      name,
      imageUrl,
      placeholder,
      nameField, // include optional name field
    };

    if (isEditing) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleNameField = () => {
    if (nameField) {
      if (confirm("Remove Name Field?")) {
        setNameField(undefined);
        setActiveElement('image');
      }
    } else {
      setNameField({
        x: 10, y: 80, width: 80, height: 10,
        color: '#000000',
        fontSize: 24,
        align: 'center',
        fontFamily: 'Arial'
      });
      setActiveElement('name');
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // --- Quick Fit Helpers ---
  const handleQuickAction = (action: 'center' | 'fullW' | 'fullH') => {
    if (activeElement === 'image') {
      setPlaceholder(prev => {
        const next = { ...prev };
        if (action === 'center') {
          next.x = parseFloat(((100 - prev.width) / 2).toFixed(2));
          next.y = parseFloat(((100 - prev.height) / 2).toFixed(2));
        } else if (action === 'fullW') {
          next.x = 0;
          next.width = 100;
        } else if (action === 'fullH') {
          next.y = 0;
          next.height = 100;
        }
        return next;
      });
    } else if (activeElement === 'name' && nameField) {
      setNameField(prev => {
        if (!prev) return undefined;
        const next = { ...prev };
        if (action === 'center') {
          next.x = parseFloat(((100 - prev.width) / 2).toFixed(2));
          next.y = parseFloat(((100 - prev.height) / 2).toFixed(2));
        } else if (action === 'fullW') {
          next.x = 0;
          next.width = 100;
        } else if (action === 'fullH') {
          next.y = 0;
          next.height = 100;
        }
        return next;
      });
    }
  };

  if (isEditing && isLoadingTemplate) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/templates')} className="text-slate-500 hover:text-slate-700">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Template' : 'Create Template'}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
          >
            {previewMode ? 'Back to Edit' : 'Preview Result'}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm p-4 overflow-hidden flex flex-col">
          {!imageUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded bg-slate-50">
              <Upload size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">Upload a base image to get started</p>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <>
              {previewMode && (
                <div className="mb-4 flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                   <span className="text-xs text-slate-500 font-bold uppercase">Preview Data:</span>
                   <input 
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="Type a name to test..."
                      className="border rounded px-2 py-1 text-sm flex-1"
                   />
                </div>
              )}
              <TemplatePreviewCanvas 
                imageUrl={imageUrl}
                imagePlaceholder={placeholder}
                onImagePlaceholderChange={setPlaceholder}
                nameField={nameField}
                onNameFieldChange={setNameField}
                activeElement={activeElement}
                onSelectElement={setActiveElement}
                mode={previewMode ? 'preview' : 'edit'}
                sampleData={{ photoUrl: 'https://picsum.photos/id/64/400/400', name: testName }}
              />
            </>
          )}
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden">
           {/* Common Info */}
           <div className="p-4 border-b border-slate-100 space-y-3">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Template Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="e.g. Conference Badge"
                />
             </div>
           </div>

           {/* Tabs / Element Selector */}
           <div className="flex border-b border-slate-200 bg-slate-50">
             <button 
                onClick={() => setActiveElement('image')}
                className={clsx(
                  "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                  activeElement === 'image' 
                    ? "border-brand-500 text-brand-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
             >
               <ImageIcon size={16} /> Image Zone
             </button>
             <button 
                onClick={() => setActiveElement('name')}
                className={clsx(
                  "flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
                  activeElement === 'name' 
                    ? "border-purple-500 text-purple-700 bg-white" 
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
             >
               <Type size={16} /> Name Field
             </button>
           </div>

           <div className="p-4 flex-1 overflow-y-auto">
             {/* QUICK ACTIONS BAR */}
             {((activeElement === 'image') || (activeElement === 'name' && nameField)) && (
                <div className="mb-6">
                   <label className="block text-xs font-semibold text-slate-500 mb-2">QUICK POSITION</label>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleQuickAction('center')}
                        className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded p-2 flex flex-col items-center gap-1"
                        title="Center Element"
                      >
                         <LayoutTemplate size={16} />
                         <span className="text-[10px]">Center</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction('fullW')}
                        className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded p-2 flex flex-col items-center gap-1"
                        title="Fill Width"
                      >
                         <ArrowRightLeft size={16} />
                         <span className="text-[10px]">Full W</span>
                      </button>
                      <button 
                        onClick={() => handleQuickAction('fullH')}
                        className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded p-2 flex flex-col items-center gap-1"
                        title="Fill Height"
                      >
                         <ArrowUpDown size={16} />
                         <span className="text-[10px]">Full H</span>
                      </button>
                   </div>
                </div>
             )}

             {activeElement === 'image' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Shape</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPlaceholder(p => ({ ...p, shape: 'rect' }))}
                        className={clsx(
                          "flex-1 flex items-center justify-center gap-2 py-2 border rounded text-sm transition-colors",
                          placeholder.shape === 'rect' ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Square size={16} /> Rectangle
                      </button>
                      <button 
                        onClick={() => setPlaceholder(p => ({ ...p, shape: 'circle' }))}
                        className={clsx(
                          "flex-1 flex items-center justify-center gap-2 py-2 border rounded text-sm transition-colors",
                          placeholder.shape === 'circle' ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Circle size={16} /> Circle
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Maximize size={16} /> Dimensions (%)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {['x', 'y', 'width', 'height'].map(prop => (
                        <div key={prop}>
                          <label className="text-xs text-slate-500 capitalize">{prop}</label>
                          <input 
                            type="number" 
                            step="0.01"
                            value={placeholder[prop as keyof PlaceholderConfig] as number}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setPlaceholder(p => ({ ...p, [prop]: isNaN(val) ? 0 : val }));
                            }}
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
             )}

             {activeElement === 'name' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                 {!nameField ? (
                   <div className="text-center py-8">
                     <p className="text-slate-500 text-sm mb-4">No Name Field enabled on this template.</p>
                     <button 
                       onClick={toggleNameField}
                       className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                     >
                       Add Name Field
                     </button>
                   </div>
                 ) : (
                   <>
                     <div className="flex items-center justify-between">
                       <h3 className="text-sm font-bold text-purple-800">Field Properties</h3>
                       <button onClick={toggleNameField} className="text-red-500 hover:text-red-700 p-1" title="Remove Field">
                         <Trash2 size={16} />
                       </button>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs text-slate-500">Font Color</label>
                        <div className="flex gap-2">
                          <input 
                            type="color" 
                            value={nameField.color}
                            onChange={(e) => setNameField({ ...nameField, color: e.target.value })}
                            className="w-10 h-8 p-0 border-0 rounded cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={nameField.color}
                            onChange={(e) => setNameField({ ...nameField, color: e.target.value })}
                            className="flex-1 border rounded px-2 text-sm uppercase"
                          />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-xs text-slate-500">Font Size</label>
                        <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              min="1"
                              max="500"
                              value={nameField.fontSize}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setNameField({ ...nameField, fontSize: isNaN(val) ? 0 : val });
                              }}
                              className="w-full border rounded px-3 py-2 text-sm"
                            />
                            <span className="text-xs text-slate-400 font-medium">px</span>
                        </div>
                     </div>

                     <div className="space-y-2">
                       <label className="text-xs text-slate-500">Alignment</label>
                       <div className="flex border rounded overflow-hidden">
                         {[
                           { val: 'left', icon: AlignLeft }, 
                           { val: 'center', icon: AlignCenter }, 
                           { val: 'right', icon: AlignRight }
                         ].map((opt) => (
                           <button
                             key={opt.val}
                             onClick={() => setNameField({ ...nameField, align: opt.val as any })}
                             className={clsx(
                               "flex-1 py-2 flex items-center justify-center hover:bg-slate-50",
                               nameField.align === opt.val ? "bg-purple-100 text-purple-700" : "text-slate-500"
                             )}
                           >
                             <opt.icon size={16} />
                           </button>
                         ))}
                       </div>
                     </div>

                     <div className="space-y-4 pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Maximize size={16} /> Position & Size (%)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {['x', 'y', 'width', 'height'].map(prop => (
                            <div key={prop}>
                              <label className="text-xs text-slate-500 capitalize">{prop}</label>
                              <input 
                                type="number" 
                                step="0.01"
                                value={nameField[prop as keyof TextFieldConfig] as number}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    setNameField(curr => curr ? ({ ...curr, [prop]: isNaN(val) ? 0 : val }) : undefined);
                                }}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                     </div>
                   </>
                 )}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};