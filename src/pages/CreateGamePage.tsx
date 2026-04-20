import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, X, Users, Zap, MapPin, Calendar, Clock, ShoppingBag, Plus, Minus } from 'lucide-react';
import { SPORTS, SPORT_ICONS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Venue { id: string; name: string; location: string; supported_sports: string[]; }
interface VenueSlot { id: string; venue_id: string; slot_date: string; start_time: string; end_time: string; price_per_hour: number; is_available: boolean; }
interface Product { id: string; name: string; sport: string; price: number; rent_price_per_day: number; description: string | null; }

type Step = 'sport' | 'venue' | 'slots' | 'details' | 'equipment' | 'checkout';

export default function CreateGamePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedVenueId = searchParams.get('venue');

  const [step, setStep] = useState<Step>('sport');
  const [sport, setSport] = useState('');
  const [title, setTitle] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [alreadyJoined, setAlreadyJoined] = useState(1);
  const [skillLevel, setSkillLevel] = useState('');
  const [intensity, setIntensity] = useState('medium');

  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [slots, setSlots] = useState<VenueSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<VenueSlot[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Record<string, { qty: number; mode: 'buy' | 'rent' }>>({});
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  // Preload preselected venue
  useEffect(() => {
    if (!preselectedVenueId) return;
    supabase.from('venues').select('*').eq('id', preselectedVenueId).single().then(({ data }) => {
      if (data) {
        const v = data as any;
        setSelectedVenue(v);
        if (v.supported_sports?.length === 1) {
          setSport(v.supported_sports[0]);
          setStep('slots');
          setSelectedDate(new Date().toISOString().split('T')[0]);
        } else {
          setStep('sport');
        }
      }
    });
  }, [preselectedVenueId]);

  // Fetch venues when sport is selected
  useEffect(() => {
    if (!sport) return;
    supabase.from('venues').select('*').contains('supported_sports', [sport]).then(({ data }) => {
      setVenues((data as any[]) || []);
    });
  }, [sport]);

  // Fetch slots when venue and date are selected
  useEffect(() => {
    if (!selectedVenue || !selectedDate) return;
    supabase.from('venue_slots').select('*')
      .eq('venue_id', selectedVenue.id)
      .eq('slot_date', selectedDate)
      .eq('is_available', true)
      .order('start_time', { ascending: true })
      .then(({ data }) => setSlots((data as any[]) || []));
  }, [selectedVenue, selectedDate]);

  // Fetch products when entering equipment step
  useEffect(() => {
    if (step !== 'equipment') return;
    supabase.from('products').select('*').eq('sport', sport).then(({ data }) => {
      setProducts((data as any[]) || []);
    });
  }, [step, sport]);

  const venueCost = selectedSlots.reduce((sum, s) => sum + Number(s.price_per_hour), 0);
  const equipmentCost = Object.entries(cart).reduce((sum, [id, { qty, mode }]) => {
    const p = products.find(pr => pr.id === id);
    if (!p) return sum;
    return sum + (mode === 'buy' ? p.price : p.rent_price_per_day) * qty;
  }, 0);
  const subtotal = venueCost + equipmentCost;
  const cgst = Math.round(subtotal * 0.09 * 100) / 100;
  const sgst = Math.round(subtotal * 0.09 * 100) / 100;
  const total = subtotal + cgst + sgst;

  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const toggleSlot = (slot: VenueSlot) => {
    setSelectedSlots(prev =>
      prev.find(s => s.id === slot.id)
        ? prev.filter(s => s.id !== slot.id)
        : [...prev, slot]
    );
  };

  const updateCart = (id: string, qty: number, mode: 'buy' | 'rent') => {
    if (qty <= 0) {
      setCart(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setCart(prev => ({ ...prev, [id]: { qty, mode } }));
    }
  };

  const handlePay = async () => {
    if (!user || !selectedVenue) return;
    setLoading(true);

    const dateTime = selectedSlots.length > 0
      ? new Date(`${selectedSlots[0].slot_date}T${selectedSlots[0].start_time}`).toISOString()
      : new Date().toISOString();

    // Create game.
    // current_players starts at (alreadyJoined - 1) because the host's auto-join below
    // triggers update_game_player_count which increments by 1, landing on alreadyJoined.
    const { data: gameData, error: gameErr } = await supabase.from('games').insert({
      host_id: user.id,
      sport,
      title,
      location: selectedVenue.location,
      venue_id: selectedVenue.id,
      venue_slot_ids: selectedSlots.map(s => s.id),
      date_time: dateTime,
      max_players: maxPlayers,
      current_players: Math.max(0, alreadyJoined - 1),
      skill_level: skillLevel,
      intensity,
    }).select().single();

    if (gameErr) {
      toast({ title: 'Error creating game', description: gameErr.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Create order
    const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
      user_id: user.id,
      game_id: gameData.id,
      venue_cost: venueCost,
      equipment_cost: equipmentCost,
      cgst,
      sgst,
      total_amount: total,
      payment_method: paymentMethod,
      status: 'completed',
    }).select().single();

    if (orderErr) {
      toast({ title: 'Error creating order', description: orderErr.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    // Create order items for equipment
    const items = Object.entries(cart).map(([productId, { qty, mode }]) => {
      const p = products.find(pr => pr.id === productId)!;
      return {
        order_id: orderData.id,
        product_id: productId,
        quantity: qty,
        mode,
        unit_price: mode === 'buy' ? p.price : p.rent_price_per_day,
        return_date: mode === 'rent' ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : null,
      };
    });

    if (items.length > 0) {
      await supabase.from('order_items').insert(items);
    }

    // Create payments
    if (venueCost > 0) {
      await supabase.from('payments').insert({ order_id: orderData.id, user_id: user.id, payment_type: 'venue', amount: venueCost + cgst / 2 + sgst / 2, payment_method: paymentMethod, status: 'completed' });
    }
    if (equipmentCost > 0) {
      await supabase.from('payments').insert({ order_id: orderData.id, user_id: user.id, payment_type: 'equipment', amount: equipmentCost + cgst / 2 + sgst / 2, payment_method: paymentMethod, status: 'completed' });
    }

    // Mark slots as unavailable
    for (const s of selectedSlots) {
      await supabase.from('venue_slots').update({ is_available: false }).eq('id', s.id);
    }

    // Auto-join as participant
    await supabase.from('game_participants').insert({ game_id: gameData.id, user_id: user.id });

    setLoading(false);
    toast({ title: 'Game Created! 🎉', description: 'Payment successful' });
    navigate(`/payment-confirmation/${orderData.id}`, { replace: true });
  };

  const formatDay = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date.getTime() === today.getTime()) return 'Today';
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  };

  const renderStep = () => {
    switch (step) {
      case 'sport':
        return (
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Select Sport</label>
              <div className="flex flex-wrap gap-2">
                {SPORTS.slice(0, 12).map(s => (
                  <motion.button key={s} whileTap={{ scale: 0.93 }} onClick={() => { setSport(s); setSelectedVenue(null); setSelectedSlots([]); }}
                    className={`px-3.5 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 transition-all ${sport === s ? 'bg-neon-blue/15 border-neon-blue/40 text-neon-blue border' : 'bg-secondary border border-border text-secondary-foreground'}`}>
                    <span>{SPORT_ICONS[s]}</span>{s}
                  </motion.button>
                ))}
              </div>
            </div>
            {sport && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }} onClick={() => setStep('venue')}
                className="w-full py-4 rounded-2xl bg-neon-blue text-primary-foreground font-semibold neon-glow-blue">
                Next → Select Venue
              </motion.button>
            )}
          </div>
        );

      case 'venue':
        return (
          <div className="flex flex-col gap-4">
            <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Venues for {sport}
            </label>
            {venues.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card border border-border border-dashed text-center">
                <p className="text-muted-foreground text-sm">No venues available for {sport}</p>
              </div>
            ) : (
              venues.map(v => (
                <motion.button key={v.id} whileTap={{ scale: 0.97 }} onClick={() => { setSelectedVenue(v); setStep('slots'); setSelectedDate(getNextDays()[0]); }}
                  className={`p-4 rounded-2xl border text-left transition-all ${selectedVenue?.id === v.id ? 'bg-neon-blue/10 border-neon-blue/30' : 'bg-card border-border'}`}>
                  <h3 className="font-semibold text-foreground text-sm">{v.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{v.location}</p>
                </motion.button>
              ))
            )}
            <button onClick={() => setStep('sport')} className="text-xs text-muted-foreground underline mt-2">← Back to sport selection</button>
          </div>
        );

      case 'slots':
        return (
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-2xl bg-card border border-border">
              <p className="text-xs text-muted-foreground">{selectedVenue?.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedVenue?.location}</p>
            </div>
            <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Select Date</label>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
              {getNextDays().map(d => (
                <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlots([]); }}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedDate === d ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-secondary border border-border text-secondary-foreground'}`}>
                  {formatDay(d)}
                </button>
              ))}
            </div>
            <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Available Slots</label>
            {slots.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 bg-card rounded-2xl border border-border border-dashed text-center">No slots available</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {slots.map(s => {
                  const selected = selectedSlots.find(ss => ss.id === s.id);
                  return (
                    <motion.button key={s.id} whileTap={{ scale: 0.95 }} onClick={() => toggleSlot(s)}
                      className={`p-3 rounded-2xl border text-left transition-all ${selected ? 'bg-neon-green/10 border-neon-green/30' : 'bg-card border-border'}`}>
                      <div className="text-sm font-medium text-foreground">{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</div>
                      <div className="text-xs text-neon-green font-mono mt-1">₹{s.price_per_hour}/hr</div>
                      {selected && <Check className="w-3 h-3 text-neon-green mt-1" />}
                    </motion.button>
                  );
                })}
              </div>
            )}
            {selectedSlots.length > 0 && (
              <div className="p-3 rounded-2xl bg-neon-green/5 border border-neon-green/20">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Venue Cost</span><span className="font-mono font-bold text-neon-green">₹{venueCost}</span></div>
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setStep('venue')} className="flex-1 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm font-medium">← Back</button>
              {selectedSlots.length > 0 && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.97 }} onClick={() => setStep('details')}
                  className="flex-1 py-3 rounded-2xl bg-neon-blue text-primary-foreground font-semibold text-sm neon-glow-blue">Next →</motion.button>
              )}
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Game Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue/50 transition-all"
                placeholder="e.g. Evening pickup game" />
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Max Players</label>
              <div className="flex items-center gap-4">
                <input type="range" min={2} max={30} value={maxPlayers} onChange={e => setMaxPlayers(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-blue [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(187,100%,50%,0.5)]" />
                <span className="font-mono text-lg font-bold text-foreground w-8 text-center">{maxPlayers}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2 block">Players Already Joining</label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={maxPlayers - 1} value={alreadyJoined} onChange={e => setAlreadyJoined(Number(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-secondary cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neon-green [&::-webkit-slider-thumb]:shadow-[0_0_12px_hsl(110,100%,55%,0.5)]" />
                <span className="font-mono text-lg font-bold text-foreground w-8 text-center">{alreadyJoined}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{maxPlayers - alreadyJoined} slots remaining</p>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Skill Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <motion.button key={level} whileTap={{ scale: 0.95 }} onClick={() => setSkillLevel(level)}
                    className={`py-3 rounded-2xl text-sm font-medium capitalize transition-all relative ${skillLevel === level ? level === 'beginner' ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : level === 'intermediate' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-orange/15 text-neon-orange border border-neon-orange/30' : 'bg-secondary border border-border text-muted-foreground'}`}>
                    {skillLevel === level && <Check className="w-3 h-3 absolute top-2 right-2" />}{level}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Intensity</label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <motion.button key={level} whileTap={{ scale: 0.95 }} onClick={() => setIntensity(level)}
                    className={`py-3 rounded-2xl text-sm font-medium capitalize transition-all ${intensity === level ? level === 'low' ? 'bg-neon-green/15 text-neon-green border border-neon-green/30' : level === 'medium' ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-neon-orange/15 text-neon-orange border border-neon-orange/30' : 'bg-secondary border border-border text-muted-foreground'}`}>
                    {level}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('slots')} className="flex-1 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm font-medium">← Back</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { if (!title || !skillLevel) { toast({ title: 'Fill all fields', variant: 'destructive' }); return; } setStep('equipment'); }}
                className="flex-1 py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold neon-glow-green">Create Game →</motion.button>
            </div>
          </div>
        );

      case 'equipment':
        return (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border text-center">
              <ShoppingBag className="w-6 h-6 mx-auto text-neon-blue mb-2" />
              <h3 className="font-semibold text-foreground text-base">Need Equipment?</h3>
              <p className="text-xs text-muted-foreground mt-1">Buy or rent {sport} gear for your game</p>
            </div>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No equipment available for {sport}</p>
            ) : (
              products.map(p => {
                const inCart = cart[p.id];
                return (
                  <div key={p.id} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-foreground text-sm">{p.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{p.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground">Buy: <span className="text-neon-blue font-mono">₹{p.price}</span></span>
                      <span className="text-xs text-muted-foreground">Rent: <span className="text-neon-green font-mono">₹{p.rent_price_per_day}/day</span></span>
                    </div>
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <div className="flex rounded-xl bg-secondary p-0.5 flex-1">
                          <button onClick={() => updateCart(p.id, inCart.qty, 'buy')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${inCart.mode === 'buy' ? 'bg-neon-blue/15 text-neon-blue' : 'text-muted-foreground'}`}>Buy</button>
                          <button onClick={() => updateCart(p.id, inCart.qty, 'rent')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${inCart.mode === 'rent' ? 'bg-neon-green/15 text-neon-green' : 'text-muted-foreground'}`}>Rent</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCart(p.id, inCart.qty - 1, inCart.mode)} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="font-mono text-sm w-4 text-center">{inCart.qty}</span>
                          <button onClick={() => updateCart(p.id, inCart.qty + 1, inCart.mode)} className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => updateCart(p.id, 1, 'buy')} className="w-full py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-medium flex items-center justify-center gap-1">
                        <Plus className="w-3 h-3" /> Add to Order
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => { setCart({}); setStep('checkout'); }} className="flex-1 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm font-medium">Skip</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('checkout')}
                className="flex-1 py-3 rounded-2xl bg-neon-blue text-primary-foreground font-semibold text-sm neon-glow-blue">
                Proceed to Checkout →
              </motion.button>
            </div>
          </div>
        );

      case 'checkout':
        return (
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Order Summary</h3>
            <div className="p-4 rounded-2xl bg-card border border-border flex flex-col gap-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Venue Cost</span><span className="font-mono text-foreground">₹{venueCost.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equipment Cost</span><span className="font-mono text-foreground">₹{equipmentCost.toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">CGST (9%)</span><span className="font-mono text-muted-foreground">₹{cgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs"><span className="text-muted-foreground">SGST (9%)</span><span className="font-mono text-muted-foreground">₹{sgst.toFixed(2)}</span></div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-base font-bold"><span className="text-foreground">Total</span><span className="font-mono text-neon-green">₹{total.toFixed(2)}</span></div>
            </div>

            <div>
              <label className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-3 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {['upi', 'card'].map(m => (
                  <motion.button key={m} whileTap={{ scale: 0.95 }} onClick={() => setPaymentMethod(m)}
                    className={`py-3 rounded-2xl text-sm font-medium uppercase transition-all ${paymentMethod === m ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/30' : 'bg-secondary border border-border text-muted-foreground'}`}>
                    {m === 'upi' ? '📱 UPI' : '💳 Card'}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep('equipment')} className="flex-1 py-3 rounded-2xl bg-secondary border border-border text-foreground text-sm font-medium">← Back</button>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handlePay} disabled={loading}
                className="flex-1 py-4 rounded-2xl bg-neon-green text-accent-foreground font-semibold neon-glow-green disabled:opacity-50">
                {loading ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </motion.button>
            </div>
          </div>
        );
    }
  };

  const stepTitles: Record<Step, string> = { sport: 'Select Sport', venue: 'Choose Venue', slots: 'Pick Slots', details: 'Game Details', equipment: 'Equipment', checkout: 'Checkout' };

  return (
    <div className="min-h-dvh bg-background pb-10">
      <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => {
            const steps: Step[] = ['sport', 'venue', 'slots', 'details', 'equipment', 'checkout'];
            const idx = steps.indexOf(step);
            if (idx > 0) setStep(steps[idx - 1]);
            else navigate(-1);
          }} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">{stepTitles[step]}</h1>
          <button onClick={() => navigate(-1)} className="p-2 text-muted-foreground"><X className="w-5 h-5" /></button>
        </div>
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6">
          {(['sport', 'venue', 'slots', 'details', 'equipment', 'checkout'] as Step[]).map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${(['sport', 'venue', 'slots', 'details', 'equipment', 'checkout'] as Step[]).indexOf(step) >= i ? 'bg-neon-blue' : 'bg-secondary'}`} />
          ))}
        </div>
      </div>
      <div className="px-5 relative z-10 max-w-lg">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
