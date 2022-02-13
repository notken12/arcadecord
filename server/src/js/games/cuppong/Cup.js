const radius = 0.046 // m
const tableEndMargin = 0.035 // m
const cupMargin = 0.02 // m
const tableLength = 2.4384 // m
const tableWidth = 0.6096 // m


export function getCupPosition(cup) {
    // Red: +z
    // Blue: -z
    const backOfTable = cup.color === 'red' ? tableLength / 2 + - tableEndMargin - radius : -tableLength / 2 + tableEndMargin + radius
    // const offsetZ = cup.color === 'red' ? 2 * radius * Math.cos(Math.PI / 6) * -1 : 2 * radius * Math.cos(Math.PI / 6);
    const offsetZ = cup.color === 'red' ? -2 * radius : 2 * radius
    // const offset = cup.color === 'red' ? -radius * 2 : radius * 2
    const offset = cup.color === 'red' ? 2 * radius / Math.sin(Math.PI / 3) : -2 * radius / Math.sin(Math.PI / 3)
    const cupMarginOffset = cup.color === 'red' ? -cupMargin : cupMargin
    const oddRow = cup.row % 2 === 1
    let x = cup.rowPos * offset
    let z = backOfTable + cup.rowNum * offsetZ
    const y = 0
    if (cup.out)
        x += cup.color === 'red' ? -1 : 1
    return { x, y, z }
}

export { tableLength, tableWidth }