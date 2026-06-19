import React, { useState, useRef } from 'react';
import {
  Trash2, Upload, Play, PlusCircle, User, Clock, Star, Activity,
  Settings as SettingsIcon, Type, Pencil, X, Save, AlarmClock,
  FileText, TrendingDown, BarChart2
} from 'lucide-react';
import { Operator, AdminPanelProps, AppSettings } from '../types';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Padrão/Limpa)' },
  { value: 'Montserrat', label: 'Montserrat (Moderna/Geométrica)' },
  { value: 'Poppins', label: 'Poppins (Arredondada/Simpática)' },
  { value: 'Oswald', label: 'Oswald (Forte/Condensada)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (Impactante/Gritante)' },
  { value: 'Orbitron', label: 'Orbitron (Futurista/Tech)' },
  { value: 'Raleway', label: 'Raleway (Elegante/Moderna)' },
  { value: 'Nunito', label: 'Nunito (Suave/Amigável)' },
  { value: 'Lato', label: 'Lato (Clássica/Profissional)' },
  { value: 'Ubuntu', label: 'Ubuntu (Moderna/Dinâmica)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegante/Clássica)' },
  { value: 'Roboto Slab', label: 'Roboto Slab (Forte/Serifada)' },
];

const parseTmaToSeconds = (tmaStr: string): number => {
  if (!tmaStr) return 0;
  const parts = tmaStr.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return minutes * 60 + seconds;
  }
  const num = parseFloat(tmaStr);
  return isNaN(num) ? 0 : num;
};

const getTmaColorClass = (tmaStr: string): string => {
  const sec = parseTmaToSeconds(tmaStr);
  return sec <= 239 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800';
};

const getNpsColorClass = (npsValue: string | number): string => {
  const val = parseFloat(String(npsValue).replace(',', '.'));
  if (isNaN(val)) return 'bg-emerald-100 text-emerald-800';
  if (val >= 90) return 'bg-emerald-100 text-emerald-800';
  if (val >= 85) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
};

const getMonitoriaColorClass = (monValue: string | number): string => {
  const val = parseFloat(String(monValue).replace('%', '').replace(',', '.'));
  if (isNaN(val)) return 'bg-emerald-100 text-emerald-800';
  if (val >= 96) return 'bg-emerald-100 text-emerald-800';
  if (val >= 90) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
};

const getAbsColorClass = (absStr: string): string => {
  if (!absStr) return 'bg-emerald-100 text-emerald-800';
  const val = parseFloat(String(absStr).replace('%', '').replace(',', '.'));
  if (isNaN(val)) return 'bg-emerald-100 text-emerald-800';
  if (val === 0) return 'bg-emerald-100 text-emerald-800';
  if (val <= 2.0) return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-800';
};

// ── Indicator Badge ──────────────────────────────────────────────────────────
const Badge: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}> = ({ icon, label, value, color }) => (
  <span
    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}
    title={label}
  >
    {icon}
    {value}
  </span>
);

// ── Main Component ───────────────────────────────────────────────────────────
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
  const [abs, setAbs] = useState('');
  const [resumo, setResumo] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, escolha uma imagem menor que 2MB.');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setName('');
    setTma('');
    setNps('');
    setMonitoria('');
    setAbs('');
    setResumo('');
    setPhoto(null);
    setPhotoFile(null);
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEditClick = (op: Operator) => {
    setName(op.name);
    setTma(op.tma);
    setNps(op.nps);
    setMonitoria(op.monitoria);
    setAbs(op.abs || '');
    setResumo(op.resumo || '');
    setPhoto(op.photo);
    setPhotoFile(null);
    setEditingId(op.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id: string) => {
    if (editingId === id) resetForm();
    onRemoveOperator(id);
  };

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 9);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tma || !nps || !monitoria || !abs || (!photo && !photoFile)) {
      alert('Por favor, preencha todos os campos obrigatórios e adicione uma foto.');
      return;
    }

    const base: Omit<Operator, 'id'> = {
      name,
      tma,
      nps,
      monitoria,
      abs,
      resumo,
      photo: photo || '',
      photoFile: photoFile || undefined,
    };

    if (editingId) {
      onEditOperator({ id: editingId, ...base });
    } else {
      onAddOperator({ id: generateId(), ...base });
    }

    resetForm();
  };

  const handleStyleChange = (styleKey: 'nameStyle' | 'resumoStyle', field: string, value: string) => {
    const currentStyle = settings[styleKey] || { font: 'Playfair Display', size: 'xl', weight: 'normal', align: 'center' };
    onUpdateSettings({
      ...settings,
      [styleKey]: {
        ...currentStyle,
        [field]: value
      }
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 text-gray-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight">
              Painel de Controle
            </h1>
            <p className="text-gray-500 mt-1">Gestão de Performance do Call Center</p>
          </div>
          <button
            onClick={onSwitchMode}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <Play size={20} fill="currentColor" />
            Iniciar Apresentação na TV
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left Column ── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Form */}
            <div className={`bg-white p-6 rounded-2xl shadow-md border transition-all ${editingId ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                  {editingId ? <Pencil className="text-indigo-600" size={20} /> : <PlusCircle className="text-indigo-600" size={20} />}
                  {editingId ? 'Editar Operador' : 'Novo Operador'}
                </h2>
                {editingId && (
                  <button onClick={resetForm} className="text-xs flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                    <X size={14} /> Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Photo Upload */}
                <div className="flex flex-col items-center justify-center mb-2">
                  <div
                    className="w-28 h-28 rounded-full bg-gray-100 border-4 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors relative group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400 p-2">
                        <Upload className="mx-auto mb-1" size={22} />
                        <span className="text-xs">Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-full flex items-center justify-center">
                      {photo && <Upload className="text-white opacity-0 group-hover:opacity-100" size={20} />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Máx. 2 MB</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                </div>

                {/* Nome */}
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={17} />
                  <input
                    type="text"
                    placeholder="Nome do Operador *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>

                {/* TMA */}
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-gray-400" size={17} />
                  <input
                    type="text"
                    placeholder="TMA (ex: 04:30) *"
                    value={tma}
                    onChange={(e) => setTma(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>

                {/* NPS + Monitoria */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Star className="absolute left-3 top-3 text-gray-400" size={17} />
                    <input
                      type="number"
                      placeholder="NPS *"
                      value={nps}
                      onChange={(e) => setNps(e.target.value)}
                      className="w-full pl-10 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 text-gray-400" size={17} />
                    <input
                      type="number"
                      placeholder="Monitoria *"
                      value={monitoria}
                      onChange={(e) => setMonitoria(e.target.value)}
                      className="w-full pl-10 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                {/* ABS */}
                <div className="relative">
                  <TrendingDown className="absolute left-3 top-3 text-gray-400" size={17} />
                  <input
                    type="text"
                    placeholder="ABS / Absenteísmo (ex: 2,5%) *"
                    value={abs}
                    onChange={(e) => setAbs(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all"
                  />
                </div>

                {/* Resumo */}
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400" size={17} />
                  <textarea
                    placeholder="Resumo / Destaques do operador (opcional — exibido na TV)"
                    value={resumo}
                    onChange={(e) => setResumo(e.target.value)}
                    rows={3}
                    maxLength={200}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition-all resize-none"
                  />
                  <p className="text-right text-xs text-gray-400 mt-0.5">{resumo.length}/200</p>
                </div>

                <button
                  type="submit"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 mt-1 ${editingId ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white hover:scale-[1.02]`}
                >
                  {editingId
                    ? <><Save size={18} /> Atualizar Operador</>
                    : <><PlusCircle size={18} /> Salvar Operador</>
                  }
                </button>
              </form>
            </div>

            {/* Settings */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
                <SettingsIcon className="text-indigo-600" size={20} />
                Configurações da TV
              </h2>
              <div className="space-y-6">
                
                {/* Seção Estilo do Nome */}
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                    <Type size={15} className="text-indigo-500" /> Estilo do Nome
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Fonte</label>
                      <select
                        value={settings.nameStyle?.font || 'Playfair Display'}
                        onChange={(e) => handleStyleChange('nameStyle', 'font', e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {FONT_OPTIONS.map(f => (
                          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tamanho</label>
                        <select
                          value={settings.nameStyle?.size || '6xl'}
                          onChange={(e) => handleStyleChange('nameStyle', 'size', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="xl">Pequeno (xl)</option>
                          <option value="2xl">Médio (2xl)</option>
                          <option value="3xl">Grande (3xl)</option>
                          <option value="4xl">G (4xl)</option>
                          <option value="5xl">GG (5xl)</option>
                          <option value="6xl">Super (6xl)</option>
                          <option value="7xl">Ultra (7xl)</option>
                          <option value="8xl">Mega (8xl)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Peso</label>
                        <select
                          value={settings.nameStyle?.weight || 'bold'}
                          onChange={(e) => handleStyleChange('nameStyle', 'weight', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="semibold">Semibold</option>
                          <option value="bold">Bold</option>
                          <option value="black">Black</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Alinhamento</label>
                        <select
                          value={settings.nameStyle?.align || 'center'}
                          onChange={(e) => handleStyleChange('nameStyle', 'align', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção Estilo do Resumo */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                    <FileText size={15} className="text-indigo-500" /> Estilo do Resumo
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Fonte</label>
                      <select
                        value={settings.resumoStyle?.font || 'Playfair Display'}
                        onChange={(e) => handleStyleChange('resumoStyle', 'font', e.target.value)}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        {FONT_OPTIONS.map(f => (
                          <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tamanho</label>
                        <select
                          value={settings.resumoStyle?.size || 'xl'}
                          onChange={(e) => handleStyleChange('resumoStyle', 'size', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="xl">Pequeno (xl)</option>
                          <option value="2xl">Médio (2xl)</option>
                          <option value="3xl">Grande (3xl)</option>
                          <option value="4xl">G (4xl)</option>
                          <option value="5xl">GG (5xl)</option>
                          <option value="6xl">Super (6xl)</option>
                          <option value="7xl">Ultra (7xl)</option>
                          <option value="8xl">Mega (8xl)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Peso</label>
                        <select
                          value={settings.resumoStyle?.weight || 'normal'}
                          onChange={(e) => handleStyleChange('resumoStyle', 'weight', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="normal">Normal</option>
                          <option value="semibold">Semibold</option>
                          <option value="bold">Bold</option>
                          <option value="black">Black</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Alinhamento</label>
                        <select
                          value={settings.resumoStyle?.align || 'center'}
                          onChange={(e) => handleStyleChange('resumoStyle', 'align', e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none"
                        >
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── Right Column: Operator List ── */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 h-full">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BarChart2 className="text-indigo-500" size={22} />
                  Equipe Cadastrada
                  <span className="text-sm font-normal text-gray-400 ml-1">({operators.length})</span>
                </h2>
              </div>

              {operators.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                  <User size={48} className="mb-2 opacity-40" />
                  <p className="font-medium">Nenhum operador cadastrado.</p>
                  <p className="text-sm">Use o formulário ao lado para começar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[720px] overflow-y-auto pr-1">
                  {operators.map((op) => (
                    <div
                      key={op.id}
                      className={`p-4 rounded-xl border transition-all ${editingId === op.id
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-slate-50 border-gray-100 hover:shadow-md hover:border-indigo-100'
                        }`}
                    >
                      {/* Top row: photo + name + actions */}
                      <div className="flex items-start gap-3">
                        <img
                          src={op.photo}
                          alt={op.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-gray-900 truncate text-sm"
                            style={{ fontFamily: settings.nameStyle?.font || 'Playfair Display' }}
                          >
                            {op.name}
                          </h3>
                          {/* Indicators row */}
                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                            <Badge icon={<Clock size={10} />} label="TMA" value={op.tma} color={getTmaColorClass(op.tma)} />
                            <Badge icon={<Star size={10} />} label="NPS" value={String(op.nps)} color={getNpsColorClass(op.nps)} />
                            <Badge icon={<Activity size={10} />} label="Monitoria" value={`${op.monitoria}%`} color={getMonitoriaColorClass(op.monitoria)} />
                            <Badge icon={<TrendingDown size={10} />} label="ABS" value={op.abs || '—'} color={getAbsColorClass(op.abs || '')} />
                          </div>
                          {/* Resumo preview */}
                          {op.resumo && (
                            <p className="text-xs text-gray-400 mt-1.5 italic truncate">
                              "{op.resumo}"
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditClick(op)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteClick(op.id); }}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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