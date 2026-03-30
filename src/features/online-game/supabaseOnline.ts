import { RealtimeChannel } from '@supabase/supabase-js';

import { supabase } from '../../lib/supabase';
import { Profile } from '../../types/auth';
import {
  NestedGameState,
  OnlineGame,
  OnlineGamePlayer,
  OnlineSession,
  RematchStatus,
} from '../../types/game';
import { createInitialGameState } from '../game-engine/engine';

type GameRow = {
  id: string;
  code: string;
  created_by_profile_id: string;
  current_turn_player: 'X' | 'O';
  active_board_index: number | null;
  state: NestedGameState;
  winner: 'X' | 'O' | 'draw' | null;
  status: 'waiting' | 'active' | 'finished' | 'closed';
  rematch_status: RematchStatus;
  rematch_requested_by_profile_id: string | null;
};

type PlayerRow = {
  id: string;
  game_id: string;
  profile_id: string;
  nickname: string;
  mascot: string;
  seat: 'X' | 'O';
};

function mapGame(row: GameRow): OnlineGame {
  return {
    id: row.id,
    code: row.code,
    createdByProfileId: row.created_by_profile_id,
    currentTurnPlayer: row.current_turn_player,
    activeBoardIndex: row.active_board_index,
    state: row.state,
    winner: row.winner,
    status: row.status,
    rematchStatus: row.rematch_status,
    rematchRequestedByProfileId: row.rematch_requested_by_profile_id,
  };
}

function mapPlayer(row: PlayerRow): OnlineGamePlayer {
  return {
    id: row.id,
    gameId: row.game_id,
    profileId: row.profile_id,
    nickname: row.nickname,
    mascot: row.mascot,
    seat: row.seat,
  };
}

async function getOpenGameByCode(code: string) {
  const { data, error } = await supabase
    .from('tic_tac_toe_games')
    .select('id')
    .eq('code', code)
    .in('status', ['waiting', 'active', 'finished'])
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function generateUniqueCode() {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = `${Math.floor(10000 + Math.random() * 90000)}`;
    const existing = await getOpenGameByCode(code);

    if (!existing) {
      return code;
    }
  }

  throw new Error('Unable to create a unique 5-digit code right now.');
}

export async function ensureProfile(profile: Profile) {
  if (!profile.nickname || !profile.mascot) {
    return;
  }

  const { error } = await supabase.from('tic_tac_toe_profiles').upsert(
    {
      id: profile.id,
      nickname: profile.nickname,
      mascot: profile.mascot,
    },
    {
      onConflict: 'id',
    },
  );

  if (error) {
    throw error;
  }
}

export async function createOnlineGame(profile: Profile) {
  if (!profile.nickname || !profile.mascot) {
    throw new Error('Finish your profile before creating an online game.');
  }

  await ensureProfile(profile);

  const code = await generateUniqueCode();
  const initialState = createInitialGameState();

  const { data: gameData, error: gameError } = await supabase
    .from('tic_tac_toe_games')
    .insert({
      code,
      created_by_profile_id: profile.id,
      current_turn_player: initialState.currentPlayer,
      active_board_index: initialState.activeBoardIndex,
      state: initialState,
      winner: initialState.winner,
      status: 'waiting',
    })
    .select('*')
    .single();

  if (gameError) {
    throw gameError;
  }

  const { error: playerError } = await supabase.from('tic_tac_toe_game_players').insert({
    game_id: gameData.id,
    profile_id: profile.id,
    nickname: profile.nickname,
    mascot: profile.mascot,
    seat: 'X',
  });

  if (playerError) {
    throw playerError;
  }

  return gameData.id as string;
}

export async function joinOnlineGame(code: string, profile: Profile) {
  if (!profile.nickname || !profile.mascot) {
    throw new Error('Finish your profile before joining an online game.');
  }

  await ensureProfile(profile);

  const { data: gameData, error: gameError } = await supabase
    .from('tic_tac_toe_games')
    .select('*')
    .eq('code', code)
    .in('status', ['waiting', 'active', 'finished'])
    .single();

  if (gameError) {
    throw new Error('That game code was not found.');
  }

  const { data: playersData, error: playersError } = await supabase
    .from('tic_tac_toe_game_players')
    .select('*')
    .eq('game_id', gameData.id);

  if (playersError) {
    throw playersError;
  }

  const existingPlayer = playersData.find((player) => player.profile_id === profile.id);

  if (existingPlayer) {
    return gameData.id as string;
  }

  if (playersData.length >= 2 || gameData.status === 'closed') {
    throw new Error('This session is no longer available.');
  }

  const { error: insertError } = await supabase.from('tic_tac_toe_game_players').insert({
    game_id: gameData.id,
    profile_id: profile.id,
    nickname: profile.nickname,
    mascot: profile.mascot,
    seat: 'O',
  });

  if (insertError) {
    throw insertError;
  }

  const { error: updateError } = await supabase
    .from('tic_tac_toe_games')
    .update({
      status: 'active',
    })
    .eq('id', gameData.id);

  if (updateError) {
    throw updateError;
  }

  return gameData.id as string;
}

export async function fetchOnlineSession(gameId: string): Promise<OnlineSession> {
  const { data: gameData, error: gameError } = await supabase
    .from('tic_tac_toe_games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError) {
    throw gameError;
  }

  const { data: playersData, error: playersError } = await supabase
    .from('tic_tac_toe_game_players')
    .select('*')
    .eq('game_id', gameId)
    .order('seat');

  if (playersError) {
    throw playersError;
  }

  return {
    game: mapGame(gameData as GameRow),
    players: (playersData as PlayerRow[]).map(mapPlayer),
  };
}

export async function updateOnlineGameState(gameId: string, nextState: NestedGameState) {
  const { error } = await supabase
    .from('tic_tac_toe_games')
    .update({
      current_turn_player: nextState.currentPlayer,
      active_board_index: nextState.activeBoardIndex,
      state: nextState,
      winner: nextState.winner,
      status: nextState.status === 'finished' ? 'finished' : 'active',
      last_move_at: new Date().toISOString(),
      rematch_status: null,
      rematch_requested_by_profile_id: null,
    })
    .eq('id', gameId);

  if (error) {
    throw error;
  }
}

export async function requestRematch(gameId: string, requesterProfileId: string) {
  const { error } = await supabase
    .from('tic_tac_toe_games')
    .update({
      rematch_status: 'pending',
      rematch_requested_by_profile_id: requesterProfileId,
    })
    .eq('id', gameId)
    .eq('status', 'finished');

  if (error) {
    throw error;
  }
}

export async function respondToRematch(gameId: string, accept: boolean) {
  if (!accept) {
    const { error } = await supabase
      .from('tic_tac_toe_games')
      .update({
        rematch_status: 'declined',
        status: 'closed',
      })
      .eq('id', gameId);

    if (error) {
      throw error;
    }

    return;
  }

  const initialState = createInitialGameState();
  const { error } = await supabase
    .from('tic_tac_toe_games')
    .update({
      current_turn_player: initialState.currentPlayer,
      active_board_index: initialState.activeBoardIndex,
      state: initialState,
      winner: initialState.winner,
      status: 'active',
      rematch_status: null,
      rematch_requested_by_profile_id: null,
    })
    .eq('id', gameId);

  if (error) {
    throw error;
  }
}

export async function fetchPendingRematchForProfile(profileId: string) {
  const { data: playerRows, error: playersError } = await supabase
    .from('tic_tac_toe_game_players')
    .select('game_id')
    .eq('profile_id', profileId);

  if (playersError) {
    throw playersError;
  }

  const gameIds = playerRows.map((row) => row.game_id);

  if (gameIds.length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from('tic_tac_toe_games')
    .select('*')
    .in('id', gameIds)
    .eq('rematch_status', 'pending')
    .neq('rematch_requested_by_profile_id', profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapGame(data as GameRow) : null;
}

export function subscribeToSession(gameId: string, onChange: () => void) {
  const channel = supabase
    .channel(`tic-tac-toe-session-${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tic_tac_toe_games',
        filter: `id=eq.${gameId}`,
      },
      () => onChange(),
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tic_tac_toe_game_players',
        filter: `game_id=eq.${gameId}`,
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel as RealtimeChannel);
  };
}

export function subscribeToPendingRematches(onChange: () => void) {
  const channel = supabase
    .channel('tic-tac-toe-rematch-notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tic_tac_toe_games',
      },
      () => onChange(),
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel as RealtimeChannel);
  };
}
