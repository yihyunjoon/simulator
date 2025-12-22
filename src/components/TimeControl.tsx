import { For, onMount, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'

interface TimeControlProps {
  isRunning: Accessor<boolean>
  speed: Accessor<number>
  togglePlayPause: () => void
  changeSpeed: (speed: number) => void
  reset: () => void
}

const SPEEDS = [
  { value: 1, key: '1' },
  { value: 2, key: '2' },
  { value: 5, key: '3' },
  { value: 10, key: '4' },
]

export default function TimeControl(props: TimeControlProps) {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ignore if typing in an input field
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    const speedEntry = SPEEDS.find(s => s.key === e.key)
    if (speedEntry) {
      props.changeSpeed(speedEntry.value)
    } else if (e.key === ' ') {
      e.preventDefault()
      props.togglePlayPause()
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onCleanup(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div class="fixed top-4 left-4 z-50 w-40">
      <div class="bg-gradient-to-b from-stone-800/95 to-stone-900/95 border-2 border-amber-700/50 backdrop-blur-sm shadow-xl">
        {/* Header */}
        <div class="bg-gradient-to-r from-amber-900/80 to-amber-800/80 px-3 py-1.5 border-b border-amber-700/50">
          <span class="text-amber-100 font-serif text-xs tracking-widest uppercase">Tempus</span>
        </div>

        <div class="p-3 space-y-2">
          {/* Play/Pause Button */}
          <button
            onClick={props.togglePlayPause}
            class={`w-full px-4 py-2 font-serif text-sm tracking-wide border transition-all ${
              props.isRunning()
                ? 'bg-gradient-to-b from-red-800 to-red-950 border-red-600 text-red-100 hover:from-red-700 hover:to-red-900'
                : 'bg-gradient-to-b from-emerald-800 to-emerald-950 border-emerald-600 text-emerald-100 hover:from-emerald-700 hover:to-emerald-900'
            }`}
          >
            {props.isRunning() ? '⏸ Halt' : '▶ Proceed'}
            <span class="text-xs opacity-60 ml-2">[Space]</span>
          </button>

          {/* Speed Controls */}
          <div class="space-y-1">
            <div class="text-stone-400 text-xs font-serif px-1">Tempo</div>
            <div class="grid grid-cols-4 gap-1">
              <For each={SPEEDS}>
                {(s) => (
                  <button
                    onClick={() => props.changeSpeed(s.value)}
                    class={`py-1.5 font-serif text-xs border transition-all ${
                      props.speed() === s.value
                        ? 'bg-amber-700 border-amber-500 text-amber-100'
                        : 'bg-stone-800 border-stone-600 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
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
            class="w-full px-4 py-2 bg-gradient-to-b from-stone-700 to-stone-800 border border-stone-600 text-stone-300 font-serif text-sm tracking-wide hover:from-stone-600 hover:to-stone-700 transition-all"
          >
            ↺ Restart
          </button>
        </div>
      </div>
    </div>
  )
}
