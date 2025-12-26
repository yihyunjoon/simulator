import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  createSolidTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/solid-table'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { createSignal, For, Show } from 'solid-js'
import type { Human } from '../types'
import { formatYear } from '../utils'
import { TABLE_ROW_HEIGHT } from '../constants'

interface Props {
  humans: Human[]
  currentYear: number
}

export default function PopulationTable(props: Props) {
  let scrollContainerRef: HTMLDivElement | undefined
  const [sorting, setSorting] = createSignal<SortingState>([])

  const columns: ColumnDef<Human>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: info => info.getValue(),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: info => (info.getValue() === 'male' ? 'M' : 'F'),
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: info => info.getValue(),
    },
    {
      accessorFn: row => row.birthYear,
      id: 'birthYear',
      header: 'Birth Year',
      cell: info => {
        const year = info.getValue() as number | undefined
        if (year === undefined) return '-'
        return formatYear(year)
      },
    },
    {
      accessorFn: row => row.spouseId !== undefined,
      id: 'married',
      header: 'Married',
      cell: info => (info.getValue() ? 'Yes' : 'No'),
    },
  ]

  const table = createSolidTable({
    get data() {
      return props.humans
    },
    columns,
    state: {
      get sorting() {
        return sorting()
      },
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const virtualizer = createVirtualizer({
    get count() {
      return table.getRowModel().rows.length
    },
    getScrollElement: () => scrollContainerRef ?? null,
    estimateSize: () => TABLE_ROW_HEIGHT,
    overscan: 10,
  })

  return (
    <section
      class="bg-stone-900/80 border border-amber-900/50 rounded-lg overflow-hidden"
      role="region"
      aria-labelledby="registry-heading"
    >
      <div class="px-4 py-3 border-b border-amber-900/30">
        <h3 id="registry-heading" class="text-amber-200 font-serif text-lg">Population Registry</h3>
        <p class="text-amber-600/70 text-xs mt-1" aria-live="polite">
          {props.humans.length} citizens recorded
        </p>
      </div>
      <div
        ref={scrollContainerRef}
        class="overflow-auto"
        style={{ height: '320px' }}
        tabindex="0"
        aria-label="Population data table, scroll to view more"
      >
        <table class="w-full text-sm" style={{ 'table-layout': 'fixed' }} aria-describedby="registry-heading">
          <thead class="sticky top-0 bg-stone-800/95 z-10">
            <For each={table.getHeaderGroups()}>
              {headerGroup => (
                <tr>
                  <For each={headerGroup.headers}>
                    {header => (
                      <th
                        class="px-3 py-2 text-left text-amber-400/80 font-medium border-b border-amber-900/30 cursor-pointer select-none hover:bg-amber-900/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        classList={{
                          'cursor-pointer': header.column.getCanSort(),
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                        tabindex={header.column.getCanSort() ? 0 : undefined}
                        aria-sort={
                          header.column.getIsSorted() === 'asc' ? 'ascending' :
                          header.column.getIsSorted() === 'desc' ? 'descending' : undefined
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            header.column.getToggleSortingHandler()?.(e)
                          }
                        }}
                      >
                        <div class="flex items-center gap-1">
                          <Show when={!header.isPlaceholder}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </Show>
                          <Show when={header.column.getIsSorted() === 'asc'}>
                            <span class="text-amber-500" aria-hidden="true">▲</span>
                          </Show>
                          <Show when={header.column.getIsSorted() === 'desc'}>
                            <span class="text-amber-500" aria-hidden="true">▼</span>
                          </Show>
                        </div>
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </thead>
          <tbody>
            {/* Spacer for virtualization */}
            <tr>
              <td
                colspan={columns.length}
                style={{ height: `${virtualizer.getVirtualItems()[0]?.start ?? 0}px`, padding: 0 }}
              />
            </tr>
            <For each={virtualizer.getVirtualItems()}>
              {virtualRow => {
                const row = table.getRowModel().rows[virtualRow.index]
                return (
                  <tr
                    class="border-b border-amber-900/20 hover:bg-amber-900/10"
                    style={{ height: `${TABLE_ROW_HEIGHT}px` }}
                  >
                    <For each={row.getVisibleCells()}>
                      {cell => (
                        <td class="px-3 py-2 text-amber-100/80 truncate">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      )}
                    </For>
                  </tr>
                )
              }}
            </For>
            {/* Bottom spacer */}
            <tr>
              <td
                colspan={columns.length}
                style={{
                  height: `${virtualizer.getTotalSize() - (virtualizer.getVirtualItems()[virtualizer.getVirtualItems().length - 1]?.end ?? 0)}px`,
                  padding: 0,
                }}
              />
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
