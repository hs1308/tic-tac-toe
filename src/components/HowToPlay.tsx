import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type CellVal = 'X' | 'O' | null;

// ─── Mini cell ────────────────────────────────────────────────────────────────

function MiniCell({
  value,
  highlighted,
  cellSize,
}: {
  value: CellVal;
  highlighted?: boolean;
  cellSize: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    anim.current?.stop();
    if (highlighted) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.14, duration: 420, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.94, duration: 420, useNativeDriver: true }),
        ]),
      );
      anim.current.start();
    } else {
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }).start();
    }
    return () => anim.current?.stop();
  }, [highlighted]);

  return (
    <Animated.View
      style={[
        {
          width: cellSize,
          height: cellSize,
          borderRadius: 5,
          backgroundColor: highlighted ? colors.primaryStrong : colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: highlighted ? 1.5 : 0,
          borderColor: colors.primary,
        },
        { transform: [{ scale }] },
      ]}
    >
      {value ? (
        <Text
          style={{
            fontSize: cellSize * 0.46,
            fontWeight: '900',
            color: value === 'X' ? colors.playerX : colors.playerO,
          }}
        >
          {value}
        </Text>
      ) : null}
    </Animated.View>
  );
}

// ─── Mini board ───────────────────────────────────────────────────────────────

function MiniBoard({
  cells,
  highlightedCells,
  cellSize = 40,
  gap = 3,
}: {
  cells: CellVal[];
  highlightedCells?: number[];
  cellSize?: number;
  gap?: number;
}) {
  const boardSize = cellSize * 3 + gap * 2;
  return (
    <View
      style={{
        width: boardSize,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
        padding: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      {cells.map((cell, i) => (
        <MiniCell
          key={i}
          value={cell}
          highlighted={highlightedCells?.includes(i)}
          cellSize={cellSize}
        />
      ))}
    </View>
  );
}

// ─── Big grid (9 board slots) ─────────────────────────────────────────────────

function BigGrid({
  claimedBy,
  pulsingBoard,
  winLine,
  slotSize = 40,
}: {
  claimedBy: (CellVal)[];
  pulsingBoard?: number | null;
  winLine?: number[];
  slotSize?: number;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: slotSize * 3 + 4 * 2,
        gap: 4,
      }}
    >
      {Array(9)
        .fill(null)
        .map((_, i) => {
          const owner = claimedBy[i];
          const isPulsing = pulsingBoard === i;
          const isWin = winLine?.includes(i);
          return (
            <BigSlot
              key={i}
              owner={owner}
              pulsing={isPulsing}
              win={isWin}
              slotSize={slotSize}
            />
          );
        })}
    </View>
  );
}

function BigSlot({
  owner,
  pulsing,
  win,
  slotSize,
}: {
  owner: CellVal;
  pulsing?: boolean;
  win?: boolean;
  slotSize: number;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    anim.current?.stop();
    if (pulsing) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.96, duration: 500, useNativeDriver: true }),
        ]),
      );
      anim.current.start();
    } else if (win) {
      anim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 350, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]),
      );
      anim.current.start();
    } else {
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    }
    return () => anim.current?.stop();
  }, [pulsing, win]);

  const bgColor = win
    ? `${colors.playerX}44`
    : pulsing
      ? `${colors.primary}33`
      : owner
        ? colors.surfaceAlt
        : colors.surfaceAlt;

  const borderColor = win
    ? colors.playerX
    : pulsing
      ? colors.primary
      : colors.border;

  return (
    <Animated.View
      style={{
        width: slotSize,
        height: slotSize,
        borderRadius: 7,
        backgroundColor: bgColor,
        borderWidth: win || pulsing ? 1.5 : 1,
        borderColor,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale }],
      }}
    >
      {owner ? (
        <Text
          style={{
            fontSize: slotSize * 0.48,
            fontWeight: '900',
            color: owner === 'X' ? colors.playerX : colors.playerO,
          }}
        >
          {owner}
        </Text>
      ) : null}
    </Animated.View>
  );
}

// ─── Slide label + title ──────────────────────────────────────────────────────

function SlideTitle({ children }: { children: string }) {
  return <Text style={slideS.title}>{children}</Text>;
}

function SlideLabel({ children }: { children: string }) {
  return <Text style={slideS.label}>{children}</Text>;
}

const slideS = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    minHeight: 38,
  },
});

// ─── Card 1: Win a small board ────────────────────────────────────────────────

const C1_FRAMES: { cells: CellVal[]; highlighted?: number[]; label: string }[] = [
  { cells: Array(9).fill(null) as CellVal[], label: 'Take turns placing X and O…' },
  {
    cells: ['X', null, null, null, null, null, null, null, null],
    label: 'X plays top-left',
  },
  {
    cells: ['X', null, null, null, 'O', null, null, null, null],
    label: 'O plays center',
  },
  {
    cells: ['X', 'X', null, null, 'O', null, null, null, null],
    label: 'X plays top-middle',
  },
  {
    cells: ['X', 'X', null, null, 'O', null, null, null, 'O'],
    label: 'O plays bottom-right',
  },
  {
    cells: ['X', 'X', 'X', null, 'O', null, null, null, 'O'],
    highlighted: [0, 1, 2],
    label: 'Three in a row — X claims this board! ✓',
  },
];

const C1_DELAYS = [1200, 900, 900, 900, 900, 1800];

function Card1() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setTimeout(
      () => setFrame((f) => (f + 1) % C1_FRAMES.length),
      C1_DELAYS[frame] ?? 1000,
    );
    return () => clearTimeout(id);
  }, [frame]);

  const { cells, highlighted, label } = C1_FRAMES[frame];

  return (
    <View style={cardS.slide}>
      <SlideTitle>Win a small board</SlideTitle>
      <MiniBoard cells={cells} highlightedCells={highlighted} cellSize={42} gap={3} />
      <SlideLabel>{label}</SlideLabel>
    </View>
  );
}

// ─── Card 2: Your cell = opponent's board ─────────────────────────────────────

// X plays in cell index 5 (middle-right) → opponent must play in board 5
const DEMO_CELL = 5;

function Card2() {
  // steps: 0 = cell pulsing (no move yet), 1 = X placed + arrow, 2 = board pulses, 3 = pause+reset
  const [step, setStep] = useState(0);
  const arrowOpacity = useRef(new Animated.Value(0)).current;
  const DELAYS = [1300, 700, 1600, 800];

  useEffect(() => {
    const id = setTimeout(
      () => setStep((s) => (s + 1) % 4),
      DELAYS[step] ?? 1000,
    );
    return () => clearTimeout(id);
  }, [step]);

  useEffect(() => {
    Animated.timing(arrowOpacity, {
      toValue: step >= 1 ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [step]);

  const cells: CellVal[] = Array(9).fill(null) as CellVal[];
  if (step >= 1) cells[DEMO_CELL] = 'X';

  const bigGridOwners: CellVal[] = Array(9).fill(null) as CellVal[];

  return (
    <View style={cardS.slide}>
      <SlideTitle>Cell played = next board</SlideTitle>
      <View style={card2S.row}>
        {/* Left: the small board being played on */}
        <View style={card2S.panel}>
          <Text style={card2S.panelLabel}>Current board</Text>
          <MiniBoard
            cells={cells}
            highlightedCells={step === 0 ? [DEMO_CELL] : undefined}
            cellSize={30}
            gap={3}
          />
          <Text style={card2S.cellNote}>
            {step === 0 ? `▶ cell ${DEMO_CELL + 1}` : `✓ cell ${DEMO_CELL + 1}`}
          </Text>
        </View>

        {/* Arrow */}
        <Animated.Text style={[card2S.arrow, { opacity: arrowOpacity }]}>→</Animated.Text>

        {/* Right: the big 3×3 grid */}
        <View style={card2S.panel}>
          <Text style={card2S.panelLabel}>Next board</Text>
          <BigGrid
            claimedBy={bigGridOwners}
            pulsingBoard={step >= 2 ? DEMO_CELL : null}
            slotSize={30}
          />
          <Text style={card2S.cellNote}>
            {step >= 2 ? `▶ board ${DEMO_CELL + 1}` : `board ${DEMO_CELL + 1}`}
          </Text>
        </View>
      </View>
      <SlideLabel>
        {step <= 1
          ? `X plays in cell ${DEMO_CELL + 1}…`
          : `O must now play in board ${DEMO_CELL + 1}`}
      </SlideLabel>
    </View>
  );
}

const card2S = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  panel: {
    alignItems: 'center',
    gap: 5,
  },
  panelLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  cellNote: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  arrow: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: '900',
    marginTop: 12,
  },
});

// ─── Card 3: Win 3 boards in a row ────────────────────────────────────────────

const WIN_LINE = [0, 4, 8]; // diagonal

function Card3() {
  const [claimedCount, setClaimedCount] = useState(0);
  const [won, setWon] = useState(false);
  const winOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (won) {
      Animated.timing(winOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      const id = setTimeout(() => {
        Animated.timing(winOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(
          () => {
            setClaimedCount(0);
            setWon(false);
          },
        );
      }, 1800);
      return () => clearTimeout(id);
    }

    if (claimedCount === WIN_LINE.length) {
      const id = setTimeout(() => setWon(true), 500);
      return () => clearTimeout(id);
    }

    const id = setTimeout(
      () => setClaimedCount((c) => c + 1),
      claimedCount === 0 ? 900 : 750,
    );
    return () => clearTimeout(id);
  }, [claimedCount, won]);

  const claimedBy: CellVal[] = Array(9).fill(null) as CellVal[];
  for (let i = 0; i < claimedCount; i++) {
    claimedBy[WIN_LINE[i]] = 'X';
  }

  return (
    <View style={cardS.slide}>
      <SlideTitle>Win 3 boards in a row</SlideTitle>
      <View style={{ alignItems: 'center', gap: 10 }}>
        <BigGrid
          claimedBy={claimedBy}
          winLine={won ? WIN_LINE : undefined}
          slotSize={52}
        />
        <Animated.Text style={[card3S.winText, { opacity: winOpacity }]}>
          X Wins! 🎉
        </Animated.Text>
      </View>
      <SlideLabel>
        {won
          ? 'Three boards in a row on the big grid!'
          : 'Claim mini boards to control the big board…'}
      </SlideLabel>
    </View>
  );
}

const card3S = StyleSheet.create({
  winText: {
    color: colors.playerXSoft,
    fontSize: 22,
    fontWeight: '900',
  },
});

// ─── Shared card styles ───────────────────────────────────────────────────────

const cardS = StyleSheet.create({
  slide: {
    alignItems: 'center',
    gap: 14,
    minHeight: 250,
    justifyContent: 'center',
  },
});

// ─── Dot indicator ────────────────────────────────────────────────────────────

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={dotsS.row}>
      {Array(count)
        .fill(null)
        .map((_, i) => (
          <View key={i} style={[dotsS.dot, i === active && dotsS.dotActive]} />
        ))}
    </View>
  );
}

const dotsS = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
});

// ─── Main export ──────────────────────────────────────────────────────────────

const SLIDES = [Card1, Card2, Card3];

export function HowToPlay() {
  const [active, setActive] = useState(0);
  const Slide = SLIDES[active];

  return (
    <View style={outerS.wrapper}>
      <Slide />
      <View style={outerS.navRow}>
        <Pressable
          onPress={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
          style={[outerS.navBtn, active === 0 && outerS.navBtnDisabled]}
        >
          <Text style={outerS.navBtnText}>‹</Text>
        </Pressable>
        <Dots count={SLIDES.length} active={active} />
        <Pressable
          onPress={() => setActive((a) => Math.min(SLIDES.length - 1, a + 1))}
          disabled={active === SLIDES.length - 1}
          style={[outerS.navBtn, active === SLIDES.length - 1 && outerS.navBtnDisabled]}
        >
          <Text style={outerS.navBtnText}>›</Text>
        </Pressable>
      </View>
    </View>
  );
}

const outerS = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: { opacity: 0.3 },
  navBtnText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
});
