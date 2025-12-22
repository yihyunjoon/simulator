import { For, Show, createMemo } from 'solid-js'
import type { Human } from '../types'

interface FamilyTreeProps {
  allHumans: Human[]
}

interface TreeNode {
  human: Human
  x: number
  y: number
  generation: number
}

const NODE_WIDTH = 70
const NODE_HEIGHT = 44
const GENERATION_GAP = 70
const NODE_GAP = 8

export default function FamilyTree(props: FamilyTreeProps) {
  const getHumanById = (id: number) => props.allHumans.find((h) => h.id === id)

  const treeData = createMemo(() => {
    const humans = props.allHumans
    if (humans.length === 0) return { nodes: [], connections: [], width: 0, height: 0 }

    // Calculate generation for each person
    const generationMap = new Map<number, number>()

    function calculateGeneration(human: Human): number {
      if (generationMap.has(human.id)) {
        return generationMap.get(human.id)!
      }

      if (!human.motherId && !human.fatherId) {
        generationMap.set(human.id, 0)
        return 0
      }

      let parentGen = -1
      if (human.motherId) {
        const mother = getHumanById(human.motherId)
        if (mother) parentGen = Math.max(parentGen, calculateGeneration(mother))
      }
      if (human.fatherId) {
        const father = getHumanById(human.fatherId)
        if (father) parentGen = Math.max(parentGen, calculateGeneration(father))
      }

      const gen = parentGen + 1
      generationMap.set(human.id, gen)
      return gen
    }

    humans.forEach((h) => calculateGeneration(h))

    // Group by generation
    const maxGen = Math.max(...Array.from(generationMap.values()), 0)
    const generations: Human[][] = []
    for (let i = 0; i <= maxGen; i++) {
      generations.push(humans.filter((h) => generationMap.get(h.id) === i))
    }

    // Position nodes - children centered under parents
    const nodes: TreeNode[] = []
    const nodeMap = new Map<number, TreeNode>()
    const childrenByParentPair = new Map<string, Human[]>()

    // Group children by parent pair
    humans.forEach((h) => {
      if (h.motherId && h.fatherId) {
        const key = `${Math.min(h.motherId, h.fatherId)}-${Math.max(h.motherId, h.fatherId)}`
        if (!childrenByParentPair.has(key)) {
          childrenByParentPair.set(key, [])
        }
        childrenByParentPair.get(key)!.push(h)
      }
    })

    // Position founders first (generation 0)
    let currentX = 20
    generations[0].forEach((human) => {
      const node: TreeNode = {
        human,
        x: currentX + NODE_WIDTH / 2,
        y: NODE_HEIGHT / 2 + 20,
        generation: 0,
      }
      nodes.push(node)
      nodeMap.set(human.id, node)
      currentX += NODE_WIDTH + NODE_GAP
    })

    // Position subsequent generations
    for (let gen = 1; gen <= maxGen; gen++) {
      const genHumans = generations[gen]
      const positioned = new Set<number>()

      // Group by parent pair and position under parents
      genHumans.forEach((human) => {
        if (positioned.has(human.id)) return

        const motherId = human.motherId
        const fatherId = human.fatherId

        if (motherId && fatherId) {
          const motherNode = nodeMap.get(motherId)
          const fatherNode = nodeMap.get(fatherId)

          if (motherNode && fatherNode) {
            const key = `${Math.min(motherId, fatherId)}-${Math.max(motherId, fatherId)}`
            const siblings = childrenByParentPair.get(key) || [human]
            const parentCenterX = (motherNode.x + fatherNode.x) / 2
            const totalWidth = siblings.length * NODE_WIDTH + (siblings.length - 1) * NODE_GAP
            let startX = parentCenterX - totalWidth / 2 + NODE_WIDTH / 2

            siblings.forEach((sibling) => {
              if (!positioned.has(sibling.id)) {
                const node: TreeNode = {
                  human: sibling,
                  x: startX,
                  y: gen * (NODE_HEIGHT + GENERATION_GAP) + NODE_HEIGHT / 2 + 20,
                  generation: gen,
                }
                nodes.push(node)
                nodeMap.set(sibling.id, node)
                positioned.add(sibling.id)
                startX += NODE_WIDTH + NODE_GAP
              }
            })
          }
        }
      })

      // Position any remaining (orphans or single parent)
      genHumans.forEach((human) => {
        if (!positioned.has(human.id)) {
          const existingNodes = nodes.filter((n) => n.generation === gen)
          const maxX = existingNodes.length > 0
            ? Math.max(...existingNodes.map((n) => n.x)) + NODE_WIDTH + NODE_GAP
            : 20 + NODE_WIDTH / 2

          const node: TreeNode = {
            human,
            x: maxX,
            y: gen * (NODE_HEIGHT + GENERATION_GAP) + NODE_HEIGHT / 2 + 20,
            generation: gen,
          }
          nodes.push(node)
          nodeMap.set(human.id, node)
        }
      })
    }

    // Resolve overlaps
    for (let gen = 0; gen <= maxGen; gen++) {
      const genNodes = nodes.filter((n) => n.generation === gen).sort((a, b) => a.x - b.x)
      for (let i = 1; i < genNodes.length; i++) {
        const prev = genNodes[i - 1]
        const curr = genNodes[i]
        const minDist = NODE_WIDTH + NODE_GAP
        if (curr.x - prev.x < minDist) {
          curr.x = prev.x + minDist
        }
      }
    }

    // Build connections
    const connections: { fromX: number; fromY: number; toX: number; toY: number; color: string }[] = []

    nodes.forEach((node) => {
      const human = node.human
      if (human.motherId && human.fatherId) {
        const motherNode = nodeMap.get(human.motherId)
        const fatherNode = nodeMap.get(human.fatherId)

        if (motherNode && fatherNode) {
          // Draw from parent pair center to child
          const parentCenterX = (motherNode.x + fatherNode.x) / 2
          const parentY = motherNode.y + NODE_HEIGHT / 2
          const childY = node.y - NODE_HEIGHT / 2

          connections.push({
            fromX: parentCenterX,
            fromY: parentY,
            toX: node.x,
            toY: childY,
            color: '#92400e',
          })

          // Connect parents with horizontal line
          connections.push({
            fromX: Math.min(motherNode.x, fatherNode.x) + NODE_WIDTH / 2 - 4,
            fromY: motherNode.y,
            toX: Math.max(motherNode.x, fatherNode.x) - NODE_WIDTH / 2 + 4,
            toY: fatherNode.y,
            color: '#dc2626',
          })
        }
      }
    })

    // Calculate bounds
    const allX = nodes.map((n) => n.x)
    const minX = Math.min(...allX) - NODE_WIDTH / 2 - 20

    // Shift all nodes if minX is negative
    if (minX < 0) {
      const shift = -minX + 20
      nodes.forEach((n) => (n.x += shift))
      connections.forEach((c) => {
        c.fromX += shift
        c.toX += shift
      })
    }

    const finalMaxX = Math.max(...nodes.map((n) => n.x)) + NODE_WIDTH / 2 + 20
    const height = (maxGen + 1) * (NODE_HEIGHT + GENERATION_GAP) + 40

    return { nodes, connections, width: Math.max(finalMaxX, 300), height }
  })

  const formatLifespan = (human: Human) => {
    if (!human.birthYear) return ''
    if (human.isAlive) return `b.${human.birthYear}`
    return `${human.birthYear}-${human.deathYear}`
  }

  return (
    <div class="bg-gradient-to-b from-amber-100 to-amber-50 border-4 border-amber-900/40 overflow-hidden">
      <div class="bg-gradient-to-r from-amber-900 to-amber-800 px-4 py-2 border-b-2 border-amber-950">
        <h2 class="text-amber-100 font-serif tracking-widest text-sm uppercase">
          ⚜ Family Tree ⚜
        </h2>
      </div>

      <div class="p-4 overflow-auto max-h-96">
        <Show
          when={props.allHumans.length > 0}
          fallback={
            <div class="text-center text-amber-800/50 font-serif italic py-8">
              No lineage recorded...
            </div>
          }
        >
          <svg
            width={treeData().width}
            height={treeData().height}
            class="mx-auto"
            style={{ "min-width": `${treeData().width}px` }}
          >
            {/* Connection lines */}
            <For each={treeData().connections}>
              {(conn) => {
                if (conn.fromY === conn.toY) {
                  // Horizontal marriage line
                  return (
                    <line
                      x1={conn.fromX}
                      y1={conn.fromY}
                      x2={conn.toX}
                      y2={conn.toY}
                      stroke={conn.color}
                      stroke-width="2"
                      stroke-dasharray="4,2"
                    />
                  )
                }
                // Parent to child line
                const midY = (conn.fromY + conn.toY) / 2
                return (
                  <path
                    d={`M ${conn.fromX} ${conn.fromY}
                        L ${conn.fromX} ${midY}
                        L ${conn.toX} ${midY}
                        L ${conn.toX} ${conn.toY}`}
                    fill="none"
                    stroke={conn.color}
                    stroke-width="1.5"
                  />
                )
              }}
            </For>

            {/* Nodes */}
            <For each={treeData().nodes}>
              {(node) => {
                const human = node.human
                const rectX = node.x - NODE_WIDTH / 2
                const rectY = node.y - NODE_HEIGHT / 2

                const bgColor = human.isAlive
                  ? human.gender === 'male'
                    ? '#dbeafe'
                    : '#fce7f3'
                  : '#d4d4d4'

                const borderColor = human.isAlive
                  ? human.gender === 'male'
                    ? '#3b82f6'
                    : '#ec4899'
                  : '#737373'

                const textColor = human.isAlive
                  ? human.gender === 'male'
                    ? '#1e40af'
                    : '#9d174d'
                  : '#404040'

                return (
                  <g>
                    <rect
                      x={rectX}
                      y={rectY}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx="3"
                      fill={bgColor}
                      stroke={borderColor}
                      stroke-width="1.5"
                    />
                    <circle
                      cx={rectX + NODE_WIDTH - 5}
                      cy={rectY + 5}
                      r="3"
                      fill={human.isAlive ? '#22c55e' : '#737373'}
                    />
                    <text
                      x={node.x}
                      y={node.y - 5}
                      text-anchor="middle"
                      font-size="11"
                      font-weight="500"
                      fill={textColor}
                    >
                      {human.gender === 'male' ? '♂' : '♀'} {human.name}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 10}
                      text-anchor="middle"
                      font-size="8"
                      fill="#78716c"
                    >
                      {formatLifespan(human)}
                      {human.isAlive && ` (${human.age})`}
                    </text>
                  </g>
                )
              }}
            </For>
          </svg>

          <div class="mt-4 pt-3 border-t border-amber-900/20 flex justify-between text-xs font-serif text-amber-800">
            <span>Total: {props.allHumans.length}</span>
            <span>
              Living: {props.allHumans.filter((h) => h.isAlive).length} |
              Deceased: {props.allHumans.filter((h) => !h.isAlive).length}
            </span>
          </div>
        </Show>
      </div>
    </div>
  )
}
