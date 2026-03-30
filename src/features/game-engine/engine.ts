import { BoardWinner, NestedGameState, PlayerSymbol } from '../../types/game';

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
] as const;

export function createInitialGameState(startingPlayer: PlayerSymbol = 'X'): NestedGameState {
  return {
    boards: Array.from({ length: 9 }, () => Array<PlayerSymbol | null>(9).fill(null)),
    boardWinners: Array<BoardWinner>(9).fill(null),
    currentPlayer: startingPlayer,
    activeBoardIndex: null,
    winner: null,
    status: 'in_progress',
    moveCount: 0,
    lastMove: null,
  };
}

export function isBoardPlayable(state: NestedGameState, boardIndex: number) {
  return (
    state.boardWinners[boardIndex] === null &&
    state.boards[boardIndex].some((cell) => cell === null)
  );
}

export function getPlayableBoards(state: NestedGameState) {
  if (state.status === 'finished') {
    return [];
  }

  if (state.activeBoardIndex !== null && isBoardPlayable(state, state.activeBoardIndex)) {
    return [state.activeBoardIndex];
  }

  return state.boardWinners
    .map((winner, boardIndex) => (winner === null ? boardIndex : null))
    .filter((boardIndex): boardIndex is number => boardIndex !== null);
}

export function canPlayMove(state: NestedGameState, boardIndex: number, cellIndex: number) {
  if (state.status === 'finished') {
    return false;
  }

  return getPlayableBoards(state).includes(boardIndex) && state.boards[boardIndex][cellIndex] === null;
}

function evaluateBoard(cells: Array<PlayerSymbol | null>): BoardWinner {
  for (const [a, b, c] of winningLines) {
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return cells[a];
    }
  }

  if (cells.every(Boolean)) {
    return 'draw';
  }

  return null;
}

function evaluateLargeBoard(boardWinners: BoardWinner[]): BoardWinner {
  for (const [a, b, c] of winningLines) {
    const winner = boardWinners[a];

    if (winner && winner !== 'draw' && winner === boardWinners[b] && winner === boardWinners[c]) {
      return winner;
    }
  }

  if (boardWinners.every((winner) => winner !== null)) {
    return 'draw';
  }

  return null;
}

export function applyMove(state: NestedGameState, boardIndex: number, cellIndex: number) {
  if (!canPlayMove(state, boardIndex, cellIndex)) {
    throw new Error('Invalid move');
  }

  const boards = state.boards.map((board, currentBoardIndex) =>
    currentBoardIndex === boardIndex
      ? board.map((cell, currentCellIndex) =>
          currentCellIndex === cellIndex ? state.currentPlayer : cell,
        )
      : [...board],
  );

  const boardWinners = [...state.boardWinners];
  boardWinners[boardIndex] = evaluateBoard(boards[boardIndex]);

  const playableState = {
    ...state,
    boards,
    boardWinners,
  };
  const winner = evaluateLargeBoard(boardWinners);
  const hasPlayableBoards = getPlayableBoards(playableState).length > 0;

  const nextState: NestedGameState = {
    boards,
    boardWinners,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    activeBoardIndex: isBoardPlayable(playableState, cellIndex) ? cellIndex : null,
    winner,
    status: winner !== null || !hasPlayableBoards ? 'finished' : 'in_progress',
    moveCount: state.moveCount + 1,
    lastMove: {
      boardIndex,
      cellIndex,
      player: state.currentPlayer,
    },
  };

  if (nextState.status === 'finished' && nextState.winner === null) {
    nextState.winner = 'draw';
  }

  return nextState;
}
