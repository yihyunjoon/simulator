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

// Gompertz mortality model parameters
// μ(age) = a * exp(b * (age - c))
// Tuned for ~60 year average lifespan in pre-modern conditions
const GOMPERTZ_A = 0.003;  // baseline mortality rate
const GOMPERTZ_B = 0.08;   // mortality acceleration
const GOMPERTZ_C = 15;     // age offset

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
  // Infant/child mortality (higher in pre-modern era)
  if (age < 5) return 0.05;   // 5% per year for infants
  if (age < 15) return 0.01;  // 1% per year for children

  // Gompertz model for adults: exponentially increasing mortality
  const prob = GOMPERTZ_A * Math.exp(GOMPERTZ_B * (age - GOMPERTZ_C));
  return Math.min(0.95, prob);
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
  let tickCount = 0;
  const SAVE_INTERVAL = 10; // Save every 10 ticks instead of every tick
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

    // Single-pass categorization for O(n) instead of O(n) × 8
    let workerCount = 0;
    const unmarriedWomen: Human[] = [];
    const unmarriedMen: Human[] = [];
    const fertileMarriedWomen: Human[] = [];
    const deceasedIds = new Set<number>();
    const humanById = new Map<number, Human>();

    for (const human of state.humans) {
      humanById.set(human.id, human);

      // Workers (15-49)
      if (human.age >= 15 && human.age < 50) {
        workerCount++;
      }

      // Unmarried adults for marriage
      if (human.age >= 15 && !human.spouseId) {
        if (human.gender === "female") {
          unmarriedWomen.push(human);
        } else {
          unmarriedMen.push(human);
        }
      }

      // Fertile married women (15-30)
      if (
        human.gender === "female" &&
        human.age >= 15 &&
        human.age <= 30 &&
        human.spouseId !== undefined
      ) {
        fertileMarriedWomen.push(human);
      }

      // Death check (do it in same pass)
      const prob = deathProbability(human.age);
      if (Math.random() < prob) {
        deceasedIds.add(human.id);
      }
    }

    // 1. Food production
    if (workerCount > 0) {
      setState("food", (f) => f + workerCount * 10);
    }

    // 2. Marriage (optimized with Set for O(1) lookup)
    const newlyMarried: { brideId: number; groomId: number }[] = [];
    const takenGroomIds = new Set<number>();

    // Shuffle unmarried men for randomness
    for (let i = unmarriedMen.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unmarriedMen[i], unmarriedMen[j]] = [unmarriedMen[j], unmarriedMen[i]];
    }

    for (const woman of unmarriedWomen) {
      if (Math.random() >= 0.5) continue;

      for (const man of unmarriedMen) {
        if (takenGroomIds.has(man.id)) continue;
        if (areSiblings(woman, man) || areDirectlyRelated(woman, man)) continue;

        newlyMarried.push({ brideId: woman.id, groomId: man.id });
        takenGroomIds.add(man.id);
        break;
      }
    }

    // 3. Reproduction (use humanById for O(1) spouse lookup)
    const newHumans: Human[] = [];

    for (const woman of fertileMarriedWomen) {
      const husband = humanById.get(woman.spouseId!);
      if (!husband || !husband.isAlive || deceasedIds.has(husband.id)) continue;

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

    // Create marriage lookup maps for O(1) access
    const marriageMap = new Map<number, number>();
    for (const { brideId, groomId } of newlyMarried) {
      marriageMap.set(brideId, groomId);
      marriageMap.set(groomId, brideId);
    }

    // Remove deceased names from usedNames
    for (const id of deceasedIds) {
      const human = humanById.get(id);
      if (human) usedNames.delete(human.name);
    }

    // 4. SINGLE batch update: marriages + deaths + aging + births
    setState("humans", (humans) => {
      const result: Human[] = [];
      for (const h of humans) {
        if (deceasedIds.has(h.id)) continue; // Remove deceased

        const newSpouse = marriageMap.get(h.id);
        if (newSpouse !== undefined) {
          result.push({ ...h, age: h.age + 1, spouseId: newSpouse });
        } else {
          result.push({ ...h, age: h.age + 1 });
        }
      }
      // Add newborns
      for (const newHuman of newHumans) {
        result.push(newHuman);
      }
      return result;
    });

    if (newlyMarried.length > 0) addLog(`Married: ${newlyMarried.length} couples`);
    if (newHumans.length > 0) {
      setState("nextId", (id) => id + newHumans.length);
      addLog(`Born: ${newHumans.length} children`);
    }
    if (deceasedIds.size > 0) addLog(`Died: ${deceasedIds.size} people`);

    // 5. Food consumption
    setState("food", (f) => f - state.humans.length);

    // 6. Starvation
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

    // 7. Record history (optimized: mutate in place instead of spread)
    const historyPoint: HistoryPoint = {
      year: state.year,
      population: state.humans.length,
      births: newHumans.length,
      food: state.food,
    };
    setState("history", (h) => {
      if (h.length >= 1000) {
        // Shift first element and push new one (no spread)
        const newHistory = h.slice(1);
        newHistory.push(historyPoint);
        return newHistory;
      }
      // Under limit: just push
      const newHistory = h.slice();
      newHistory.push(historyPoint);
      return newHistory;
    });

    // 8. Advance year
    setState("year", (y) => y + 1);

    // 9. Save to localStorage periodically (not every tick)
    tickCount++;
    if (tickCount >= SAVE_INTERVAL) {
      saveToStorage(state);
      tickCount = 0;
    }

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
