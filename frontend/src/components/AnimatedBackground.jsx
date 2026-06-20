import { motion } from 'framer-motion';

export default function AnimatedBackground({ variant = 'default' }) {
  const intense = variant === 'auth';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-vault-950" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 bg-hero-gradient" />

      <motion.div
        className={`absolute rounded-full blur-3xl ${intense ? 'w-[520px] h-[520px] bg-vault-gold/10' : 'w-96 h-96 bg-vault-gold/5'}`}
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '8%', right: '5%' }}
      />
      <motion.div
        className={`absolute rounded-full blur-3xl ${intense ? 'w-[420px] h-[420px] bg-amber-500/10' : 'w-80 h-80 bg-amber-500/5'}`}
        animate={{ x: [0, -70, 50, 0], y: [0, 50, -30, 0], scale: [1, 0.9, 1.08, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        style={{ bottom: '10%', left: '0%' }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full blur-3xl bg-violet-500/5"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '45%', left: '35%' }}
      />

      <div className="absolute inset-0 noise-overlay opacity-[0.035]" />
    </div>
  );
}
