import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Maximize, Eye } from 'lucide-react';

const formatPrice = (price, purpose) => {
  if (price >= 10000000) return `Rs ${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `Rs ${(price / 100000).toFixed(1)} L`;
  return purpose === 'rent' ? `Rs ${price.toLocaleString()}/mo` : `Rs ${price.toLocaleString()}`;
};

export default function PropertyCard({ property, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
    >
      <Link to={`/properties/${property._id}`} className="group block">
        <div className="glass-card overflow-hidden p-0 hover:shadow-2xl hover:shadow-vault-gold/5">
          <div className="relative h-56 overflow-hidden">
            <img
              src={property.images?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-vault-950 via-transparent to-transparent" />
            <span className="absolute top-4 left-4 px-3 py-1 bg-vault-gold text-vault-950 text-xs font-bold rounded-full uppercase">
              {property.purpose}
            </span>
            <span className="absolute top-4 right-4 px-3 py-1 glass text-xs rounded-full capitalize">
              {property.type}
            </span>
          </div>
          <div className="p-5">
            <h3 className="font-display font-bold text-lg text-white mb-2 line-clamp-2 group-hover:text-vault-gold transition-colors">
              {property.title}
            </h3>
            <p className="flex items-center gap-1 text-slate-400 text-sm mb-4">
              <MapPin size={14} className="text-vault-gold" />
              {property.address?.city}
            </p>
            <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms}</span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
              )}
              <span className="flex items-center gap-1"><Maximize size={14} /> {property.area} sqft</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xl font-bold text-gradient">{formatPrice(property.price, property.purpose)}</span>
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <Eye size={12} /> {property.views || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
