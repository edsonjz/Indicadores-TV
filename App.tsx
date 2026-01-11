import React, { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { PresentationMode } from './components/PresentationMode';
import { Operator, ViewMode, AppSettings } from './types';
import { supabase } from './supabaseClient';

const DEFAULT_SETTINGS: AppSettings = {
  font: 'Playfair Display',
  slideDuration: 8
};

const App: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [viewMode, setViewMode] = useState<ViewMode>('admin');
  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount and set up Realtime
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
        const { data: setData, error: setError } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (setData) {
          setSettings({
            font: setData.font,
            slideDuration: setData.slide_duration
          });
        }

      } catch (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // 3. Set up Realtime Subscriptions
    const operatorsSubscription = supabase
      .channel('operators-changes')
      .on('postgres_changes', { event: '*', table: 'operators', schema: 'public' }, () => {
        // Refresh operator list on any change
        const refreshOperators = async () => {
          const { data } = await supabase
            .from('operators')
            .select('*')
            .order('name', { ascending: true });
          if (data) setOperators(data as Operator[]);
        };
        refreshOperators();
      })
      .subscribe();

    const settingsSubscription = supabase
      .channel('settings-changes')
      .on('postgres_changes', { event: 'UPDATE', table: 'settings', schema: 'public', filter: 'id=eq.1' }, (payload) => {
        setSettings({
          font: payload.new.font,
          slideDuration: payload.new.slide_duration
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(operatorsSubscription);
      supabase.removeChannel(settingsSubscription);
    };
  }, []);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
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

  const addOperator = async (operator: Operator) => {
    try {
      // Atualização Otimista
      setOperators((prev) => [...prev, operator].sort((a, b) => a.name.localeCompare(b.name)));

      let photoUrl = operator.photo;
      if (operator.photoFile) {
        const uploadedUrl = await uploadPhoto(operator.photoFile);
        if (uploadedUrl) photoUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from('operators')
        .insert([{
          id: operator.id,
          name: operator.name,
          photo: photoUrl,
          tma: operator.tma,
          nps: operator.nps,
          monitoria: operator.monitoria
        }]);

      if (error) {
        console.error('Erro ao adicionar operador:', error);
        alert('Erro ao salvar no banco de dados.');
        // Refresh full list on error to ensure sync
        const { data } = await supabase
          .from('operators')
          .select('*')
          .order('name', { ascending: true });
        if (data) setOperators(data as Operator[]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const editOperator = async (updatedOperator: Operator) => {
    try {
      // Atualização Otimista
      setOperators((prev) =>
        prev.map((op) => (op.id === updatedOperator.id ? updatedOperator : op))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      let photoUrl = updatedOperator.photo;
      if (updatedOperator.photoFile) {
        const uploadedUrl = await uploadPhoto(updatedOperator.photoFile);
        if (uploadedUrl) photoUrl = uploadedUrl;
      }

      const { error } = await supabase
        .from('operators')
        .update({
          name: updatedOperator.name,
          photo: photoUrl,
          tma: updatedOperator.tma,
          nps: updatedOperator.nps,
          monitoria: updatedOperator.monitoria
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
    console.log('Iniciando remoção do operador:', id);
    try {
      // 1. Atualização Otimista (remove da UI imediatamente)
      const previousOperators = [...operators];
      setOperators((prev) => prev.filter((op) => String(op.id) !== String(id)));

      // 2. Busca o operador para deletar a foto depois
      const operatorToDelete = previousOperators.find(op => String(op.id) === String(id));

      const { error } = await supabase
        .from('operators')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar no Supabase:', error);
        alert(`Não foi possível excluir: ${error.message}`);
        // Reverte se der erro
        setOperators(previousOperators);
      } else {
        console.log('Operador excluído do banco com sucesso.');
        // 3. Limpeza opcional do Storage
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
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          font: newSettings.font,
          slide_duration: newSettings.slideDuration
        });

      if (error) {
        console.error('Erro ao salvar configurações:', error);
      }
      // Realtime will update the local state
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMode = () => {
    setViewMode((prev) => (prev === 'admin' ? 'presentation' : 'admin'));
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-600">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <p>Conectando ao banco de dados...</p>
    </div>
  );

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