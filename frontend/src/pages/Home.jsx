import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, Users, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/PropertyCard';
import Loader from '../components/Loader';

export default function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ city: '', type: '', purpose: 'sale' });

  useEffect(() => {
    propertyAPI.getAll({ limit: 6 })
      .then((res) => setProperties(res.data.properties))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    navigate(`/properties?${params}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-vault-gold/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />

        <div className="page-container relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 ultra-glass rounded-full text-sm text-vault-gold mb-6"
            >
              <Sparkles size={14} className="animate-pulse-soft" /> Pakistan's Premium Property Platform
            </motion.div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl">
              <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="block">
                Discover Your
              </motion.span>
              <motion.span initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="text-gradient block">
                Perfect Property
              </motion.span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
              Buy, sell, or rent verified properties with trusted agents. Secure OTP authentication, admin-verified listings, and real-time inquiries.
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="ultra-glass rounded-2xl p-6 max-w-4xl card-shine"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input className="input-field" placeholder="City..." value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
              <select className="input-field" value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
              <select className="input-field" value={filters.purpose}
                onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2">
                <Search size={18} /> Search
              </button>
            </div>
          </motion.form>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-white/5 bg-vault-900/30">
        <div className="page-container py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: TrendingUp, label: 'Properties Listed', val: '1000+' },
            { icon: Users, label: 'Verified Agents', val: '200+' },
            { icon: Shield, label: 'Secure OTP Auth', val: '100%' },
            { icon: Sparkles, label: 'Cities Covered', val: '15+' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="inline-flex p-3 rounded-2xl bg-vault-gold/5 border border-vault-gold/10 mb-3 group-hover:scale-110 transition-transform duration-300">
                <s.icon className="text-vault-gold" size={24} />
              </div>
              <p className="font-display font-bold text-2xl text-white">{s.val}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="page-container py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Featured Properties</h2>
            <p className="text-slate-400 mt-2">Handpicked premium listings across Pakistan</p>
          </div>
          <Link to="/properties" className="hidden md:flex items-center gap-2 text-vault-gold hover:gap-3 transition-all">
            View All <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
          </div>
        )}

        <div className="text-center mt-10 md:hidden">
          <Link to="/properties" className="btn-outline inline-flex items-center gap-2">
            View All Properties <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container pb-20">
        <div className="ultra-glass rounded-3xl p-10 md:p-16 text-center relative overflow-hidden card-shine">
          <div className="absolute inset-0 shimmer opacity-30" />
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join as a buyer, seller, or register as an agent — admin approved accounts only.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/register" className="btn-primary">Create Account</Link>
              <Link to="/properties" className="btn-outline">Browse Properties</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
