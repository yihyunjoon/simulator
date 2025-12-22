interface GameOverModalProps {
  year: number
  onReset: () => void
}

export default function GameOverModal(props: GameOverModalProps) {
  return (
    <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-linear-to-b from-amber-100 to-amber-200 border-8 border-double border-amber-900 p-8 text-center max-w-md relative">
        <div class="absolute top-2 left-2 text-2xl text-amber-800/30">+</div>
        <div class="absolute top-2 right-2 text-2xl text-amber-800/30">+</div>
        <div class="absolute bottom-2 left-2 text-2xl text-amber-800/30">+</div>
        <div class="absolute bottom-2 right-2 text-2xl text-amber-800/30">+</div>

        <div class="text-6xl mb-4">THE END</div>
        <h2 class="text-3xl font-serif text-red-900 mb-2 tracking-wide">
          THE END OF DAYS
        </h2>
        <p class="text-amber-900/70 font-serif italic mb-4">
          "And so the last of mankind perished, leaving naught but silence..."
        </p>

        <div class="bg-amber-900/10 border border-amber-900/30 p-4 mb-6">
          <div class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">
            Years of Civilization
          </div>
          <div class="text-5xl font-serif text-amber-950 font-bold">{props.year}</div>
        </div>

        <button
          onClick={props.onReset}
          class="px-8 py-3 bg-linear-to-b from-emerald-800 to-emerald-950 border-2 border-emerald-600 text-emerald-100 font-serif text-lg tracking-wide hover:from-emerald-700 hover:to-emerald-900 transition-all"
        >
          Begin Anew
        </button>
      </div>
    </div>
  )
}
