import { For } from 'solid-js'

interface ChronicleLogProps {
  logs: string[]
}

export default function ChronicleLog(props: ChronicleLogProps) {
  return (
    <div class="bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
      <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          The Royal Chronicle
        </h2>
      </div>
      <div class="p-4 max-h-48 overflow-y-auto">
        <div class="space-y-1 font-serif text-sm">
          <For each={props.logs}>
            {(log) => (
              <div class="text-amber-900/80 hover:text-amber-950 transition-colors border-b border-amber-900/10 pb-1">
                <span class="text-amber-700">-</span> {log}
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
