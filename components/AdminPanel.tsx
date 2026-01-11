import React, { useState, useRef } from 'react';
import { Trash2, Upload, Play, PlusCircle, User, Clock, Star, Activity, Settings as SettingsIcon, Type, Pencil, X, Save } from 'lucide-react';
import { Operator, AdminPanelProps, AppSettings } from '../types';

const FONT_OPTIONS = [
  { value: 'Playfair Display', label: 'Playfair Display (Elegante/Clássica)' },
  { value: 'Montserrat', label: 'Montserrat (Moderna/Geométrica)' },
  { value: 'Roboto Slab', label: 'Roboto Slab (Forte/Serifada)' },
  { value: 'Orbitron', label: 'Orbitron (Futurista/Tech)' },
  { value: 'Inter', label: 'Inter (Padrão/Limpa)' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  operators,
  settings,
  onAddOperator,
  onEditOperator,
  onRemoveOperator,
  onUpdateSettings,
  onSwitchMode,
}) => {
  const [name, setName] = useState('');
  const [tma, setTma] = useState('');
  const [nps, setNps] = useState('');
  const [monitoria, setMonitoria] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); // Track which operator is being edited

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.");
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setTma('');
    setNps('');
    setMonitoria('');
    setPhoto(null);
    setPhotoFile(null);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditClick = (op: Operator) => {
    setName(op.name);
    setTma(op.tma);
    setNps(op.nps);
    setMonitoria(op.monitoria);
    setPhoto(op.photo);
    setPhotoFile(null);
    setEditingId(op.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    if (editingId === id) {
      resetForm();
    }
    onRemoveOperator(id);
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tma || !nps || !monitoria || (!photo && !photoFile)) {
      alert("Por favor, preencha todos os campos e adicione uma foto.");
      return;
    }

    if (editingId) {
      const updatedOperator: Operator = {
        id: editingId,
        name,
        tma,
        nps,
        monitoria,
        photo: photo || '',
        photoFile: photoFile || undefined,
      };
      onEditOperator(updatedOperator);
    } else {
      const newOperator: Operator = {
        id: generateId(),
        name,
        tma,
        nps,
        monitoria,
        photo: photo || '',
        photoFile: photoFile || undefined,
      };
      onAddOperator(newOperator);
    }

    resetForm();
  };

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">Painel de Controle</h1>
            <p className="text-gray-500">Gestão de Performance do Call Center</p>
          </div>
          <button
            onClick={onSwitchMode}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Play size={20} fill="currentColor" />
            Iniciar Apresentação
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Configs & Form */}
          <div className="lg:col-span-1 space-y-8">

            {/* Form Section */}
            <div className={`bg-white p-6 rounded-2xl shadow-md border ${editingId ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  {editingId ? <Pencil className="text-indigo-600" /> : <PlusCircle className="text-indigo-600" />}
                  {editingId ? 'Editar Operador' : 'Novo Operador'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-xs flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors">
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center mb-4">
                  <div
                    className="w-32 h-32 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors relative group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 p-2">
                        <Upload className="mx-auto mb-1" size={24} />
                        <span className="text-xs">Carregar Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-full flex items-center justify-center">
                      {photo && <Upload className="text-white opacity-0 group-hover:opacity-100" />}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Inputs */}
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Nome do Operador"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="TMA (ex: 04:30)"
                      value={tma}
                      onChange={(e) => setTma(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Star className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="number"
                        placeholder="NPS"
                        value={nps}
                        onChange={(e) => setNps(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Activity className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="number"
                        placeholder="Qualidade"
                        value={monitoria}
                        onChange={(e) => setMonitoria(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-md transition-colors mt-2 ${editingId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white`}
                >
                  {editingId ? <><Save size={18} /> Atualizar Operador</> : <><PlusCircle size={18} /> Salvar Operador</>}
                </button>
              </form>
            </div>

            {/* Settings Section */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                <SettingsIcon className="text-indigo-600" />
                Configurações da TV
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Type size={16} />
                    Fonte do Nome
                  </label>
                  <select
                    value={settings.font}
                    onChange={(e) => handleSettingChange('font', e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Clock size={16} />
                    Tempo por Slide (segundos)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="60"
                    value={settings.slideDuration}
                    onChange={(e) => handleSettingChange('slideDuration', parseInt(e.target.value) || 8)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Equipe Cadastrada ({operators.length})</h2>

              {operators.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <User size={48} className="mb-2 opacity-50" />
                  <p>Nenhum operador cadastrado.</p>
                  <p className="text-sm">Use o formulário ao lado para começar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {operators.map((op) => (
                    <div key={op.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${editingId === op.id ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' : 'bg-gray-50 border-gray-100 hover:shadow-md'}`}>
                      <img
                        src={op.photo}
                        alt={op.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate" style={{ fontFamily: settings.font }}>{op.name}</h3>
                        <div className="flex gap-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1"><Clock size={12} /> {op.tma}</span>
                          <span className="flex items-center gap-1 text-yellow-600"><Star size={12} /> {op.nps}</span>
                          <span className="flex items-center gap-1 text-emerald-600"><Activity size={12} /> {op.monitoria}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(op)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteClick(op.id);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};