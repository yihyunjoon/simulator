import { For, createMemo } from 'solid-js'
import type { Human } from '../types'

interface PopulationPyramidProps {
  humans: Human[]
}

export default function PopulationPyramid(props: PopulationPyramidProps) {
  const ageGroups = createMemo(() => {
    // Single-pass calculation: O(n) instead of O(n) × 40
    // 10 groups: 0-9, 10-19, ..., 90-99
    const maleCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const femaleCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    for (const human of props.humans) {
      const groupIndex = Math.min(9, Math.floor(human.age / 10))
      if (human.gender === 'male') {
        maleCounts[groupIndex]++
      } else {
        femaleCounts[groupIndex]++
      }
    }

    const maxCount = Math.max(1, ...maleCounts, ...femaleCounts)

    const labels = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']

    // Return in reverse order (oldest first)
    return labels.map((label, i) => ({
      label,
      males: maleCounts[i],
      females: femaleCounts[i],
      maxCount,
    })).reverse()
  })

  return (
    <section
      class="bg-linear-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden"
      role="region"
      aria-labelledby="pyramid-heading"
    >
      <div class="bg-linear-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 id="pyramid-heading" class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          Population Pyramid
        </h2>
      </div>

      <div class="p-4">
        <div class="flex justify-between text-xs font-serif text-amber-900 mb-3 px-2">
          <span class="text-blue-800">Male</span>
          <span class="text-rose-800">Female</span>
        </div>

        <div class="space-y-1" role="list" aria-label="Age distribution by gender">
          <For each={ageGroups()}>
            {(group) => (
              <div
                class="flex items-center gap-1"
                role="listitem"
                aria-label={`Age ${group.label}: ${group.males} males, ${group.females} females`}
              >
                <div class="flex-1 flex justify-end" aria-hidden="true">
                  <div
                    class="h-4 bg-linear-to-l from-blue-600 to-blue-400 border border-blue-700/50"
                    style={{ width: `${(group.males / group.maxCount) * 100}%`, 'min-width': group.males > 0 ? '2px' : '0' }}
                  />
                </div>
                <div class="w-6 text-right text-xs font-serif text-blue-900" aria-hidden="true">
                  {group.males}
                </div>
                <div class="w-10 text-center text-[10px] font-serif text-amber-800 bg-amber-200/50 border border-amber-400/30" aria-hidden="true">
                  {group.label}
                </div>
                <div class="w-6 text-left text-xs font-serif text-rose-900" aria-hidden="true">
                  {group.females}
                </div>
                <div class="flex-1 flex justify-start" aria-hidden="true">
                  <div
                    class="h-4 bg-linear-to-r from-rose-400 to-rose-600 border border-rose-700/50"
                    style={{ width: `${(group.females / group.maxCount) * 100}%`, 'min-width': group.females > 0 ? '2px' : '0' }}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </section>
  )
}
