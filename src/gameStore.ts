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

const initialState: GameState = {
  humans: [
    { id: 1, name: "Eve", gender: "female", age: 20 },
    { id: 2, name: "Adam", gender: "male", age: 20 },
  ],
  food: 100,
  year: 1,
  nextId: 3,
  logs: ["Year 1: Simulation started with Eve and Adam"],
};

export function createGameStore() {
  const [state, setState] = createStore<GameState>(
    structuredClone(initialState)
  );
  const [isRunning, setIsRunning] = createSignal(false);
  const [speed, setSpeed] = createSignal(1); // 1 = 1초에 1년, 2 = 0.5초에 1년, etc.

  let intervalId: number | undefined;

  function addLog(message: string) {
    setState("logs", (logs) =>
      [`Year ${state.year}: ${message}`, ...logs].slice(0, 50)
    );
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

    // 2. Reproduction (random chance per fertile couple)
    const fertileWomen = state.humans.filter(
      (h) => h.gender === "female" && h.age >= 18 && h.age <= 45
    );
    const fertileMen = state.humans.filter(
      (h) => h.gender === "male" && h.age >= 18 && h.age <= 55
    );

    const potentialBirths = Math.min(fertileWomen.length, fertileMen.length);
    const newHumans: Human[] = [];

    for (let i = 0; i < potentialBirths; i++) {
      // 30% chance of birth per couple per year
      if (Math.random() < 0.3) {
        const gender: Gender = Math.random() > 0.5 ? "male" : "female";
        const newHuman: Human = {
          id: state.nextId + newHumans.length,
          name: getRandomName(gender),
          gender,
          age: 0,
        };
        newHumans.push(newHuman);
      }
    }

    if (newHumans.length > 0) {
      setState("humans", (humans) => [...humans, ...newHumans]);
      setState("nextId", (id) => id + newHumans.length);
      addLog(`Born: ${newHumans.map((h) => h.name).join(", ")}`);
    }

    // 3. Food consumption (1 per person)
    const consumption = state.humans.length;
    setState("food", (f) => f - consumption);

    // 4. Age everyone
    setState(
      "humans",
      (human) => human.age >= 0,
      "age",
      (age) => age + 1
    );

    // 5. Death by old age (60+)
    const deceased = state.humans.filter((h) => h.age >= 60);
    if (deceased.length > 0) {
      addLog(`Died: ${deceased.map((h) => `${h.name}(${h.age})`).join(", ")}`);
      setState("humans", (humans) => humans.filter((h) => h.age < 60));
    }

    // 6. Starvation
    if (state.food < 0) {
      const starved = Math.min(
        state.humans.length,
        Math.ceil(Math.abs(state.food) / 5)
      );
      if (starved > 0) {
        const victims = state.humans.slice(0, starved);
        addLog(`Starved: ${victims.map((h) => h.name).join(", ")}`);
        setState("humans", (humans) => humans.slice(starved));
        setState("food", 0);
      }
    }

    // 7. Advance year
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
    setState({
      humans: [
        { id: 1, name: "Adam", gender: "male", age: 20 },
        { id: 2, name: "Eve", gender: "female", age: 20 },
      ],
      food: 100,
      year: 1,
      nextId: 3,
      logs: ["Year 1: Simulation started with Adam and Eve"],
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
