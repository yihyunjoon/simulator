import { For, createMemo } from 'solid-js'
import type { Human } from '../types'

interface PopulationPyramidProps {
  humans: Human[]
}

export default function PopulationPyramid(props: PopulationPyramidProps) {
  const ageGroups = createMemo(() => {
    const groups = [
      { label: '60-69', min: 60, max: 69 },
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
          props.humans.filter(h => h.gender === 'male' && h.age >= g.min && h.age <= g.max).length,
          props.humans.filter(h => h.gender === 'female' && h.age >= g.min && h.age <= g.max).length
        )
      )
    )

    return groups.map(g => ({
      label: g.label,
      males: props.humans.filter(h => h.gender === 'male' && h.age >= g.min && h.age <= g.max).length,
      females: props.humans.filter(h => h.gender === 'female' && h.age >= g.min && h.age <= g.max).length,
      maxCount,
    }))
  })

  return (
    <div class="bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
      <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          Population Pyramid
        </h2>
      </div>

      <div class="p-4">
        <div class="flex justify-between text-xs font-serif text-amber-900 mb-3 px-2">
          <span class="text-blue-800">Male</span>
          <span class="text-rose-800">Female</span>
        </div>

        <div class="space-y-1">
          <For each={ageGroups()}>
            {(group) => (
              <div class="flex items-center gap-1">
                <div class="flex-1 flex justify-end">
                  <div
                    class="h-4 bg-gradient-to-l from-blue-600 to-blue-400 border border-blue-700/50"
                    style={{ width: `${(group.males / group.maxCount) * 100}%`, 'min-width': group.males > 0 ? '2px' : '0' }}
                  />
                </div>
                <div class="w-6 text-right text-xs font-serif text-blue-900">
                  {group.males}
                </div>
                <div class="w-10 text-center text-[10px] font-serif text-amber-800 bg-amber-200/50 border border-amber-400/30">
                  {group.label}
                </div>
                <div class="w-6 text-left text-xs font-serif text-rose-900">
                  {group.females}
                </div>
                <div class="flex-1 flex justify-start">
                  <div
                    class="h-4 bg-gradient-to-r from-rose-400 to-rose-600 border border-rose-700/50"
                    style={{ width: `${(group.females / group.maxCount) * 100}%`, 'min-width': group.females > 0 ? '2px' : '0' }}
                  />
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}
