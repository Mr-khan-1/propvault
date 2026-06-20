import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize, Heart, Send, User, Building2, ArrowLeft } from 'lucide-react';
import { propertyAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import PropertyCard from '../../components/PropertyCard';
import Loader from '../../components/Loader';

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState('');
  const [inquiryError, setInquiryError] = useState('');
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    propertyAPI.getOne(id)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const sendInquiry = async (e) => {
    e.preventDefault();
    if (!user) return setInquiryError('Please login as a user to send inquiry');
    if (user.userType !== 'user') return setInquiryError('Only users can send inquiries. Agents cannot send inquiries.');
    setInquiryLoading(true);
    setInquiryError('');
    try {
      await propertyAPI.sendInquiry({ propertyId: id, message: inquiryMsg });
      setInquirySuccess('Inquiry sent successfully! Agent will contact you soon.');
      setInquiryMsg('');
    } catch (err) {
      setInquiryError(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!data?.property) return (
    <div className="page-container text-center py-20">
      <p className="text-slate-400">Property not found</p>
      <Link to="/properties" className="btn-outline mt-4 inline-block">Back to listings</Link>
    </div>
  );

  const { property, similarProperties } = data;
  const images = property.images?.length ? property.images : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'];

  return (
    <div className="page-container py-10">
      <Link to="/properties" className="inline-flex items-center gap-2 text-slate-400 hover:text-vault-gold mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Properties
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-2xl overflow-hidden">
            <img src={images[activeImg]} alt={property.title} className="w-full h-80 md:h-[450px] object-cover" />
            {images.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? 'border-vault-gold' : 'border-transparent opacity-60'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-vault-gold/20 text-vault-gold text-xs rounded-full uppercase font-medium">{property.purpose}</span>
              <span className="px-3 py-1 bg-white/5 text-slate-300 text-xs rounded-full capitalize">{property.type}</span>
              <span className="px-3 py-1 bg-white/5 text-slate-300 text-xs rounded-full">{property.furnished}</span>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">{property.title}</h1>
            <p className="flex items-center gap-2 text-slate-400 mb-6"><MapPin size={16} className="text-vault-gold" /> {property.address?.city}</p>
            <p className="text-slate-300 leading-relaxed">{property.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
              {property.bedrooms > 0 && <div className="text-center"><Bed className="mx-auto text-vault-gold mb-1" size={20} /><p className="font-bold">{property.bedrooms}</p><p className="text-xs text-slate-500">Bedrooms</p></div>}
              {property.bathrooms > 0 && <div className="text-center"><Bath className="mx-auto text-vault-gold mb-1" size={20} /><p className="font-bold">{property.bathrooms}</p><p className="text-xs text-slate-500">Bathrooms</p></div>}
              <div className="text-center"><Maximize className="mx-auto text-vault-gold mb-1" size={20} /><p className="font-bold">{property.area}</p><p className="text-xs text-slate-500">Sq Ft</p></div>
            </div>

            {property.amenities?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span key={a} className="px-3 py-1 bg-white/5 rounded-lg text-sm text-slate-300">{a}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 sticky top-24">
            <p className="text-slate-400 text-sm">Price</p>
            <p className="text-3xl font-display font-bold text-gradient mb-6">
              {property.purpose === 'rent' ? `Rs ${property.price.toLocaleString()}/mo` : `Rs ${property.price.toLocaleString()}`}
            </p>

            {property.agent && (
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-6">
                <div className="w-12 h-12 rounded-full bg-vault-gold/20 flex items-center justify-center">
                  <User className="text-vault-gold" size={20} />
                </div>
                <div>
                  <p className="font-medium">{property.agent.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><Building2 size={12} /> {property.agent.company}</p>
                </div>
              </div>
            )}

            {user?.userType === 'user' ? (
              <form onSubmit={sendInquiry} className="space-y-3">
                <textarea className="input-field min-h-[100px] resize-none" placeholder="Write your inquiry message..."
                  value={inquiryMsg} onChange={(e) => setInquiryMsg(e.target.value)} required />
                {inquiryError && <p className="text-red-400 text-sm">{inquiryError}</p>}
                {inquirySuccess && <p className="text-emerald-400 text-sm">{inquirySuccess}</p>}
                <button type="submit" disabled={inquiryLoading} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Send size={16} /> {inquiryLoading ? 'Sending...' : 'Send Inquiry'}
                </button>
              </form>
            ) : user?.userType === 'agent' ? (
              <p className="text-amber-400/80 text-sm p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                Agents cannot send inquiries. You can manage your own listings from the dashboard.
              </p>
            ) : (
              <Link to="/auth/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <Heart size={16} /> Login to Inquire
              </Link>
            )}
          </div>
        </div>
      </div>

      {similarProperties?.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Similar Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProperties.map((p, i) => <PropertyCard key={p._id} property={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
