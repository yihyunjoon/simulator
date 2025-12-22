import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import type { GameState, Human, Gender } from "./types";

const maleNames = [
  "Adam",
  "Noah",
  "Liam",
  "Oliver",
  "James",
  "William",
  "Benjamin",
  "Lucas",
  "Henry",
  "Alexander",
];
const femaleNames = [
  "Eve",
  "Emma",
  "Olivia",
  "Ava",
  "Sophia",
  "Isabella",
  "Mia",
  "Charlotte",
  "Amelia",
  "Harper",
];

function getRandomName(gender: Gender): string {
  const names = gender === "male" ? maleNames : femaleNames;
  return names[Math.floor(Math.random() * names.length)];
}

const createInitialHumans = (): Human[] => [
  { id: 1, name: "Eve", gender: "female", age: 15, birthYear: -8014, isAlive: true, spouseId: 2 },
  { id: 2, name: "Adam", gender: "male", age: 15, birthYear: -8014, isAlive: true, spouseId: 1 },
  { id: 3, name: "Pandora", gender: "female", age: 15, birthYear: -8014, isAlive: true, spouseId: 4 },
  { id: 4, name: "Epimetheus", gender: "male", age: 15, birthYear: -8014, isAlive: true, spouseId: 3 },
];

const initialState: GameState = {
  humans: createInitialHumans(),
  allHumans: createInitialHumans(),
  food: 100,
  year: -8000,
  nextId: 5,
  logs: ["8000 BC: Simulation started with two couples"],
};

export function createGameStore() {
  const [state, setState] = createStore<GameState>(
    structuredClone(initialState)
  );
  const [isRunning, setIsRunning] = createSignal(false);
  const [speed, setSpeed] = createSignal(1);

  let intervalId: number | undefined;

  function formatYear(year: number): string {
    if (year <= 0) return `${Math.abs(year)} BC`;
    return `${year} AD`;
  }

  function addLog(message: string) {
    setState("logs", (logs) =>
      [`${formatYear(state.year)}: ${message}`, ...logs].slice(0, 50)
    );
  }

  function markDeceased(humanIds: number[], deathYear: number) {
    setState("allHumans", (h) => humanIds.includes(h.id), "isAlive", false);
    setState("allHumans", (h) => humanIds.includes(h.id), "deathYear", deathYear);
  }

  // Check if two people share a parent (siblings/half-siblings)
  function areSiblings(a: Human, b: Human): boolean {
    if (!a.motherId && !a.fatherId) return false;
    if (!b.motherId && !b.fatherId) return false;
    const sameMother = a.motherId !== undefined && a.motherId === b.motherId;
    const sameFather = a.fatherId !== undefined && a.fatherId === b.fatherId;
    return sameMother || sameFather;
  }

  // Check if one is parent/grandparent of the other
  function areDirectlyRelated(a: Human, b: Human): boolean {
    // a is parent of b
    if (b.motherId === a.id || b.fatherId === a.id) return true;
    // b is parent of a
    if (a.motherId === b.id || a.fatherId === b.id) return true;
    return false;
  }

  function tick() {
    if (state.humans.length === 0) {
      pause();
      return;
    }

    // 1. Food production (workers: age 15-49)
    const workers = state.humans.filter((h) => h.age >= 15 && h.age < 50);
    const produced = workers.length * 10;
    if (produced > 0) {
      setState("food", (f) => f + produced);
    }

    // 2. Marriage (unmarried adults find partners)
    const unmarriedWomen = state.humans.filter(
      (h) => h.gender === "female" && h.age >= 15 && !h.spouseId
    );
    const unmarriedMen = state.humans.filter(
      (h) => h.gender === "male" && h.age >= 15 && !h.spouseId
    );

    const newlyMarried: { odessa: Human; groom: Human }[] = [];

    for (const woman of unmarriedWomen) {
      // Find eligible men (not siblings, not directly related)
      const eligibleMen = unmarriedMen.filter(
        (m) =>
          !newlyMarried.some((nm) => nm.groom.id === m.id) &&
          !areSiblings(woman, m) &&
          !areDirectlyRelated(woman, m)
      );

      if (eligibleMen.length > 0 && Math.random() < 0.5) {
        const groom = eligibleMen[Math.floor(Math.random() * eligibleMen.length)];
        newlyMarried.push({ odessa: woman, groom });
      }
    }

    // Apply marriages
    for (const { odessa, groom } of newlyMarried) {
      setState("humans", (h) => h.id === odessa.id, "spouseId", groom.id);
      setState("humans", (h) => h.id === groom.id, "spouseId", odessa.id);
      setState("allHumans", (h) => h.id === odessa.id, "spouseId", groom.id);
      setState("allHumans", (h) => h.id === groom.id, "spouseId", odessa.id);
      addLog(`Married: ${groom.name} & ${odessa.name}`);
    }

    // 3. Reproduction (only married couples, traditional age 15-30)
    const marriedWomen = state.humans.filter(
      (h) =>
        h.gender === "female" &&
        h.age >= 15 &&
        h.age <= 30 &&
        h.spouseId !== undefined
    );

    const newHumans: Human[] = [];

    for (const woman of marriedWomen) {
      const husband = state.humans.find(
        (h) => h.id === woman.spouseId && h.isAlive
      );
      if (!husband) continue;

      // 30% chance of birth per married couple per year
      if (Math.random() < 0.3) {
        const gender: Gender = Math.random() > 0.5 ? "male" : "female";
        const newHuman: Human = {
          id: state.nextId + newHumans.length,
          name: getRandomName(gender),
          gender,
          age: 0,
          motherId: woman.id,
          fatherId: husband.id,
          birthYear: state.year,
          isAlive: true,
        };
        newHumans.push(newHuman);
      }
    }

    if (newHumans.length > 0) {
      setState("humans", (humans) => [...humans, ...newHumans]);
      setState("allHumans", (allHumans) => [...allHumans, ...newHumans]);
      setState("nextId", (id) => id + newHumans.length);
      addLog(`Born: ${newHumans.map((h) => h.name).join(", ")}`);
    }

    // 4. Food consumption (1 per person)
    const consumption = state.humans.length;
    setState("food", (f) => f - consumption);

    // 5. Age everyone
    setState(
      "humans",
      (human) => human.age >= 0,
      "age",
      (age) => age + 1
    );
    setState(
      "allHumans",
      (human) => human.isAlive,
      "age",
      (age) => age + 1
    );

    // 6. Death by old age (60+)
    const deceased = state.humans.filter((h) => h.age >= 60);
    if (deceased.length > 0) {
      addLog(`Died: ${deceased.map((h) => `${h.name}(${h.age})`).join(", ")}`);
      markDeceased(
        deceased.map((h) => h.id),
        state.year
      );
      setState("humans", (humans) => humans.filter((h) => h.age < 60));
    }

    // 7. Starvation
    if (state.food < 0) {
      const starved = Math.min(
        state.humans.length,
        Math.ceil(Math.abs(state.food) / 5)
      );
      if (starved > 0) {
        const victims = state.humans.slice(0, starved);
        addLog(`Starved: ${victims.map((h) => h.name).join(", ")}`);
        markDeceased(
          victims.map((h) => h.id),
          state.year
        );
        setState("humans", (humans) => humans.slice(starved));
        setState("food", 0);
      }
    }

    // 8. Advance year
    setState("year", (y) => y + 1);

    // Check for extinction
    if (state.humans.length === 0) {
      addLog("Civilization has collapsed!");
      pause();
    }
  }

  function play() {
    if (state.humans.length === 0) return;
    setIsRunning(true);
    intervalId = setInterval(tick, 1000 / speed()) as unknown as number;
  }

  function pause() {
    setIsRunning(false);
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  }

  function togglePlayPause() {
    if (isRunning()) {
      pause();
    } else {
      play();
    }
  }

  function changeSpeed(newSpeed: number) {
    setSpeed(newSpeed);
    if (isRunning()) {
      pause();
      play();
    }
  }

  function reset() {
    pause();
    const initialHumans = createInitialHumans();
    setState({
      humans: initialHumans,
      allHumans: structuredClone(initialHumans),
      food: 100,
      year: -8000,
      nextId: 5,
      logs: ["8000 BC: Simulation started with two couples"],
    });
  }

  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    state,
    isRunning,
    speed,
    togglePlayPause,
    changeSpeed,
    reset,
  };
}
