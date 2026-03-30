# Nested Tic Tac Toe

Nested Tic Tac Toe is a mobile game prototype built with Expo, React Native, and Supabase.

Current v1 scope:
- same-device multiplayer on one phone
- online multiplayer with room codes
- mock sign-in for development
- persisted nickname and mascot profile

## Stack

- Expo
- React Native
- TypeScript
- Supabase
- React Navigation

## Current Features

- Welcome screen with mock Google sign-in button
- First-time onboarding for nickname and mascot
- Home screen with:
  - Play with Friends in person
  - Play with friends online
  - profile editing
  - how-to-play instructions
- Same-device gameplay flow:
  - local player name entry
  - nested tic tac toe board
  - result screen with restart
- Online gameplay flow:
  - create game
  - join game with 5-digit code
  - waiting room
  - synced gameplay
  - rematch request flow

## Project Structure

```text
src/
  components/
  config/
  features/
    auth/
    game-engine/
    game-ui/
    online-game/
  lib/
  navigation/
  screens/
  theme/
  types/
supabase/
  sql/
```

## Run Locally

Install dependencies:

```powershell
npm.cmd install
```

Start Expo:

```powershell
npx expo start --clear --tunnel --port 8082
```

For web:

```powershell
npx expo start --web --port 8082
```

## Supabase Setup

Run the SQL in:

`supabase/sql/001_tic_tac_toe_init.sql`

This creates the game-specific tables:
- `tic_tac_toe_profiles`
- `tic_tac_toe_games`
- `tic_tac_toe_game_players`

## Environment Variables

Create a `.env` file with:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Notes

- Google auth is not wired yet. The app currently uses mock sign-in.
- The current Supabase policies are intentionally open for prototype development.
- RLS should be tightened once real auth is added.

## Next Steps

- add real Google authentication
- harden online move validation
- improve rematch UX
- polish visuals and animations
