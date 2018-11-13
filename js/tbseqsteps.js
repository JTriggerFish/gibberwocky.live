module.exports = function( Gibber ) {
  
let TbSteps = {
  type:'TbSteps',
  create( stringSeq, track = Gibber.currentTrack ) {

    let tbSteps = Object.create( TbSteps )
    
    let seq = Gibber.Seq(key, Gibber.TbSeq(values), 'midinote', track, 0)
    seq.trackID = track.id

    tbSteps.seq = seq

    tbSteps.start()
    tbSteps.addPatternMethods()

    return tbSteps
  },
  
  addPatternMethods() {
    groupMethodNames.map( (name) => {
      this[ name ] = function( ...args ) {
        for( let key in this.seqs ) {
          this.seqs[ key ].values[ name ].apply( this, args )
        }
      }
    
      Gibber.addSequencingToMethod( this, name, 1 )
    })
  },

  start() {
      this.seq.start()
  },

  stop() {
      this.seqs.stop()
  },

  clear() { 
    this.stop() 
      this.seq.timings.clear()
  },

  /*
   *rotate( amt ) {
   *  for( let key in this.seqs ) { 
   *    this.seqs[ key ].values.rotate( amt )
   *  }
   *},
   */
}

const groupMethodNames = [ 
  'rotate', 'reverse', 'transpose', 'range',
  'shuffle', 'scale', 'repeat', 'switch', 'store', 
  'reset','flip', 'invert', 'set'
]

return TbSteps.create

}
