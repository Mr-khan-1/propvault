import { motion } from 'framer-motion';

const styles = {
  approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  suspended: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  inactive: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export default function StatusBadge({ status, pulse = false }) {
  const key = status?.toLowerCase?.() || 'pending';
  const cls = styles[key] || styles.pending;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${cls}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
        </span>
      )}
      {status}
    </motion.span>
  );
}
