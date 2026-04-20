-- Allow any authenticated user to view game-linked orders for transparency
-- so all participants/viewers can see the amount paid by the organizer.
CREATE POLICY "Anyone can view game orders for transparency"
ON public.orders
FOR SELECT
TO authenticated
USING (game_id IS NOT NULL);