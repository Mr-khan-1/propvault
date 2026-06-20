import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { propertyAPI } from '../../utils/api';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';

export default function PropertyListing() {
  const [params, setParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: params.get('city') || '',
    type: params.get('type') || '',
    purpose: params.get('purpose') || '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });

  const fetchProperties = async (searchParams) => {
    try {
      setLoading(true);
      const { data } = await propertyAPI.getAll(Object.fromEntries(searchParams));
      if (data && Array.isArray(data.properties)) {
        setProperties(data.properties);
        setTotalPages(data.pages || 1);
      } else {
        setProperties([]);
      }
    } catch (err) {
      console.error(err);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  return (
    <div className="page-container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-4xl font-bold mb-2">Browse Properties</h1>
        <p className="text-slate-400 mb-8">{properties.length} properties available</p>
      </motion.div>

      <form onSubmit={handleSearch} className="glass rounded-2xl p-6 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <input className="input-field" placeholder="Search..." value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className="input-field" placeholder="City" value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          <select className="input-field" value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All Types</option>
            {['apartment', 'house', 'villa', 'commercial', 'land'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select className="input-field" value={filters.purpose}
            onChange={(e) => setFilters({ ...filters, purpose: e.target.value })}>
            <option value="">Sale & Rent</option>
            <option value="sale">Sale</option>
            <option value="rent">Rent</option>
          </select>
          <input className="input-field" type="number" placeholder="Min Price" value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
          <button type="submit" className="btn-primary flex items-center justify-center gap-2">
            <SlidersHorizontal size={16} /> Filter
          </button>
        </div>
      </form>

      {loading ? <Loader /> : properties.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>No properties found. Try different filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
