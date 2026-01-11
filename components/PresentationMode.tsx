import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Clock, Star, Activity, Trophy, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Operator, PresentationModeProps } from '../types';

export const PresentationMode: React.FC<PresentationModeProps> = ({ operators, settings, onSwitchMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback if no operators exist
  if (operators.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-bold mb-4 text-center">Aguardando Dados...</h1>
        <p className="text-gray-400 mb-8 text-center">Cadastre operadores no painel administrativo para iniciar a exibição.</p>
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
  // Ensure duration is valid
  const slideDuration = Math.max(3, settings.slideDuration || 8); 

  const triggerConfetti = useCallback(() => {
    // Z-Index strategy: Background(0) < Confetti(5) < Content(10)
    const CONFETTI_Z_INDEX = 5; 
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#ffffff'];
    const mode = Math.floor(Math.random() * 3);

    if (mode === 0) {
      // MODO 1: Canhões Laterais (School Pride)
      const end = Date.now() + 2000;

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          shapes: ['circle', 'square'],
          scalar: 1.2,
          zIndex: CONFETTI_Z_INDEX,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          shapes: ['circle', 'square'],
          scalar: 1.2,
          zIndex: CONFETTI_Z_INDEX,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

    } else if (mode === 1) {
      // MODO 2: Explosão Realista (Realistic Burst)
      const count = 250;
      const defaults = { origin: { y: 0.7 }, zIndex: CONFETTI_Z_INDEX };

      const fire = (particleRatio: number, opts: any) => {
        confetti({
          ...defaults,
          ...opts,
          colors,
          particleCount: Math.floor(count * particleRatio)
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

    } else {
      // MODO 3: Chuva de Fogos (Fireworks)
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: CONFETTI_Z_INDEX };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
          colors
        });
      }, 200);
    }
  }, []);

  useEffect(() => {
    // Initial confetti
    triggerConfetti();

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % operators.length);
      triggerConfetti();
    }, slideDuration * 1000);

    return () => clearInterval(interval);
  }, [operators.length, triggerConfetti, slideDuration]);

  // Handle keyboard escape to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSwitchMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSwitchMode]);

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Ambience (Z-Index 0) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-gray-950 to-gray-950 z-0"></div>
      
      {/* Subtle Return Button */}
      <button
        onClick={onSwitchMode}
        className="absolute top-6 left-6 z-50 p-2 bg-gray-800/50 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-all backdrop-blur-sm"
        title="Voltar ao Admin (Esc)"
      >
        <Settings size={20} />
      </button>

      {/* Main Content Area (Z-Index 10 - Above Confetti) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentOperator.id}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4"
        >
            {/* Operator Name - Customized Font */}
            <motion.h1 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                style={{ fontFamily: settings.font }}
                className="text-4xl md:text-7xl font-bold text-white mb-8 text-center tracking-widest uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]"
            >
              {currentOperator.name}
            </motion.h1>

            {/* Main Layout: Photo and Stats */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 w-full max-w-7xl justify-center">
                
                {/* Photo Container with Neon Glow */}
                <div className="relative group shrink-0">
                    {/* Rotating glow ring */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-full opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
                    
                    {/* Decorative Icons */}
                    <motion.div 
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="absolute -top-6 -right-6 z-20 bg-yellow-400 text-yellow-900 p-3 rounded-full shadow-lg border-4 border-gray-900"
                    >
                        <Trophy size={40} />
                    </motion.div>

                    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-8 border-gray-900 shadow-2xl z-10">
                        {/* Zoom Effect Image */}
                        <motion.img 
                            key={`img-${currentOperator.id}`}
                            src={currentOperator.photo} 
                            alt={currentOperator.name} 
                            className="w-full h-full object-cover"
                            initial={{ scale: 1 }}
                            animate={{ scale: 1.15 }}
                            transition={{ duration: slideDuration, ease: "linear" }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    
                    {/* HERO STAT: NPS (Main Highlight) */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-yellow-900/40 via-yellow-800/20 to-gray-900/60 backdrop-blur-md border-2 border-yellow-500/50 p-6 rounded-2xl flex items-center justify-between gap-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]"
                    >
                         {/* Shine Effect */}
                         <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-yellow-400/20 blur-3xl rounded-full"></div>

                        <div className="flex items-center gap-6 z-10">
                            <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="p-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl text-yellow-950 shadow-lg shadow-yellow-500/20"
                            >
                                <Star size={48} fill="currentColor" className="text-yellow-950" />
                            </motion.div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Crown size={16} className="text-yellow-400" />
                                    <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm">Principal Indicador</p>
                                </div>
                                <p className="text-gray-200 font-medium text-lg">NPS</p>
                            </div>
                        </div>
                        
                        <div className="z-10 text-right">
                             <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 tabular-nums drop-shadow-sm">
                                {currentOperator.nps}
                            </p>
                        </div>
                    </motion.div>

                    {/* Secondary Stat: TMA */}
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-5 rounded-2xl flex items-center gap-4"
                    >
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
                            <Clock size={32} />
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">TMA</p>
                            <p className="text-3xl font-bold text-white tabular-nums drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                                {currentOperator.tma}
                            </p>
                        </div>
                    </motion.div>

                     {/* Secondary Stat: Quality */}
                     <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gray-900/60 backdrop-blur-md border border-gray-800 p-5 rounded-2xl flex items-center gap-4"
                    >
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                            <Activity size={32} />
                        </div>
                        <div>
                            <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">Qualidade</p>
                            <p className="text-3xl font-bold text-white tabular-nums drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                                {currentOperator.monitoria}%
                            </p>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Progress Bar (Timer) */}
            <motion.div 
                key={`progress-${currentOperator.id}`}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: slideDuration, ease: "linear" }}
                className="absolute bottom-0 left-0 h-2 bg-gradient-to-r from-yellow-500 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(234,179,8,0.6)]"
            />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};