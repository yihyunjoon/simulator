import { For, onMount, onCleanup, createSignal } from "solid-js";
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
  // Draggable position state
  const [position, setPosition] = createSignal({ x: 16, y: 16 }); // top-4 left-4 = 16px
  const [isDragging, setIsDragging] = createSignal(false);
  let dragStart = { x: 0, y: 0 };
  let posStart = { x: 0, y: 0 };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart = { x: clientX, y: clientY };
    posStart = position();
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging()) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 176, posStart.x + dx)), // 176 = w-44 = 11rem
      y: Math.max(0, Math.min(window.innerHeight - 200, posStart.y + dy)),
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Touch event handlers
  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Mouse event handlers (for desktop support)
  const onMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

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
    // Global mouse/touch move and up events for drag
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
  });

  return (
    <nav
      class="fixed z-50 w-44"
      style={{
        left: `${position().x}px`,
        top: `${position().y}px`,
      }}
      role="region"
      aria-label="Time controls"
    >
      <div class="bg-linear-to-b from-stone-800/95 to-stone-900/95 border-2 border-amber-700/50 backdrop-blur-sm shadow-xl">
        {/* Header - Drag Handle */}
        <div
          class="bg-linear-to-r from-amber-900/80 to-amber-800/80 px-3 py-1.5 border-b border-amber-700/50 cursor-grab active:cursor-grabbing select-none touch-none"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <div class="flex items-center justify-between">
            <span class="text-amber-100 font-serif text-xs tracking-widest uppercase">
              Tempus
            </span>
            <span class="text-amber-500/60 text-xs" aria-hidden="true">⠿</span>
          </div>
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
