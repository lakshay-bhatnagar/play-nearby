import { supabase } from '@/integrations/supabase/client';

export interface GameParticipantView {
  user_id: string;
  joined_at?: string;
  profile: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

export async function fetchGameParticipants(gameId: string): Promise<GameParticipantView[]> {
  const { data: participants, error: participantsError } = await supabase
    .from('game_participants')
    .select('user_id, joined_at')
    .eq('game_id', gameId)
    .order('joined_at', { ascending: true });

  if (participantsError) throw participantsError;
  if (!participants?.length) return [];

  const userIds = [...new Set(participants.map((participant) => participant.user_id))];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, name, username, avatar_url')
    .in('user_id', userIds);

  if (profilesError) throw profilesError;

  const profilesByUserId = new Map(
    (profiles ?? []).map((profile) => [profile.user_id, profile])
  );

  return participants.map((participant) => ({
    ...participant,
    profile: profilesByUserId.get(participant.user_id) ?? null,
  }));
}