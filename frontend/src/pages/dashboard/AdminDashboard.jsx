import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Home, MessageSquare, CheckCircle, XCircle, Ban, Trash2, Shield } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

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

  const handleAgent = async (id, action) => {
    setActionLoading(id + action);
    try {
      if (action === 'approve') await adminAPI.approveAgent(id);
      else if (action === 'reject') await adminAPI.rejectAgent(id);
      else await adminAPI.suspendAgent(id);
      await load();
    } catch (e) { alert(e.response?.data?.message || 'Action failed'); }
    finally { setActionLoading(''); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'users', label: 'Users' },
    { id: 'properties', label: 'Properties' },
    { id: 'inquiries', label: 'Inquiries' },
  ];

  if (loading) return <Loader fullScreen text="Loading Admin Dashboard" />;

  const stats = data?.stats || {};

  return (
    <div className="page-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-vault-gold" size={28} />
          <h1 className="font-display text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-slate-400 mb-8">Full platform control — agents, users, properties & inquiries</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-vault-gold text-vault-950' : 'glass text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <StatCard icon={Users} label="Users" value={stats.totalUsers} color="blue" delay={0} />
            <StatCard icon={UserCheck} label="Agents" value={stats.totalAgents} color="gold" delay={0.1} />
            <StatCard icon={Home} label="Properties" value={stats.totalProperties} color="green" delay={0.2} />
            <StatCard icon={MessageSquare} label="Inquiries" value={stats.totalInquiries} color="purple" delay={0.3} />
            <StatCard icon={UserCheck} label="Pending Agents" value={stats.pendingAgents} color="red" delay={0.4} />
            <StatCard icon={Home} label="Active Listings" value={stats.activeProperties} color="green" delay={0.5} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 text-vault-gold">Pending Agent Approvals</h3>
              {agents.filter((a) => a.status === 'pending').length === 0 ? (
                <p className="text-slate-500 text-sm">No pending agents</p>
              ) : agents.filter((a) => a.status === 'pending').map((a) => (
                <div key={a._id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.email} · {a.company}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAgent(a._id, 'approve')} disabled={actionLoading}
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"><CheckCircle size={16} /></button>
                    <button onClick={() => handleAgent(a._id, 'reject')} disabled={actionLoading}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><XCircle size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold mb-4 text-vault-gold">Recent Inquiries</h3>
              {(data?.recentInquiries || []).slice(0, 5).map((inq) => (
                <div key={inq._id} className="py-3 border-b border-white/5 last:border-0">
                  <p className="text-sm font-medium">{inq.propertyId?.title}</p>
                  <p className="text-xs text-slate-400">{inq.userId?.name} → {inq.agentId?.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'agents' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-slate-400">
              <th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Company</th>
              <th className="text-left p-4">Status</th><th className="text-left p-4">Actions</th>
            </tr></thead>
            <tbody>
              {agents.map((a) => (
                <tr key={a._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 font-medium">{a.name}</td>
                  <td className="p-4 text-slate-400">{a.email}</td>
                  <td className="p-4 text-slate-400">{a.company}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs capitalize ${
                    a.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                    a.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{a.status}</span></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {a.status === 'pending' && <>
                        <button onClick={() => handleAgent(a._id, 'approve')} className="text-emerald-400 hover:underline text-xs">Approve</button>
                        <button onClick={() => handleAgent(a._id, 'reject')} className="text-red-400 hover:underline text-xs">Reject</button>
                      </>}
                      {a.status === 'approved' && (
                        <button onClick={() => handleAgent(a._id, 'suspend')} className="text-amber-400 hover:underline text-xs flex items-center gap-1"><Ban size={12} /> Suspend</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'users' && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/5 text-slate-400">
              <th className="text-left p-4">Name</th><th className="text-left p-4">Email</th><th className="text-left p-4">Phone</th>
              <th className="text-left p-4">Status</th><th className="text-left p-4">Actions</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="p-4">{u.name}</td><td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4 text-slate-400">{u.phone}</td>
                  <td className="p-4"><span className={`text-xs ${u.isActive ? 'text-emerald-400' : 'text-red-400'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-4">
                    <button onClick={async () => { await adminAPI.toggleUser(u._id); load(); }}
                      className="text-vault-gold text-xs hover:underline">{u.isActive ? 'Deactivate' : 'Activate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'properties' && (
        <div className="grid gap-4">
          {properties.map((p) => (
            <div key={p._id} className="glass rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-slate-400">{p.address?.city} · Rs {p.price?.toLocaleString()} · {p.agent?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs capitalize text-slate-400">{p.status}</span>
                <button onClick={async () => { if (confirm('Delete?')) { await adminAPI.deleteProperty(p._id); load(); } }}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div key={inq._id} className="glass rounded-xl p-5">
              <div className="flex justify-between mb-2">
                <p className="font-medium">{inq.propertyId?.title}</p>
                <span className="text-xs px-2 py-1 bg-white/5 rounded-full capitalize">{inq.status}</span>
              </div>
              <p className="text-sm text-slate-400 mb-2">{inq.message}</p>
              <p className="text-xs text-slate-500">From: {inq.userId?.name} ({inq.userId?.email}) → Agent: {inq.agentId?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
