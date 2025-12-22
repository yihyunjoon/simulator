import { createStore, reconcile } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import type { GameState, Human, Gender, HistoryPoint } from "./types";

const STORAGE_KEY = "chronicles-save";

const maleNames = [
  "Adam", "Noah", "Liam", "Oliver", "James", "William", "Benjamin", "Lucas", "Henry", "Alexander",
  "Ethan", "Michael", "Daniel", "Matthew", "David", "Joseph", "Samuel", "John", "Robert", "Thomas",
  "Charles", "George", "Edward", "Frank", "Arthur", "Harold", "Albert", "Ernest", "Alfred", "Herbert",
  "Marcus", "Julius", "Augustus", "Nero", "Titus", "Cassius", "Felix", "Maximus", "Lucius", "Gaius",
  "Erik", "Bjorn", "Ragnar", "Leif", "Olaf", "Sven", "Thor", "Odin", "Freyr", "Baldr",
];

const femaleNames = [
  "Eve", "Emma", "Olivia", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper",
  "Emily", "Elizabeth", "Victoria", "Grace", "Lily", "Hannah", "Sarah", "Rachel", "Rebecca", "Ruth",
  "Mary", "Margaret", "Catherine", "Eleanor", "Alice", "Clara", "Rose", "Helen", "Dorothy", "Florence",
  "Julia", "Livia", "Octavia", "Claudia", "Aurelia", "Cornelia", "Flavia", "Lucia", "Sabina", "Valeria",
  "Freya", "Ingrid", "Astrid", "Sigrid", "Helga", "Gudrun", "Thyra", "Ragnhild", "Solveig", "Eira",
];

const DEATH_AGE_MEAN = 60;
const DEATH_AGE_STD = 10;

function getRandomName(gender: Gender, usedNames: Set<string>): string {
  const names = gender === "male" ? maleNames : femaleNames;
  const availableNames = names.filter(n => !usedNames.has(n));
  if (availableNames.length > 0) {
    const name = availableNames[Math.floor(Math.random() * availableNames.length)];
    usedNames.add(name);
    return name;
  }
  const baseName = names[Math.floor(Math.random() * names.length)];
  let suffix = 2;
  while (usedNames.has(`${baseName} ${suffix}`)) suffix++;
  const newName = `${baseName} ${suffix}`;
  usedNames.add(newName);
  return newName;
}

function deathProbability(age: number): number {
  if (age < 40) return 0.001;
  const z = (age - DEATH_AGE_MEAN) / DEATH_AGE_STD;
  const prob = Math.exp(-0.5 * z * z) / (DEATH_AGE_STD * Math.sqrt(2 * Math.PI));
  return Math.min(0.95, prob * 15 + (age > 80 ? 0.5 : 0));
}

function createInitialHumans(): Human[] {
  const humans: Human[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 100; i++) {
    const femaleId = i * 2 + 1;
    const maleId = i * 2 + 2;

    humans.push({
      id: femaleId,
      name: getRandomName("female", usedNames),
      gender: "female",
      age: 15,
      birthYear: -8014,
      isAlive: true,
      spouseId: maleId,
    });

    humans.push({
      id: maleId,
      name: getRandomName("male", usedNames),
      gender: "male",
      age: 15,
      birthYear: -8014,
      isAlive: true,
      spouseId: femaleId,
    });
  }

  return humans;
}

function createDefaultState(): GameState {
  return {
    humans: createInitialHumans(),
    food: 2000,
    year: -8000,
    nextId: 201,
    logs: ["8000 BC: Simulation started with 100 couples"],
    history: [{ year: -8000, population: 200, births: 0, food: 2000 }],
  };
}

function loadFromStorage(): GameState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GameState;
      // Validate basic structure
      if (parsed.humans && parsed.year && parsed.food !== undefined) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load save:", e);
  }
  return null;
}

function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function createGameStore() {
  const savedState = loadFromStorage();
  const initialState = savedState || createDefaultState();

  const [state, setState] = createStore<GameState>(initialState);
  const [isRunning, setIsRunning] = createSignal(false);
  const [speed, setSpeed] = createSignal(1);

  let intervalId: number | undefined;
  const usedNames = new Set<string>(state.humans.map(h => h.name));

  function formatYear(year: number): string {
    if (year <= 0) return `${Math.abs(year)} BC`;
    return `${year} AD`;
  }

  function addLog(message: string) {
    setState("logs", (logs) =>
      [`${formatYear(state.year)}: ${message}`, ...logs].slice(0, 50)
    );
  }

  function areSiblings(a: Human, b: Human): boolean {
    if (!a.motherId && !a.fatherId) return false;
    if (!b.motherId && !b.fatherId) return false;
    const sameMother = a.motherId !== undefined && a.motherId === b.motherId;
    const sameFather = a.fatherId !== undefined && a.fatherId === b.fatherId;
    return sameMother || sameFather;
  }

  function areDirectlyRelated(a: Human, b: Human): boolean {
    if (b.motherId === a.id || b.fatherId === a.id) return true;
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

    const newlyMarried: { bride: Human; groom: Human }[] = [];

    for (const woman of unmarriedWomen) {
      const eligibleMen = unmarriedMen.filter(
        (m) =>
          !newlyMarried.some((nm) => nm.groom.id === m.id) &&
          !areSiblings(woman, m) &&
          !areDirectlyRelated(woman, m)
      );

      if (eligibleMen.length > 0 && Math.random() < 0.5) {
        const groom = eligibleMen[Math.floor(Math.random() * eligibleMen.length)];
        newlyMarried.push({ bride: woman, groom });
      }
    }

    for (const { bride, groom } of newlyMarried) {
      setState("humans", (h) => h.id === bride.id, "spouseId", groom.id);
      setState("humans", (h) => h.id === groom.id, "spouseId", bride.id);
    }

    if (newlyMarried.length > 0) {
      addLog(`Married: ${newlyMarried.length} couples`);
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

      if (Math.random() < 0.3) {
        const gender: Gender = Math.random() > 0.5 ? "male" : "female";
        const newHuman: Human = {
          id: state.nextId + newHumans.length,
          name: getRandomName(gender, usedNames),
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
      setState("nextId", (id) => id + newHumans.length);
      addLog(`Born: ${newHumans.length} children`);
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

    // 6. Death by age (normal distribution around 60)
    const deceased: Human[] = [];
    for (const human of state.humans) {
      const prob = deathProbability(human.age);
      if (Math.random() < prob) {
        deceased.push(human);
      }
    }

    if (deceased.length > 0) {
      const deceasedIds = new Set(deceased.map(h => h.id));
      addLog(`Died: ${deceased.length} people`);
      setState("humans", (humans) => humans.filter((h) => !deceasedIds.has(h.id)));
    }

    // 7. Starvation
    if (state.food < 0) {
      const starved = Math.min(
        state.humans.length,
        Math.ceil(Math.abs(state.food) / 5)
      );
      if (starved > 0) {
        addLog(`Starved: ${starved} people`);
        setState("humans", (humans) => humans.slice(starved));
        setState("food", 0);
      }
    }

    // 8. Record history every year
    const historyPoint: HistoryPoint = {
      year: state.year,
      population: state.humans.length,
      births: newHumans.length,
      food: state.food,
    };
    setState("history", (h) => [...h, historyPoint].slice(-1000));

    // 9. Advance year
    setState("year", (y) => y + 1);

    // 10. Save to localStorage every year
    saveToStorage(state);

    // Check for extinction
    if (state.humans.length === 0) {
      addLog("Civilization has collapsed!");
      saveToStorage(state);
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
    // Save when paused
    saveToStorage(state);
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
    clearStorage();
    usedNames.clear();
    const newState = createDefaultState();
    newState.humans.forEach(h => usedNames.add(h.name));
    setState(reconcile(newState));
  }

  onCleanup(() => {
    if (intervalId) clearInterval(intervalId);
    saveToStorage(state);
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
