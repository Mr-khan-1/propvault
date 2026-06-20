import { motion } from 'framer-motion';

export default function Loader({ fullScreen, text = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-vault-gold/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-vault-gold animate-spin" />
        <div className="absolute inset-2 rounded-full bg-vault-gold/10 animate-pulse" />
      </div>
      <p className="text-slate-400 text-sm tracking-widest uppercase">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center bg-vault-950">
        {content}
      </div>
    );
  }
  return <div className="flex justify-center py-20">{content}</div>;
}
