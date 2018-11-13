module.exports = function (Gibber) {
  let Pattern = Gibber.Pattern

  let TbSeq = function (sequenceString, time = 1 / 16, rotation) {

    let steps = testSeq.match(/[_*]?(([a-g]{1}[#b]?\d?)|s)?[.\-://]{1}/g)

    let notesAndAccents = testSeq.split(/[.//-:]+/)
    notesAndAccents.splice(-1, 1)

    let repeatsAndLengths = testSeq.match(/[.//-]+/g)
    let repeats = repeatsAndLengths.map(x => x.length)
    let notes = notesAndAccents.map(x => x.replace(/[_*0-9s]+/, ""))

    let currentOctave = notesAndAccents[0].match(/[0-9]/)
    currentOctave = (currentOctave === null || currentOctave.length < 1) ?
      1 : currentOctave[0]
    let octaves = notesAndAccents.map(function (x, i) {
      let octString = x.match(/[0-9]/)
      currentOctave = (octString === null || octString.length < 1) ?
        currentOctave : octString[0]
      return currentOctave
    })

    let velocities = notesAndAccents.map(function (x) {
      let m = x.match(/[*_]/)
      let s = (m === null || m.length < 1) ? "" : m[0]
      return TbSeq.Velocities[s]
    })

    let lengths = repeatsAndLengths.map(x => TbSeq.Lengths[x[0]])
  }


  let pattern = Gibber.Pattern.apply(null, todo)

  pattern.time = time

  //let output = { time, shouldExecute: 0 }

  pattern.filters.push((args) => {
    let val = args[0],
      idx = args[2],
      output = { time, shouldExecute: 0 }

    output.shouldExecute = val > 0

    args[0] = output

    return args
  })


  if (typeof rotation === 'number') pattern.rotate(rotation)

  return pattern
}

return TbSeq

}
