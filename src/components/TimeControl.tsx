import { For, onMount, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import { SPEED_OPTIONS } from "../constants";

interface TimeControlProps {
  isRunning: Accessor<boolean>;
  speed: Accessor<number>;
  togglePlayPause: () => void;
  changeSpeed: (speed: number) => void;
  reset: () => void;
}

export default function TimeControl(props: TimeControlProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in an input field
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const speedEntry = SPEED_OPTIONS.find((s) => s.key === e.key);
    if (speedEntry) {
      props.changeSpeed(speedEntry.value);
    } else if (e.key === " ") {
      e.preventDefault();
      props.togglePlayPause();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <nav
      class="fixed top-4 left-4 z-50 w-44"
      role="region"
      aria-label="Time controls"
    >
      <div class="bg-linear-to-b from-stone-800/95 to-stone-900/95 border-2 border-amber-700/50 backdrop-blur-sm shadow-xl">
        {/* Header */}
        <div class="bg-linear-to-r from-amber-900/80 to-amber-800/80 px-3 py-1.5 border-b border-amber-700/50">
          <span class="text-amber-100 font-serif text-xs tracking-widest uppercase">
            Tempus
          </span>
        </div>

        <div class="p-3 space-y-2">
          {/* Play/Pause Button */}
          <button
            onClick={props.togglePlayPause}
            aria-label={props.isRunning() ? "Pause simulation (Space)" : "Start simulation (Space)"}
            aria-pressed={props.isRunning()}
            class={`w-full px-4 py-2 font-serif text-sm tracking-wide border transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-amber-400 ${
              props.isRunning()
                ? "bg-linear-to-b from-red-800 to-red-950 border-red-600 text-red-100 hover:from-red-700 hover:to-red-900"
                : "bg-linear-to-b from-emerald-800 to-emerald-950 border-emerald-600 text-emerald-100 hover:from-emerald-700 hover:to-emerald-900"
            }`}
          >
            {props.isRunning() ? "⏸ Halt" : "▶ Proceed"}
            <span class="text-xs opacity-60 ml-1">[Space]</span>
          </button>

          {/* Speed Controls */}
          <div class="space-y-1" role="group" aria-label="Simulation speed">
            <div class="text-stone-400 text-xs font-serif px-1" id="speed-label">Tempo</div>
            <div class="grid grid-cols-4 gap-1" role="radiogroup" aria-labelledby="speed-label">
              <For each={SPEED_OPTIONS}>
                {(s) => (
                  <button
                    onClick={() => props.changeSpeed(s.value)}
                    role="radio"
                    aria-checked={props.speed() === s.value}
                    aria-label={`Speed ${s.value}x (key ${s.key})`}
                    class={`py-1.5 font-serif text-xs border transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                      props.speed() === s.value
                        ? "bg-amber-700 border-amber-500 text-amber-100"
                        : "bg-stone-800 border-stone-600 text-stone-400 hover:bg-stone-700 hover:text-stone-200"
                    }`}
                  >
                    <div>{s.value}×</div>
                    <div class="text-[10px] opacity-50">[{s.key}]</div>
                  </button>
                )}
              </For>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={props.reset}
            aria-label="Restart simulation"
            class="w-full px-4 py-2 bg-linear-to-b from-stone-700 to-stone-800 border border-stone-600 text-stone-300 font-serif text-sm tracking-wide hover:from-stone-600 hover:to-stone-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            ↺ Restart
          </button>
        </div>
      </div>
    </nav>
  );
}
