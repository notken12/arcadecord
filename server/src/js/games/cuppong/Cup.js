const radius = 4.6 // cm
const tableEndMargin = 3.5 // cm
const cupMargin = 0.2 // cm
const tableLength = 243.84 // cm



export function getCupPosition(cup) {
    const backOfTable = cup.color === 'red' ? tableLength / 2 + - tableEndMargin - radius : -tableLength / 2 + tableEndMargin + radius
    const offsetZ = cup.color === 'red' ? 2 * radius * Math.cos(Math.PI / 6) * -1 : 2 * radius * Math.cos(Math.PI / 6);
    const offset = cup.color === 'red' ? -radius * 2 : radius * 2
    const cupMarginOffset = cup.color === 'red' ? -cupMargin : cupMargin
    const oddRow = cup.row % 2 === 1
    let x = cup.rowPos * offset
    let z = backOfTable + cup.rowNum * offsetZ
    const y = 0
    return { x, y, z }
}