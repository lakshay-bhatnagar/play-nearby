import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, Calendar, Users, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SPORT_ICONS } from '@/types';

interface Venue {
  id: string; name: string; location: string; address: string | null; supported_sports: string[]; description: string | null; image_url: string | null;
}

interface Slot { id: string; price_per_hour: number; }

const VENUE_IMAGES = [
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
];

export default function VenueDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from('venues').select('*').eq('id', id).single();
      setVenue(data as any);
      const { data: slots } = await supabase.from('venue_slots').select('price_per_hour').eq('venue_id', id).eq('is_available', true);
      if (slots && slots.length > 0) {
        setMinPrice(Math.min(...slots.map((s: any) => Number(s.price_per_hour))));
      }
      setLoading(false);
    })();
  }, [id]);

  const images = venue?.image_url ? [venue.image_url, ...VENUE_IMAGES] : VENUE_IMAGES;

  if (loading) {
    return <div className="min-h-dvh bg-background flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-neon-blue border-t-transparent animate-spin" /></div>;
  }

  if (!venue) {
    return <div className="min-h-dvh bg-background flex items-center justify-center text-muted-foreground">Venue not found</div>;
  }

  return (
    <div className="min-h-dvh bg-background pb-32 overflow-x-hidden relative">
      {/* Image carousel */}
      <div className="relative w-full h-72 bg-card overflow-hidden">
        <motion.img
          key={activeImage}
          src={images[activeImage]}
          alt={venue.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />
        <button onClick={() => navigate(-1)} className="absolute top-12 left-4 w-10 h-10 rounded-full bg-background/60 backdrop-blur-md border border-border flex items-center justify-center active:scale-90 transition-transform">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button key={i} onClick={() => setActiveImage(i)}
              className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'w-6 bg-neon-blue' : 'w-1.5 bg-foreground/30'}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-6 relative z-10">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{venue.name}</h1>
        <div className="flex items-start gap-1.5 text-sm text-muted-foreground mt-1.5">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{venue.address || venue.location}</span>
        </div>

        {/* Sports */}
        <div className="mt-5">
          <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">Sports Offered</p>
          <div className="flex flex-wrap gap-2">
            {venue.supported_sports.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-xl bg-secondary border border-border text-sm font-medium text-foreground flex items-center gap-1.5">
                <span>{SPORT_ICONS[s] || '🏅'}</span>{s}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing */}
        {minPrice !== null && (
          <div className="mt-5 p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase">Starting from</p>
              <p className="text-2xl font-bold text-neon-green font-mono">₹{minPrice}<span className="text-sm text-muted-foreground font-normal">/hour</span></p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-neon-green" />
            </div>
          </div>
        )}

        {/* Description */}
        {venue.description && (
          <div className="mt-5">
            <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">About</p>
            <p className="text-sm text-foreground leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* Partner */}
        <div className="mt-5 p-4 rounded-2xl bg-card border border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Partner Venue</p>
            <p className="text-sm font-medium text-foreground">{venue.name}</p>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-0 right-0 z-40 px-5">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(`/create?venue=${venue.id}`)}
          className="w-full py-4 rounded-2xl bg-neon-blue text-primary-foreground font-semibold neon-glow-blue flex items-center justify-center gap-2">
          <Users className="w-5 h-5" /> Create Game at this Venue
        </motion.button>
      </motion.div>
    </div>
  );
}
