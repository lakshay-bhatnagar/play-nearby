
-- Venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  supported_sports TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venues" ON public.venues FOR SELECT TO authenticated USING (true);

-- Venue slots table
CREATE TABLE public.venue_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.venue_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venue slots" ON public.venue_slots FOR SELECT TO authenticated USING (true);

-- Products (equipment) table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  rent_price_per_day NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  description TEXT,
  can_buy BOOLEAN NOT NULL DEFAULT true,
  can_rent BOOLEAN NOT NULL DEFAULT true,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO authenticated USING (true);

-- Orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  venue_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  equipment_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  cgst NUMERIC(10,2) NOT NULL DEFAULT 0,
  sgst NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'upi',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'buy',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  return_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can create own order items" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Payments table (separate venue vs equipment)
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_type TEXT NOT NULL DEFAULT 'venue',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'upi',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Trigger: notify game host when someone joins
CREATE OR REPLACE FUNCTION public.notify_on_game_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _game RECORD;
  _joiner_name TEXT;
BEGIN
  SELECT * INTO _game FROM public.games WHERE id = NEW.game_id;
  SELECT COALESCE(name, 'Someone') INTO _joiner_name FROM public.profiles WHERE user_id = NEW.user_id LIMIT 1;
  
  IF _game.host_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, title, message, link)
    VALUES (
      _game.host_id,
      _joiner_name || ' joined your game 💪',
      _joiner_name || ' has joined "' || _game.title || '"',
      '/activity'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_game_participant_joined
AFTER INSERT ON public.game_participants
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_game_join();

-- Mark venue slots as unavailable when booked
-- Add venue_id and venue_slot_ids to games table
ALTER TABLE public.games ADD COLUMN venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL;
ALTER TABLE public.games ADD COLUMN venue_slot_ids UUID[] DEFAULT '{}';

-- Updated at triggers for new tables
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add activity points columns to profiles
ALTER TABLE public.profiles ADD COLUMN activity_points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN games_created INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN games_joined INTEGER NOT NULL DEFAULT 0;

-- Trigger: update activity points when joining a game
CREATE OR REPLACE FUNCTION public.update_activity_on_join()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET
    activity_points = activity_points + 10,
    games_joined = games_joined + 1
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_join_update_activity
AFTER INSERT ON public.game_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_on_join();

-- Trigger: update activity points when creating a game
CREATE OR REPLACE FUNCTION public.update_activity_on_create()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET
    activity_points = activity_points + 5,
    games_created = games_created + 1
  WHERE user_id = NEW.host_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_game_create_update_activity
AFTER INSERT ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_activity_on_create();
