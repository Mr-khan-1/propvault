import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-300',
  info: 'border-vault-gold/30 bg-vault-gold/10 text-vault-gold',
};

export default function Toast({ toast, onClose }) {
  const Icon = icons[toast?.type] || Info;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${colors[toast.type]}`}
        >
          <Icon size={18} />
          <p className="text-sm font-medium text-white">{toast.message}</p>
          <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-white">×</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
