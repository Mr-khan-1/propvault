import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, MessageSquare, Plus, Edit, Trash2, Eye, Briefcase, MessageCircle } from 'lucide-react';
import { agentAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';
import ChatWindow from '../../components/Chat/ChatWindow';

const EMPTY_FORM = {
  title: '', description: '', type: 'apartment', purpose: 'sale',
  price: '', area: '', bedrooms: '', bathrooms: '', city: '',
  images: '', amenities: '', furnished: 'unfurnished', parking: false
};

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [myProperties, setMyProperties] = useState([]);
  const [browseProperties, setBrowseProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [responseText, setResponseText] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [dash, mine, browse, inq] = await Promise.all([
        agentAPI.dashboard(), agentAPI.myProperties(),
        agentAPI.browseProperties({ limit: 6 }), agentAPI.inquiries()
      ]);
      setData(dash.data);
      setMyProperties(mine.data.properties);
      setBrowseProperties(browse.data.properties);
      setInquiries(inq.data.inquiries);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({
      title: p.title, description: p.description, type: p.type, purpose: p.purpose,
      price: p.price, area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
      city: p.address?.city || '', images: p.images?.join(', ') || '',
      amenities: p.amenities?.join(', ') || '', furnished: p.furnished, parking: p.parking
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const saveProperty = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price), area: Number(form.area),
      bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
      images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      amenities: form.amenities ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editId) await agentAPI.updateProperty(editId, payload);
      else await agentAPI.createProperty(payload);
      setShowForm(false);
      load();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const deleteProperty = async (id) => {
    if (!confirm('Delete this property?')) return;
    await agentAPI.deleteProperty(id);
    load();
  };

  const respondInquiry = async (id) => {
    const message = responseText[id];
    if (!message) return;
    await agentAPI.respondInquiry(id, { message });
    setResponseText({ ...responseText, [id]: '' });
    load();
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'my-properties', label: 'My Properties' },
    { id: 'browse', label: 'Browse All' },
    { id: 'inquiries', label: 'Inquiries' },
  ];

  if (loading) return <Loader fullScreen text="Loading Agent Dashboard" />;

  const stats = data?.stats || {};

  return (
    <div className="page-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Briefcase className="text-vault-gold" size={24} />
              <h1 className="font-display text-3xl font-bold">Agent Dashboard</h1>
            </div>
            <p className="text-slate-400">Manage your listings · View others · Respond to inquiries</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Property
          </button>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-vault-gold text-vault-950' : 'glass text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.form initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onSubmit={saveProperty} className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-xl font-bold mb-4">{editId ? 'Edit Property' : 'New Property'}</h3>
            <div className="space-y-3">
              <input className="input-field" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <textarea className="input-field min-h-[80px]" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {['apartment', 'house', 'villa', 'commercial', 'land'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="input-field" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
                  <option value="sale">Sale</option><option value="rent">Rent</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" type="number" placeholder="Price (PKR)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                <input className="input-field" type="number" placeholder="Area (sqft)" required value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input className="input-field" type="number" placeholder="Beds" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
                <input className="input-field" type="number" placeholder="Baths" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
                <input className="input-field" placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <input className="input-field" placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              <input className="input-field" placeholder="Amenities (comma separated)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline flex-1">Cancel</button>
            </div>
          </motion.form>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard icon={Home} label="My Properties" value={stats.totalProperties} color="gold" />
            <StatCard icon={Eye} label="Active" value={stats.activeProperties} color="green" />
            <StatCard icon={Home} label="Sold" value={stats.soldProperties} color="blue" />
            <StatCard icon={MessageSquare} label="Inquiries" value={stats.totalInquiries} color="purple" />
            <StatCard icon={MessageSquare} label="Pending" value={stats.pendingInquiries} color="red" />
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Recent Inquiries</h3>
            {(data?.recentInquiries || []).length === 0 ? <p className="text-slate-500 text-sm">No inquiries yet</p> :
              data.recentInquiries.map((inq) => (
                <div key={inq._id} className="py-3 border-b border-white/5 last:border-0">
                  <p className="font-medium text-sm">{inq.propertyId?.title}</p>
                  <p className="text-xs text-slate-400">{inq.userId?.name}: {inq.message?.slice(0, 80)}...</p>
                </div>
              ))}
          </div>
        </>
      )}

      {tab === 'my-properties' && (
        <div className="space-y-4">
          {myProperties.length === 0 ? <p className="text-slate-400 text-center py-10">No properties yet. Add your first listing!</p> :
            myProperties.map((p) => (
              <div key={p._id} className="glass rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={p.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.address?.city} · Rs {p.price?.toLocaleString()} · <span className="capitalize">{p.status}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/properties/${p._id}`} className="p-2 text-slate-400 hover:text-white"><Eye size={16} /></Link>
                  <button onClick={() => openEdit(p)} className="p-2 text-vault-gold hover:bg-vault-gold/10 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => deleteProperty(p._id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
        </div>
      )}

      {tab === 'browse' && (
        <>
          <p className="text-slate-400 text-sm mb-6">View all platform properties (read-only — you can only manage your own)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {browseProperties.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
          </div>
        </>
      )}

      {tab === 'inquiries' && (
        <div className="space-y-4">
          {inquiries.length === 0 ? <p className="text-slate-400 text-center py-10">No inquiries received</p> :
            inquiries.map((inq) => (
              <div key={inq._id} className="glass rounded-xl p-5">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">{inq.propertyId?.title}</p>
                  <span className="text-xs px-2 py-1 bg-white/5 rounded-full capitalize">{inq.status}</span>
                </div>
                <p className="text-sm text-slate-300 mb-1">{inq.message}</p>
                <p className="text-xs text-slate-500 mb-3">From: {inq.userId?.name} · {inq.userId?.email} · {inq.userId?.phone}</p>
                {inq.agentResponse?.message && (
                  <p className="text-xs text-emerald-400 mb-3">Your response: {inq.agentResponse.message}</p>
                )}
                {inq.status === 'pending' && (
                  <div className="flex gap-2">
                    <input className="input-field flex-1 text-sm" placeholder="Write response..."
                      value={responseText[inq._id] || ''} onChange={(e) => setResponseText({ ...responseText, [inq._id]: e.target.value })} />
                    <button onClick={() => respondInquiry(inq._id)} className="btn-primary text-sm px-4">Reply</button>
                  </div>
                )}
                
                <div className="mt-4 border-t border-white/5 pt-3 flex justify-end">
                  <button 
                    onClick={() => setActiveChat(inq.userId)}
                    className="btn-outline py-1.5 px-4 text-xs flex items-center gap-2"
                  >
                    <MessageCircle size={14} /> Chat with User
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
      
      {activeChat && user && (
        <ChatWindow 
          currentUser={user} 
          chatPartner={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}
