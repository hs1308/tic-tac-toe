import { NestedGameState } from './game';

export type RootStackParamList = {
  Welcome: undefined;
  Onboarding: undefined;
  Home: undefined;
  Profile: undefined;
  LocalSetup: undefined;
  LocalGame: {
    playerXName: string;
    playerOName: string;
  };
  LocalResult: {
    playerXName: string;
    playerOName: string;
    state: NestedGameState;
  };
  OnlineLobby: undefined;
  JoinOnlineGame: undefined;
  OnlineWaiting: {
    gameId: string;
  };
  OnlineGame: {
    gameId: string;
  };
  OnlineResult: {
    gameId: string;
  };
};
