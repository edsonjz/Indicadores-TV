import React, { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { PresentationMode } from './components/PresentationMode';
import { Operator, ViewMode, AppSettings } from './types';
import { supabase } from './supabaseClient';

const DEFAULT_SETTINGS: AppSettings = {
  slideDuration: 8,
  nameStyle: {
    font: 'Playfair Display',
    size: '6xl',
    weight: 'bold',
    align: 'center',
  },
  resumoStyle: {
    font: 'Playfair Display',
    size: 'xl',
    weight: 'normal',
    align: 'center',
  },
};

const App: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [loading, setLoading] = useState(true);

  // ── Load data from Supabase + Realtime subscriptions ──────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Operators
        const { data: opsData, error: opsError } = await supabase
          .from('operators')
          .select('*')
          .order('name', { ascending: true });

        if (opsError) throw opsError;
        if (opsData) setOperators(opsData as Operator[]);

        // 2. Fetch Settings
        const { data: setData } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (setData) {
          setSettings({
            slideDuration: setData.slide_duration || 8,
            nameStyle: {
              font: setData.name_font || setData.font || 'Playfair Display',
              size: setData.name_size || '6xl',
              weight: setData.name_weight || 'bold',
              align: setData.name_align || 'center',
            },
            resumoStyle: {
              font: setData.resumo_font || setData.font || 'Playfair Display',
              size: setData.resumo_size || 'xl',
              weight: setData.resumo_weight || 'normal',
              align: setData.resumo_align || 'center',
            },
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime — operators
    const operatorsSubscription = supabase
      .channel('operators-changes')
      .on('postgres_changes', { event: '*', table: 'operators', schema: 'public' }, async () => {
        const { data } = await supabase
          .from('operators')
          .select('*')
          .order('name', { ascending: true });
        if (data) setOperators(data as Operator[]);
      })
      .subscribe();

    // Realtime — settings
    const settingsSubscription = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', table: 'settings', schema: 'public', filter: 'id=eq.1' },
        (payload) => {
          setSettings({
            slideDuration: payload.new.slide_duration || 8,
            nameStyle: {
              font: payload.new.name_font || payload.new.font || 'Playfair Display',
              size: payload.new.name_size || '6xl',
              weight: payload.new.name_weight || 'bold',
              align: payload.new.name_align || 'center',
            },
            resumoStyle: {
              font: payload.new.resumo_font || payload.new.font || 'Playfair Display',
              size: payload.new.resumo_size || 'xl',
              weight: payload.new.resumo_weight || 'normal',
              align: payload.new.resumo_align || 'center',
            },
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(operatorsSubscription);
      supabase.removeChannel(settingsSubscription);
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}.${fileExt}`;
    const filePath = `operator-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('operator-photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao enviar foto:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('operator-photos').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const buildPayload = (op: Operator, photoUrl: string) => ({
    id: op.id,
    name: op.name,
    photo: photoUrl,
    tma: op.tma,
    nps: op.nps,
    monitoria: op.monitoria,
    abs: op.abs,
    resumo: op.resumo,
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const addOperator = async (operator: Operator) => {
    try {
      setOperators((prev) =>
        [...prev, operator].sort((a, b) => a.name.localeCompare(b.name))
      );

      let photoUrl = operator.photo;
      if (operator.photoFile) {
        const uploaded = await uploadPhoto(operator.photoFile);
        if (uploaded) photoUrl = uploaded;
      }

      const { error } = await supabase
        .from('operators')
        .insert([buildPayload(operator, photoUrl)]);

      if (error) {
        console.error('Erro ao adicionar operador:', error);
        alert('Erro ao salvar no banco de dados.');
        const { data } = await supabase.from('operators').select('*').order('name', { ascending: true });
        if (data) setOperators(data as Operator[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editOperator = async (updatedOperator: Operator) => {
    try {
      setOperators((prev) =>
        prev.map((op) => (op.id === updatedOperator.id ? updatedOperator : op))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      let photoUrl = updatedOperator.photo;
      if (updatedOperator.photoFile) {
        const uploaded = await uploadPhoto(updatedOperator.photoFile);
        if (uploaded) photoUrl = uploaded;
      }

      const { error } = await supabase
        .from('operators')
        .update({
          name: updatedOperator.name,
          photo: photoUrl,
          tma: updatedOperator.tma,
          nps: updatedOperator.nps,
          monitoria: updatedOperator.monitoria,
          abs: updatedOperator.abs,
          resumo: updatedOperator.resumo,
        })
        .eq('id', updatedOperator.id);

      if (error) {
        console.error('Erro ao atualizar operador:', error);
        alert('Erro ao atualizar no banco de dados.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeOperator = async (id: string) => {
    try {
      const previousOperators = [...operators];
      setOperators((prev) => prev.filter((op) => String(op.id) !== String(id)));

      const operatorToDelete = previousOperators.find((op) => String(op.id) === String(id));

      const { error } = await supabase.from('operators').delete().eq('id', id);

      if (error) {
        console.error('Erro ao deletar no Supabase:', error);
        alert(`Não foi possível excluir: ${error.message}`);
        setOperators(previousOperators);
      } else {
        // Cleanup storage photo
        if (operatorToDelete?.photo.includes('operator-photos')) {
          const path = operatorToDelete.photo.split('operator-photos/').pop();
          if (path) {
            await supabase.storage.from('operator-photos').remove([`operator-photos/${path}`]);
          }
        }
      }
    } catch (err) {
      console.error('Erro inesperado ao excluir:', err);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    try {
      const { error } = await supabase.from('settings').upsert({
        id: 1,
        slide_duration: newSettings.slideDuration,
        name_font: newSettings.nameStyle.font,
        name_size: newSettings.nameStyle.size,
        name_weight: newSettings.nameStyle.weight,
        name_align: newSettings.nameStyle.align,
        resumo_font: newSettings.resumoStyle.font,
        resumo_size: newSettings.resumoStyle.size,
        resumo_weight: newSettings.resumoStyle.weight,
        resumo_align: newSettings.resumoStyle.align,
      });
      if (error) console.error('Erro ao salvar configurações:', error);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMode = () => setViewMode((prev) => (prev === 'admin' ? 'presentation' : 'admin'));

  // ── Loading Screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 to-indigo-950 flex flex-col items-center justify-center text-gray-300">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-800 border-t-indigo-400 animate-spin" />
        </div>
        <p className="text-lg font-medium tracking-wide">Conectando ao banco de dados...</p>
        <p className="text-sm text-gray-500 mt-1">Indicadores TV</p>
      </div>
    );
  }

  // ── App ──────────────────────────────────────────────────────────────────────
  return (
    <div className="font-sans">
      {viewMode === 'admin' ? (
        <AdminPanel
          operators={operators}
          settings={settings}
          onAddOperator={addOperator}
          onEditOperator={editOperator}
          onRemoveOperator={removeOperator}
          onUpdateSettings={updateSettings}
          onSwitchMode={toggleMode}
        />
      ) : (
        <PresentationMode
          operators={operators}
          settings={settings}
          onSwitchMode={toggleMode}
        />
      )}
    </div>
  );
};

export default App;