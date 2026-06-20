import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, Home, MessageSquare, CheckCircle, XCircle, Ban,
  Trash2, Shield, Clock, Building2, FileBadge, MapPin, Phone, Mail
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import Toast from '../../components/Toast';
import Loader from '../../components/Loader';

const tabMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
};

function PendingAgentCard({ agent, actionLoading, onAction }) {
  const busy = actionLoading.startsWith(agent._id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      className="ultra-glass rounded-2xl p-5 border border-amber-500/20 card-shine"
    >
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-vault-gold/20 to-amber-500/10 border border-vault-gold/20 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-vault-gold">{agent.name?.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-white">{agent.name}</h4>
              <StatusBadge status="pending" pulse />
            </div>
            <div className="grid gap-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Mail size={12} className="text-vault-gold" /> {agent.email}</span>
              {agent.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-vault-gold" /> {agent.phone}</span>}
              {agent.company && <span className="flex items-center gap-1.5"><Building2 size={12} className="text-vault-gold" /> {agent.company}</span>}
              {agent.license && <span className="flex items-center gap-1.5"><FileBadge size={12} className="text-vault-gold" /> {agent.license}</span>}
              {agent.city && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-vault-gold" /> {agent.city}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:flex-col sm:min-w-[120px]">
          <button
            onClick={() => onAction(agent._id, 'approve')}
            disabled={busy}
            className="action-btn-approve flex-1 justify-center"
          >
            {busy && actionLoading.includes('approve') ? (
              <span className="w-3.5 h-3.5 border-2 border-emerald-300/30 border-t-emerald-300 rounded-full animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            Approve
          </button>
          <button
            onClick={() => onAction(agent._id, 'reject')}
            disabled={busy}
            className="action-btn-reject flex-1 justify-center"
          >
            {busy && actionLoading.includes('reject') ? (
              <span className="w-3.5 h-3.5 border-2 border-red-300/30 border-t-red-300 rounded-full animate-spin" />
            ) : (
              <XCircle size={14} />
            )}
            Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [dash, ag, us, pr, inq] = await Promise.all([
        adminAPI.dashboard(), adminAPI.agents(), adminAPI.users(),
        adminAPI.properties(), adminAPI.inquiries()
      ]);
      setData(dash.data);
      setAgents(ag.data.agents);
      setUsers(us.data.users);
      setProperties(pr.data.properties);
      setInquiries(inq.data.inquiries);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const pendingAgents = agents.filter((a) => a.status === 'pending');

  const handleAgent = async (id, action) => {
    const labels = { approve: 'approved', reject: 'rejected', suspend: 'suspended', unsuspend: 'unsuspended' };
    if (['reject', 'suspend'].includes(action) && !confirm(`Are you sure you want to ${action} this agent?`)) return;

    setActionLoading(id + action);
    try {
      if (action === 'approve') await adminAPI.approveAgent(id);
      else if (action === 'reject') await adminAPI.rejectAgent(id);
      else if (action === 'suspend') await adminAPI.suspendAgent(id);
      else if (action === 'unsuspend') await adminAPI.unsuspendAgent(id);
      showToast(`Agent ${labels[action]} successfully`, 'success');
      await load();
    } catch (e) {
      showToast(e.response?.data?.message || 'Action failed', 'error');
    } finally {
      setActionLoading(''); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'agents', label: 'Agents', icon: UserCheck, badge: pendingAgents.length },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'inquiries', label: 'Inquiries', icon: MessageSquare },
  ];

  if (loading) return <Loader fullScreen text="Loading Admin Dashboard" />;

  const stats = data?.stats || {};

  return (
    <div className="page-container py-10">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vault-gold/10 border border-vault-gold/20 text-vault-gold text-xs font-medium mb-3">
              <Shield size={12} /> Admin Control Center
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-400 mt-2">Manage agents, approvals, users & platform activity</p>
          </div>
          {pendingAgents.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab('agents')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-medium animate-pulse-soft"
            >
              <Clock size={16} /> {pendingAgents.length} agent{pendingAgents.length > 1 ? 's' : ''} awaiting approval
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8 p-1.5 ultra-glass rounded-2xl w-fit">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="relative tab-pill">
            {tab === t.id && (
              <motion.div
                layoutId="admin-tab"
                className="absolute inset-0 bg-gradient-to-r from-vault-gold to-amber-400 rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className={`relative z-10 inline-flex items-center gap-2 ${tab === t.id ? 'text-vault-950 font-semibold' : 'text-slate-400 hover:text-white'}`}>
              <t.icon size={15} /> {t.label}
              {t.badge > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${tab === t.id ? 'bg-vault-950/20 text-vault-950' : 'bg-amber-500/20 text-amber-300'}`}>
                  {t.badge}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && (
          <motion.div key="overview" {...tabMotion}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard icon={Users} label="Users" value={stats.totalUsers} color="blue" delay={0} />
              <StatCard icon={UserCheck} label="Agents" value={stats.totalAgents} color="gold" delay={0.05} />
              <StatCard icon={Home} label="Properties" value={stats.totalProperties} color="green" delay={0.1} />
              <StatCard icon={MessageSquare} label="Inquiries" value={stats.totalInquiries} color="purple" delay={0.15} />
              <StatCard icon={Clock} label="Pending Agents" value={stats.pendingAgents} color="red" delay={0.2} />
              <StatCard icon={Home} label="Active Listings" value={stats.activeProperties} color="green" delay={0.25} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="ultra-glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-display font-semibold text-lg text-vault-gold">Agent Approval Queue</h3>
                  {pendingAgents.length > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25">
                      {pendingAgents.length} pending
                    </span>
                  )}
                </div>
                {pendingAgents.length === 0 ? (
                  <div className="text-center py-10">
                    <CheckCircle className="mx-auto text-emerald-400/50 mb-3" size={36} />
                    <p className="text-slate-500 text-sm">All caught up — no pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    <AnimatePresence>
                      {pendingAgents.map((a) => (
                        <PendingAgentCard key={a._id} agent={a} actionLoading={actionLoading} onAction={handleAgent} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <div className="ultra-glass rounded-2xl p-6">
                <h3 className="font-display font-semibold text-lg text-vault-gold mb-5">Recent Inquiries</h3>
                <div className="space-y-1">
                  {(data?.recentInquiries || []).slice(0, 5).map((inq, i) => (
                    <motion.div
                      key={inq._id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <p className="text-sm font-medium">{inq.propertyId?.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{inq.userId?.name} → {inq.agentId?.name}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'agents' && (
          <motion.div key="agents" {...tabMotion} className="ultra-glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                    <th className="text-left p-4 font-medium">Agent</th>
                    <th className="text-left p-4 font-medium">Company</th>
                    <th className="text-left p-4 font-medium">License</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((a, i) => (
                    <motion.tr
                      key={a._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.email}</p>
                      </td>
                      <td className="p-4 text-slate-400">{a.company || '—'}</td>
                      <td className="p-4 text-slate-400 font-mono text-xs">{a.license || '—'}</td>
                      <td className="p-4">
                        <StatusBadge status={a.status} pulse={a.status === 'pending'} />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {a.status === 'pending' && (
                            <>
                              <button onClick={() => handleAgent(a._id, 'approve')} disabled={!!actionLoading} className="action-btn-approve">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button onClick={() => handleAgent(a._id, 'reject')} disabled={!!actionLoading} className="action-btn-reject">
                                <XCircle size={12} /> Reject
                              </button>
                            </>
                          )}
                          {a.status === 'approved' && (
                            <button onClick={() => handleAgent(a._id, 'suspend')} disabled={!!actionLoading} className="action-btn-warn">
                              <Ban size={12} /> Suspend
                            </button>
                          )}
                          {a.status === 'suspended' && (
                            <button onClick={() => handleAgent(a._id, 'unsuspend')} disabled={!!actionLoading} className="action-btn-approve">
                              <CheckCircle size={12} /> Unsuspend
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === 'users' && (
          <motion.div key="users" {...tabMotion} className="ultra-glass rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-slate-400 bg-white/[0.02]">
                <th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Status</th><th className="text-left p-4">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4 text-slate-400">{u.email}</td>
                    <td className="p-4 text-slate-400">{u.phone}</td>
                    <td className="p-4">
                      <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="p-4">
                      <button onClick={async () => { await adminAPI.toggleUser(u._id); showToast('User status updated'); load(); }}
                        className="text-vault-gold text-xs hover:underline">{u.isActive ? 'Deactivate' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {tab === 'properties' && (
          <motion.div key="properties" {...tabMotion} className="grid gap-4">
            {properties.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="ultra-glass rounded-xl p-4 flex items-center justify-between card-shine"
              >
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{p.address?.city} · Rs {p.price?.toLocaleString()} · {p.agent?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={p.status === 'available' ? 'active' : 'inactive'} />
                  <button onClick={async () => { if (confirm('Delete this property?')) { await adminAPI.deleteProperty(p._id); showToast('Property deleted'); load(); } }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {tab === 'inquiries' && (
          <motion.div key="inquiries" {...tabMotion} className="space-y-4">
            {inquiries.map((inq, i) => (
              <motion.div
                key={inq._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="ultra-glass rounded-xl p-5 card-shine"
              >
                <div className="flex justify-between mb-2">
                  <p className="font-medium">{inq.propertyId?.title}</p>
                  <StatusBadge status={inq.status} />
                </div>
                <p className="text-sm text-slate-400 mb-2">{inq.message}</p>
                <p className="text-xs text-slate-500">From: {inq.userId?.name} ({inq.userId?.email}) → Agent: {inq.agentId?.name}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
