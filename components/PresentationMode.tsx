import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Clock, Star, Activity, TrendingDown, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Operator, PresentationModeProps } from '../types';

// ── Color Schemes & Helper Types ─────────────────────────────────────────────
interface ColorScheme {
  iconColor: string;
  iconBg: string;
  glow: string;
  valueColor: string;
  borderColor: string;
}

const colorSchemes: Record<'green' | 'yellow' | 'red', ColorScheme> = {
  green: {
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    glow: 'drop-shadow-[0_0_15px_rgba(16,185,129,0.65)]',
    valueColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/35',
  },
  yellow: {
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border border-amber-500/20',
    glow: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.65)]',
    valueColor: 'text-amber-400',
    borderColor: 'border-amber-500/35',
  },
  red: {
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10 border border-rose-500/20',
    glow: 'drop-shadow-[0_0_15px_rgba(244,63,94,0.65)]',
    valueColor: 'text-rose-500',
    borderColor: 'border-rose-500/35',
  },
};

// ── Color Logic Helpers ──────────────────────────────────────────────────────
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

const getTmaColor = (tmaStr: string): 'green' | 'red' => {
  const sec = parseTmaToSeconds(tmaStr);
  return sec <= 239 ? 'green' : 'red';
};

const getNpsColor = (npsValue: string | number): 'green' | 'yellow' | 'red' => {
  const val = parseFloat(String(npsValue).replace(',', '.'));
  if (isNaN(val)) return 'green';
  if (val >= 90) return 'green';
  if (val >= 85) return 'yellow';
  return 'red';
};

const getMonitoriaColor = (monValue: string | number): 'green' | 'yellow' | 'red' => {
  const val = parseFloat(String(monValue).replace('%', '').replace(',', '.'));
  if (isNaN(val)) return 'green';
  if (val >= 96) return 'green';
  if (val >= 90) return 'yellow';
  return 'red';
};

const getAbsColor = (absStr: string): 'green' | 'yellow' | 'red' => {
  if (!absStr) return 'green';
  const val = parseFloat(String(absStr).replace('%', '').replace(',', '.'));
  if (isNaN(val)) return 'green';
  if (val === 0) return 'green';
  if (val <= 2.0) return 'yellow';
  return 'red';
};

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay: number;
  statusColor: 'green' | 'yellow' | 'red';
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, delay, statusColor }) => {
  const scheme = colorSchemes[statusColor];
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={`bg-gray-900/60 backdrop-blur-md border ${scheme.borderColor} p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 rounded-3xl flex items-center gap-3 lg:gap-4 shadow-2xl transition-all duration-300 flex-1 min-w-0`}
    >
      <div className={`p-2.5 sm:p-3 md:p-4 lg:p-5 ${scheme.iconBg} rounded-2xl shrink-0 ${scheme.iconColor} flex items-center justify-center`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] md:text-xs lg:text-sm mb-1 truncate">{label}</p>
        <p className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black tabular-nums tracking-tight ${scheme.valueColor} ${scheme.glow} whitespace-nowrap`}>{value}</p>
      </div>
    </motion.div>
  );
};

// ── Main Component ───────────────────────────────────────────────────────────
export const PresentationMode: React.FC<PresentationModeProps> = ({
  operators,
  settings,
  onSwitchMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard navigation callbacks
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % operators.length);
  }, [operators.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + operators.length) % operators.length);
  }, [operators.length]);

  // Keyboard / Slide Clicker Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSwitchMode();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSwitchMode, handleNext, handlePrev]);

  // Fallback if no operators exist
  if (operators.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Aguardando Dados...</h1>
        <p className="text-gray-400 mb-8 text-center">
          Cadastre operadores no painel administrativo para iniciar a exibição.
        </p>
        <button
          onClick={onSwitchMode}
          className="bg-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Voltar ao Admin
        </button>
      </div>
    );
  }

  const currentOperator = operators[currentIndex];
  const hasResumo = Boolean(currentOperator.resumo?.trim());

  // Style helpers mapping
  const sizeClasses: Record<string, string> = {
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
    '3xl': 'text-3xl md:text-4xl',
    '4xl': 'text-4xl md:text-5xl',
    '5xl': 'text-5xl md:text-6xl',
    '6xl': 'text-6xl md:text-7xl',
    '7xl': 'text-7xl md:text-8xl',
    '8xl': 'text-8xl md:text-9xl',
  };

  const weightClasses: Record<string, string> = {
    normal: 'font-normal',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  };

  const alignClasses: Record<string, string> = {
    left: 'text-left justify-start',
    center: 'text-center justify-center',
    right: 'text-right justify-end',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative font-sans flex flex-col justify-between py-6 lg:py-10 px-6 md:px-16 z-10">
      
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950 z-0" />

      {/* Admin return button */}
      <button
        onClick={onSwitchMode}
        className="absolute top-6 left-6 z-50 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all backdrop-blur-sm"
        title="Voltar ao Admin (Esc)"
      >
        <Settings size={20} />
      </button>

      {/* Side edge navigation buttons (hover visible) */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-gray-900/40 hover:bg-gray-800/80 rounded-full text-gray-500 hover:text-white transition-all backdrop-blur-sm opacity-0 hover:opacity-100 focus:opacity-100 group"
        title="Anterior (Seta Esquerda / Page Up)"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 bg-gray-900/40 hover:bg-gray-800/80 rounded-full text-gray-500 hover:text-white transition-all backdrop-blur-sm opacity-0 hover:opacity-100 focus:opacity-100 group"
        title="Próximo (Seta Direita / Page Down)"
      >
        <ChevronRight size={24} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentOperator.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(4px)' }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="relative z-10 flex flex-col items-center justify-between flex-grow w-full max-w-7xl mx-auto py-2"
        >
          
          {/* Centered Main Content Area (Photo & Name) */}
          <div className="flex flex-col items-center justify-center flex-grow w-full my-auto gap-6 lg:gap-8 py-2">
            
            {/* ── Photo with Pulse and Ken Burns (Enlarged) ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="relative shrink-0 flex justify-center items-center"
            >
              {/* Neon glow ring */}
              <div className="absolute -inset-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full opacity-50 blur-2xl animate-pulse" />

              {/* Photo circle */}
              <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 xl:w-[24rem] xl:h-[24rem] rounded-full overflow-hidden border-8 border-gray-900 shadow-2xl z-10">
                <motion.img
                  key={`img-${currentOperator.id}`}
                  src={currentOperator.photo}
                  alt={currentOperator.name}
                  className="w-full h-full object-cover"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.12 }}
                  transition={{ duration: 12, ease: 'easeOut' }}
                />
              </div>
            </motion.div>

            {/* ── Operator Name directly below the photo ── */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              style={{ fontFamily: settings.nameStyle?.font || settings.font || 'Playfair Display' }}
              className={`${sizeClasses[settings.nameStyle?.size || '6xl'] || 'text-6xl'} ${weightClasses[settings.nameStyle?.weight || 'bold'] || 'font-bold'} ${alignClasses[settings.nameStyle?.align || 'center']?.split(' ')[0] || 'text-center'} text-white tracking-wider uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] w-full px-4`}
            >
              {currentOperator.name}
            </motion.h1>
          </div>

          {/* ── Stats 1×4 Horizontal Row ── */}
          <div className="grid grid-cols-4 gap-4 lg:gap-6 w-full mt-auto pt-6 border-t border-white/5 shrink-0">
            <StatCard
              label="TMA"
              value={currentOperator.tma}
              icon={<Clock size={28} />}
              delay={0.6}
              statusColor={getTmaColor(currentOperator.tma)}
            />
            <StatCard
              label="NPS"
              value={String(currentOperator.nps)}
              icon={<Star size={28} fill="currentColor" />}
              delay={0.7}
              statusColor={getNpsColor(currentOperator.nps)}
            />
            <StatCard
              label="Monitoria"
              value={`${currentOperator.monitoria}%`}
              icon={<Activity size={28} />}
              delay={0.8}
              statusColor={getMonitoriaColor(currentOperator.monitoria)}
            />
            <StatCard
              label="ABS"
              value={currentOperator.abs || '—'}
              icon={<TrendingDown size={28} />}
              delay={0.9}
              statusColor={getAbsColor(currentOperator.abs || '')}
            />
          </div>

          {/* ── Resumo (Quotes block) below the indicators ── */}
          {hasResumo && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="max-w-4xl w-full px-4 mt-6 shrink-0"
            >
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4 sm:px-10 sm:py-5 shadow-xl">
                <Quote size={20} className="absolute -top-3 left-6 text-indigo-400 rotate-180 bg-gray-950 px-1" />
                <p
                  className={`${sizeClasses[settings.resumoStyle?.size || 'xl'] || 'text-xl'} ${weightClasses[settings.resumoStyle?.weight || 'normal'] || 'font-normal'} ${alignClasses[settings.resumoStyle?.align || 'center']?.split(' ')[0] || 'text-center'} text-gray-200 leading-relaxed`}
                  style={{ fontFamily: settings.resumoStyle?.font || settings.font || 'Playfair Display' }}
                >
                  {currentOperator.resumo}
                </p>
                <Quote size={20} className="absolute -bottom-3 right-6 text-indigo-400 bg-gray-950 px-1" />
              </div>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};