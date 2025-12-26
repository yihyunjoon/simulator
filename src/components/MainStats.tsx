import { createMemo } from 'solid-js'
import { formatYear } from '../utils'
import { FOOD_STATUS_ABUNDANT, FOOD_STATUS_SUFFICIENT, FOOD_STATUS_SCARCE } from '../constants'

interface MainStatsProps {
  year: number
  population: number
  food: number
  children: number
}

export default function MainStats(props: MainStatsProps) {
  const foodStatus = createMemo(() => {
    const perPerson = props.population > 0 ? props.food / props.population : 0
    if (perPerson >= FOOD_STATUS_ABUNDANT) return { label: 'Abundant', color: 'text-emerald-700' }
    if (perPerson >= FOOD_STATUS_SUFFICIENT) return { label: 'Sufficient', color: 'text-amber-700' }
    if (perPerson >= FOOD_STATUS_SCARCE) return { label: 'Scarce', color: 'text-orange-700' }
    return { label: 'Famine', color: 'text-red-800' }
  })

  return (
    <section
      class="bg-linear-to-b from-amber-100 to-amber-50 rounded border-4 border-amber-900/40 shadow-2xl overflow-hidden"
      role="region"
      aria-label="Main statistics"
    >
      <div class="bg-linear-to-r from-amber-900/20 via-transparent to-amber-900/20 p-1">
        <div class="grid grid-cols-2 md:grid-cols-4 divide-x divide-amber-900/20">
          <div class="p-4 text-center" role="group" aria-labelledby="year-label">
            <div id="year-label" class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Annus</div>
            <div class="text-4xl font-serif text-amber-950 font-bold" aria-label={`Year: ${formatYear(props.year)}`}>
              {formatYear(props.year)}
            </div>
          </div>

          <div class="p-4 text-center" role="group" aria-labelledby="pop-label">
            <div id="pop-label" class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Populus</div>
            <div class="text-4xl font-serif text-amber-950 font-bold" aria-label={`Population: ${props.population}`}>
              {props.population}
            </div>
          </div>

          <div class="p-4 text-center" role="group" aria-labelledby="food-label">
            <div id="food-label" class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Granary</div>
            <div
              class={`text-4xl font-serif font-bold ${foodStatus().color}`}
              aria-label={`Food: ${props.food}, Status: ${foodStatus().label}`}
              role="status"
            >
              {props.food}
            </div>
            <div class={`text-xs ${foodStatus().color} font-serif`} aria-hidden="true">
              {foodStatus().label}
            </div>
          </div>

          <div class="p-4 text-center" role="group" aria-labelledby="children-label">
            <div id="children-label" class="text-xs text-amber-800/60 uppercase tracking-widest font-serif mb-1">Infantes</div>
            <div class="text-4xl font-serif text-amber-950 font-bold" aria-label={`Children: ${props.children}`}>
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
