import { For } from 'solid-js'

interface ChronicleLogProps {
  logs: string[]
}

export default function ChronicleLog(props: ChronicleLogProps) {
  return (
    <section
      class="bg-linear-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden"
      role="log"
      aria-labelledby="chronicle-heading"
      aria-live="polite"
    >
      <div class="bg-linear-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 id="chronicle-heading" class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          The Royal Chronicle
        </h2>
      </div>
      <div class="p-4 max-h-48 overflow-y-auto" tabindex="0" aria-label="Event log, scroll to view more">
        <ul class="space-y-1 font-serif text-sm" role="list">
          <For each={props.logs}>
            {(log) => (
              <li class="text-amber-900/80 hover:text-amber-950 transition-colors border-b border-amber-900/10 pb-1">
                <span class="text-amber-700" aria-hidden="true">-</span> {log}
              </li>
            )}
          </For>
        </ul>
      </div>
    </section>
  )
}
