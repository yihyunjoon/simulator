import { For, Show } from 'solid-js'
import { createGameStore } from './gameStore'
import TimeControl from './components/TimeControl'

function App() {
  const { state, isRunning, speed, togglePlayPause, changeSpeed, reset } = createGameStore()

  const males = () => state.humans.filter((h) => h.gender === 'male')
  const females = () => state.humans.filter((h) => h.gender === 'female')
  const children = () => state.humans.filter((h) => h.age < 15)
  const workers = () => state.humans.filter((h) => h.age >= 15 && h.age < 50)

  const foodStatus = () => {
    const perPerson = state.humans.length > 0 ? state.food / state.humans.length : 0
    if (perPerson >= 20) return { label: 'Abundant', color: 'text-emerald-700' }
    if (perPerson >= 10) return { label: 'Sufficient', color: 'text-amber-700' }
    if (perPerson >= 5) return { label: 'Scarce', color: 'text-orange-700' }
    return { label: 'Famine', color: 'text-red-800' }
  }

  const ageGroups = () => {
    const groups = [
      { label: '50-59', min: 50, max: 59 },
      { label: '40-49', min: 40, max: 49 },
      { label: '30-39', min: 30, max: 39 },
      { label: '20-29', min: 20, max: 29 },
      { label: '10-19', min: 10, max: 19 },
      { label: '0-9', min: 0, max: 9 },
    ]

    const maxCount = Math.max(
      1,
      ...groups.map(g =>
        Math.max(
          state.humans.filter(h => h.gender === 'male' && h.age >= g.min && h.age <= g.max).length,
          state.humans.filter(h => h.gender === 'female' && h.age >= g.min && h.age <= g.max).length
        )
      )
    )

    return groups.map(g => ({
      label: g.label,
      males: state.humans.filter(h => h.gender === 'male' && h.age >= g.min && h.age <= g.max).length,
      females: state.humans.filter(h => h.gender === 'female' && h.age >= g.min && h.age <= g.max).length,
      maxCount,
    }))
  }

  return (
    <div
      class="min-h-screen p-4 md:p-8"
      style={{
        'background': 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 50%, #0d0705 100%)',
      }}
    >
      <div class="max-w-6xl mx-auto">
        {/* Header - Royal Banner Style */}
        <div class="relative text-center mb-8">
          <div class="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-600/50 to-transparent" />
          <div class="relative inline-block bg-gradient-to-b from-amber-900/90 to-amber-950/90 px-12 py-4 border-2 border-amber-600/60">
            <div class="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-500" />
            <div class="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-500" />
            <div class="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-500" />
            <div class="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-500" />
            <h1 class="text-4xl md:text-5xl font-serif text-amber-100 tracking-widest">
              CHRONICLES
            </h1>
            <p class="text-amber-400/80 text-sm tracking-[0.3em] mt-1 font-serif italic">
              A History of Mankind
            </p>
          </div>
        </div>

        {/* Main Stats - Parchment Style */}
        <div class="bg-gradient-to-b from-amber-100 to-amber-50 rounded border-4 border-amber-900/40 shadow-2xl mb-6 overflow-hidden">
          <div class="bg-gradient-to-r from-amber-900/20 via-transparent to-amber-900/20 p-1">
            <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-amber-900/20">
              {/* Year */}
              <div class="p-4 text-center">
                <div class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Anno Domini</div>
                <div class="text-4xl font-serif text-amber-950 font-bold">{state.year}</div>
              </div>

              {/* Population */}
              <div class="p-4 text-center">
                <div class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Populus</div>
                <div class="text-4xl font-serif text-amber-950 font-bold">{state.humans.length}</div>
              </div>

              {/* Food */}
              <div class="p-4 text-center">
                <div class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Granary</div>
                <div class={`text-4xl font-serif font-bold ${foodStatus().color}`}>{state.food}</div>
                <div class={`text-xs ${foodStatus().color} font-serif`}>{foodStatus().label}</div>
              </div>

              {/* Births */}
              <div class="p-4 text-center">
                <div class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Infantes</div>
                <div class="text-4xl font-serif text-amber-950 font-bold">{children().length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Control Component - Fixed Top Left */}
        <TimeControl
          isRunning={isRunning}
          speed={speed}
          togglePlayPause={togglePlayPause}
          changeSpeed={changeSpeed}
          reset={reset}
        />

        {/* Main Content Grid */}
        <div class="grid md:grid-cols-3 gap-4 mb-6">
          {/* Census - Left Panel */}
          <div class="md:col-span-2 bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
            {/* Panel Header */}
            <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
              <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
                ⚜ Census of the Realm ⚜
              </h2>
            </div>

            <div class="p-4">
              {/* Demographics Summary */}
              <div class="grid grid-cols-3 gap-3 mb-4">
                <div class="bg-gradient-to-b from-blue-900/20 to-blue-950/20 border border-blue-900/30 p-3 text-center">
                  <div class="text-3xl font-serif text-blue-900 font-bold">{males().length}</div>
                  <div class="text-xs text-blue-800/70 font-serif uppercase tracking-wider">Men</div>
                </div>
                <div class="bg-gradient-to-b from-rose-900/20 to-rose-950/20 border border-rose-900/30 p-3 text-center">
                  <div class="text-3xl font-serif text-rose-900 font-bold">{females().length}</div>
                  <div class="text-xs text-rose-800/70 font-serif uppercase tracking-wider">Women</div>
                </div>
                <div class="bg-gradient-to-b from-amber-900/20 to-amber-950/20 border border-amber-900/30 p-3 text-center">
                  <div class="text-3xl font-serif text-amber-900 font-bold">{workers().length}</div>
                  <div class="text-xs text-amber-800/70 font-serif uppercase tracking-wider">Laborers</div>
                </div>
              </div>

              {/* Population Scroll */}
              <div class="bg-amber-950/10 border border-amber-900/30 p-3 max-h-44 overflow-y-auto">
                <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  <For each={state.humans}>
                    {(human) => (
                      <div
                        class={`aspect-square flex flex-col items-center justify-center text-xs border cursor-default ${
                          human.gender === 'male'
                            ? 'bg-gradient-to-b from-blue-100 to-blue-200 border-blue-400/50 text-blue-900'
                            : 'bg-gradient-to-b from-rose-100 to-rose-200 border-rose-400/50 text-rose-900'
                        }`}
                        title={`${human.name}, Age ${human.age}`}
                      >
                        <span class="text-lg leading-none">
                          {human.age < 15 ? '👶' : human.age < 50 ? (human.gender === 'male' ? '♂' : '♀') : '⚰'}
                        </span>
                        <span class="text-[10px] opacity-70">{human.age}</span>
                      </div>
                    )}
                  </For>
                  <Show when={state.humans.length === 0}>
                    <div class="col-span-full text-center text-amber-800/50 font-serif italic py-8">
                      No souls remain...
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>

          {/* Population Pyramid - Right Panel */}
          <div class="bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
            <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
              <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
                ⚜ Population Pyramid ⚜
              </h2>
            </div>

            <div class="p-4">
              {/* Legend */}
              <div class="flex justify-between text-xs font-serif text-amber-900 mb-3 px-2">
                <span class="text-blue-800">♂ Male</span>
                <span class="text-rose-800">Female ♀</span>
              </div>

              {/* Pyramid */}
              <div class="space-y-1">
                <For each={ageGroups()}>
                  {(group) => (
                    <div class="flex items-center gap-1">
                      {/* Male bar (right-aligned) */}
                      <div class="flex-1 flex justify-end">
                        <div
                          class="h-5 bg-gradient-to-l from-blue-600 to-blue-400 border border-blue-700/50"
                          style={{ width: `${(group.males / group.maxCount) * 100}%`, 'min-width': group.males > 0 ? '2px' : '0' }}
                        />
                      </div>
                      {/* Male count */}
                      <div class="w-6 text-right text-xs font-serif text-blue-900">
                        {group.males}
                      </div>
                      {/* Age label */}
                      <div class="w-12 text-center text-xs font-serif text-amber-800 bg-amber-200/50 border border-amber-400/30 py-0.5">
                        {group.label}
                      </div>
                      {/* Female count */}
                      <div class="w-6 text-left text-xs font-serif text-rose-900">
                        {group.females}
                      </div>
                      {/* Female bar (left-aligned) */}
                      <div class="flex-1 flex justify-start">
                        <div
                          class="h-5 bg-gradient-to-r from-rose-400 to-rose-600 border border-rose-700/50"
                          style={{ width: `${(group.females / group.maxCount) * 100}%`, 'min-width': group.females > 0 ? '2px' : '0' }}
                        />
                      </div>
                    </div>
                  )}
                </For>
              </div>

              {/* Food Status */}
              <div class="mt-4 pt-3 border-t border-amber-900/20">
                <div class="flex justify-between text-xs font-serif text-amber-900 mb-1">
                  <span>Food per Capita</span>
                  <span class={foodStatus().color}>
                    {state.humans.length > 0 ? Math.floor(state.food / state.humans.length) : 0} — {foodStatus().label}
                  </span>
                </div>
                <div class="h-4 bg-amber-200 border border-amber-400/50 overflow-hidden">
                  <div
                    class={`h-full ${
                      (state.food / Math.max(state.humans.length, 1)) >= 10
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-700'
                        : 'bg-gradient-to-r from-red-500 to-red-700'
                    }`}
                    style={{ width: `${Math.min((state.food / Math.max(state.humans.length, 1)) * 5, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chronicle Log - Scroll Style */}
        <div class="bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
          <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
            <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
              ⚜ The Royal Chronicle ⚜
            </h2>
          </div>
          <div class="p-4 max-h-48 overflow-y-auto">
            <div class="space-y-1 font-serif text-sm">
              <For each={state.logs}>
                {(log) => (
                  <div class="text-amber-900/80 hover:text-amber-950 transition-colors border-b border-amber-900/10 pb-1">
                    <span class="text-amber-700">❧</span> {log}
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        {/* Game Over - Royal Decree Style */}
        <Show when={state.humans.length === 0}>
          <div class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div class="bg-gradient-to-b from-amber-100 to-amber-200 border-8 border-double border-amber-900 p-8 text-center max-w-md relative">
              {/* Corner Decorations */}
              <div class="absolute top-2 left-2 text-2xl text-amber-800/30">⚜</div>
              <div class="absolute top-2 right-2 text-2xl text-amber-800/30">⚜</div>
              <div class="absolute bottom-2 left-2 text-2xl text-amber-800/30">⚜</div>
              <div class="absolute bottom-2 right-2 text-2xl text-amber-800/30">⚜</div>

              <div class="text-6xl mb-4">💀</div>
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
                <div class="text-5xl font-serif text-amber-950 font-bold">{state.year}</div>
              </div>

              <button
                onClick={reset}
                class="px-8 py-3 bg-gradient-to-b from-emerald-800 to-emerald-950 border-2 border-emerald-600 text-emerald-100 font-serif text-lg tracking-wide hover:from-emerald-700 hover:to-emerald-900 transition-all"
              >
                Begin Anew
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default App
