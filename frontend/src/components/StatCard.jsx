import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = 'gold', delay = 0 }) {
  const colors = {
    gold: 'from-vault-gold/20 to-amber-500/5 border-vault-gold/20 text-vault-gold',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/20 text-blue-400',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    red: 'from-red-500/20 to-red-500/5 border-red-500/20 text-red-400',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/20 text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`stat-card bg-gradient-to-br ${colors[color]} border`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl bg-white/5 ${colors[color].split(' ').pop()}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
