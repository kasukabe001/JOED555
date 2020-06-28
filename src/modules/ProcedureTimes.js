export default function ProcedureTimeSelections (value = undefined) {
  const breaks = [
    30, 60, 90, 120, 150, 180, 210,
    240, 270, 300, 330, 360, 420,
    450, 480, 540, 600, 660, 720
  ]

  if (value) {
    if (value < breaks[0]) return breaks[0] + '分まで'
    for (let i = 0; i < breaks.length - 1; i++) {
      if (value >= breaks[i] && value < breaks[i + 1]) return breaks[i] + '分以上 － ' + breaks[i + 1] + '分まで'
    }

    return breaks[breaks.length - 1] + '分以上'
  } else {
    const temporaryArray = []
    temporaryArray.push(breaks[0] + '分まで')
    for (let i = 0; i < breaks.length - 1; i++) {
      temporaryArray.push(breaks[i] + '分以上 － ' + breaks[i + 1] + '分まで')
    }
    temporaryArray.push(breaks[breaks.length - 1] + '分以上')

    return temporaryArray
  }
}
