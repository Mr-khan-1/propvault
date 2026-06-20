import { motion } from 'framer-motion';

export default function Loader({ fullScreen, text = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-vault-gold/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-vault-gold animate-spin" />
        <div className="absolute inset-3 rounded-full border border-vault-gold/20 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-vault-gold text-sm">PV</span>
        </div>
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="text-slate-400 text-sm tracking-[0.2em] uppercase"
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vault-950 relative">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative z-10">{content}</div>
      </div>
    );
  }
  return <div className="flex justify-center py-20">{content}</div>;
}
