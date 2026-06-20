import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, User, Send } from 'lucide-react';
import { userAPI } from '../../utils/api';
import StatCard from '../../components/StatCard';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';

export default function UserDashboard() {
  const [data, setData] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userAPI.dashboard(), userAPI.inquiries(), userAPI.favorites()])
      .then(([dash, inq, fav]) => {
        setData(dash.data);
        setInquiries(inq.data.inquiries);
        setFavorites(fav.data.properties);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen text="Loading Dashboard" />;

  const stats = data?.stats || {};

  return (
    <div className="page-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <User className="text-vault-gold" size={24} />
          <h1 className="font-display text-3xl font-bold">My Dashboard</h1>
        </div>
        <p className="text-slate-400 mb-8">Welcome back, {data?.user?.name}</p>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8">
        {['overview', 'inquiries', 'favorites'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${tab === t ? 'bg-vault-gold text-vault-950' : 'glass text-slate-400 hover:text-white'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard icon={MessageSquare} label="Total Inquiries" value={stats.totalInquiries} color="blue" />
            <StatCard icon={Send} label="Pending" value={stats.pendingInquiries} color="gold" />
            <StatCard icon={Heart} label="Favorites" value={stats.favoriteCount} color="red" />
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Recent Inquiries</h3>
            {(data?.recentInquiries || []).length === 0 ? (
              <p className="text-slate-500 text-sm">No inquiries yet. <Link to="/properties" className="text-vault-gold hover:underline">Browse properties</Link></p>
            ) : data.recentInquiries.map((inq) => (
              <div key={inq._id} className="py-3 border-b border-white/5 last:border-0 flex justify-between">
                <div>
                  <p className="font-medium text-sm">{inq.propertyId?.title}</p>
                  <p className="text-xs text-slate-400">{inq.message?.slice(0, 60)}...</p>
                </div>
                <span className="text-xs capitalize text-slate-500">{inq.status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
              <p>No inquiries sent yet</p>
              <Link to="/properties" className="btn-primary mt-4 inline-block">Find Properties</Link>
            </div>
          ) : inquiries.map((inq) => (
            <div key={inq._id} className="glass rounded-xl p-5">
              <div className="flex justify-between mb-2">
                <Link to={`/properties/${inq.propertyId?._id}`} className="font-medium hover:text-vault-gold transition">
                  {inq.propertyId?.title}
                </Link>
                <span className="text-xs px-2 py-1 bg-white/5 rounded-full capitalize">{inq.status}</span>
              </div>
              <p className="text-sm text-slate-300 mb-2">{inq.message}</p>
              <p className="text-xs text-slate-500">Agent: {inq.agentId?.name} · {inq.agentId?.company}</p>
              {inq.agentResponse?.message && (
                <div className="mt-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-400 font-medium mb-1">Agent Response</p>
                  <p className="text-sm text-slate-300">{inq.agentResponse.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-10">No favorites saved yet</p>
          ) : favorites.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
