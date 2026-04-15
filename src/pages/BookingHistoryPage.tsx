import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar } from 'lucide-react';

export default function BookingHistoryPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-background pb-28">
      <div className="px-5 pt-14 pb-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold text-foreground">Booking History</h1>
        </div>
      </div>
      <div className="px-5 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-3xl bg-secondary border border-border flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-1">No bookings yet</h2>
          <p className="text-sm text-muted-foreground text-center max-w-[250px]">
            Your venue bookings will appear here once the booking feature is available
          </p>
        </motion.div>
      </div>
    </div>
  );
}
