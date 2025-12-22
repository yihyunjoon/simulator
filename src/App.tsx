import { Show } from 'solid-js'
import { createGameStore } from './gameStore'
import TimeControl from './components/TimeControl'
import Charts from './components/Charts'
import PopulationPyramid from './components/PopulationPyramid'
import ChronicleLog from './components/ChronicleLog'
import MainStats from './components/MainStats'
import GameOverModal from './components/GameOverModal'

function App() {
  const { state, isRunning, speed, togglePlayPause, changeSpeed, reset } = createGameStore()

  const children = () => state.humans.filter((h) => h.age < 15).length

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

        {/* Main Stats */}
        <div class="mb-6">
          <MainStats
            year={state.year}
            population={state.humans.length}
            food={state.food}
            children={children()}
          />
        </div>

        {/* Time Control */}
        <TimeControl
          isRunning={isRunning}
          speed={speed}
          togglePlayPause={togglePlayPause}
          changeSpeed={changeSpeed}
          reset={reset}
        />

        {/* Main Content Grid */}
        <div class="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-6">
          <Charts history={state.history} />
          <PopulationPyramid humans={state.humans} />
        </div>

        {/* Chronicle Log */}
        <div class="mb-6">
          <ChronicleLog logs={state.logs} />
        </div>

        {/* Game Over Modal */}
        <Show when={state.humans.length === 0}>
          <GameOverModal year={state.year} onReset={reset} />
        </Show>
      </div>
    </div>
  )
}

export default App
