export type PlayerSymbol = 'X' | 'O';
export type BoardWinner = PlayerSymbol | 'draw' | null;

export type Move = {
  boardIndex: number;
  cellIndex: number;
  player: PlayerSymbol;
};

export type NestedGameState = {
  boards: Array<Array<PlayerSymbol | null>>;
  boardWinners: BoardWinner[];
  currentPlayer: PlayerSymbol;
  activeBoardIndex: number | null;
  winner: BoardWinner;
  status: 'in_progress' | 'finished';
  moveCount: number;
  lastMove: Move | null;
};

export type OnlineGameStatus = 'waiting' | 'active' | 'finished' | 'closed';
export type RematchStatus = 'pending' | 'accepted' | 'declined' | null;

export type OnlineGame = {
  id: string;
  code: string;
  createdByProfileId: string;
  currentTurnPlayer: PlayerSymbol;
  activeBoardIndex: number | null;
  state: NestedGameState;
  winner: BoardWinner;
  status: OnlineGameStatus;
  rematchStatus: RematchStatus;
  rematchRequestedByProfileId: string | null;
  undoChancesX: number;
  undoChancesO: number;
  lastUndoBy: PlayerSymbol | null;
  lastUndoAt: string | null;
};

export type OnlineGamePlayer = {
  id: string;
  gameId: string;
  profileId: string;
  nickname: string;
  mascot: string;
  seat: PlayerSymbol;
};

export type OnlineSession = {
  game: OnlineGame;
  players: OnlineGamePlayer[];
};
