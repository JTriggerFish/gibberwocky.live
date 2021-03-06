let Gibber = null

let Note = {
  names: [ 'c','db','d','eb','e','f','gb','g','ab','a','bb','b' ],
  indices: {
    c: 0,
    'c#': 1, db: 1,
    d:2,
    'd#':3, eb:3,
    e:4, fb:4,
    f:5,
    'f#':6, gb:6,
    g:7,
    'g#':8, ab:8,
    a:9,
    'a#':10, bb:10,
    b:11, cb:11, 'b#':11
  },


  getMIDI() { return this.value },

  getFrequency() {
    return Math.pow( 2, (this.value - 69) / 12 ) * 440  
  },

  getString() {
    let octave = Math.floor( ( this.value / 12 ) ) - 1,
        index  = this.value % 12

    return Note.names[ index ] + octave
  },

  create( value ) {
    let midiValue = Note.convertToMIDI( value ),
        note = Object.create( this )

    note.value = midiValue

    return note
  },

  convertToMIDI( value ) {
    let midiValue

    if( typeof value === 'string' ) { 
      midiValue = this.convertStringToMIDI( value )
    } else {
      midiValue = Scale.master.getMIDINumber( value )
    }
    
    return midiValue
  },

  convertStringToMIDI( stringValue ) {
    let octave   = parseInt( stringValue.substr( -1 ) ),
        noteName = stringValue.substr( 0, stringValue.length === 2 ? 1 : 2 ),
        noteNum  = Note.indices[ noteName ]
    
    return ( octave + 1 ) * 12 + noteNum
  },

  convertMIDIToString( midiValue ) { },

  convertMIDIToFrequency( midiValue ) { },

  convertScaleMemberToMIDI( scaleIndex, scale ) { }
}

let Chord = {
  create( str ) {
    let chord = Object.create( this )

    let [ root, octave, quality, extension ] = Chord.parseString( str )

    Object.assign( chord, {
      root,
      octave,
      quality,
      extension,
      notes: []
    })

    chord.notes[ 0 ] = parseInt( Note.convertStringToMIDI( root + octave ) )
    
    let _quality = Chord.qualities[ chord.quality ]
    for( let i = 0; i <  _quality.length; i++  ) {
      chord.notes.push( chord.notes[ 0 ] + _quality[ i ] )
    }
    
    if( chord.extension ) {
      // split each extension into array
      chord.extensions = extension.split(/(b?#?\d+)/i)
      
      for( let i = 0; i < chord.extensions.length; i++ ) {
        let _extension = chord.extensions[ i ]
        if( _extension !== '' ) 
          chord.notes.push( Chord.extensions[ _extension ]( chord.notes ) )
      }
    }

    return chord
  },

  qualities: {
    min: [ 3, 7 ],
    maj: [ 4, 7 ],
    dim: [ 3, 6 ],
    aug: [ 4, 8 ],
    sus: [ 5, 7 ]
  },

  extensions: {
    ['7']  ( notes ) { return notes[ 2 ] + 3 },
    ['#7'] ( notes ) { return notes[ 2 ] + 4 },
    ['9']  ( notes ) { return notes[ 2 ] + 7 },
    ['b9'] ( notes ) { return notes[ 2 ] + 6 }
  },

  parseString( str ) {
    let [ chord, root, octave, quality, extension ] = str.match(/([A-Za-z]b?#?)(\d)([a-z]{3})([b?#?\d]*)/i) 

    return [ root.toLowerCase(), octave, quality.toLowerCase(), extension ]
  },
}

let Scale = {
  create( root, mode ) {
    let scale = Object.create( this )
    
    scale.rootNumber = scale.baseNumber = Note.convertToMIDI( root )
    scale.__degree = 'i' 
    scale.quality = 'minor'

    scale.root = function( v ) {
      if( typeof v === 'string' ) {
        root = v
        scale.baseNumber = Note.convertToMIDI( root )
        const degree = Scale.degrees[ scale.quality ][ scale.__degree ]
        scale.rootNumber = degree.offset + scale.baseNumber
      }else if( typeof v === 'number' ) {
        scale.baseNumber = v
        const degree = Scale.degrees[ scale.quality ][ scale.__degree ]
        scale.rootNumber = degree.offset + scale.baseNumber
      }else if( typeof v === 'number' ) {
      }else{
        return root
      }
    }
    scale.modulate = scale.root

    scale.degree = function( __degree ) {
      if( typeof __degree  === 'string' ) {
        const degree = Scale.degrees[ scale.quality ][ __degree ]
        
        scale.__degree = __degree
        scale.rootNumber = degree.offset + scale.baseNumber
        scale.mode( degree.mode )

      } else {
        return scale.__degree
      }
    }
    
    scale.modeNumbers = Scale.modes[ mode ]

    scale.mode = function( v ) {
      if( typeof v === 'string' ) {
        mode = v
        mode = mode[0].toLowerCase() + mode.slice(1)
        scale.modeNumbers = Scale.modes[ mode ]
      }else{
        return mode
      }
    }

    scale.root.valueOf = () => { return root }
    scale.mode.valueOf = () => { return mode }

    if( Gibber !== null ) {
      Gibber.addSequencingToMethod( scale, 'root', 3 )
      Gibber.addSequencingToMethod( scale, 'modulate', 3 )
      Gibber.addSequencingToMethod( scale, 'mode', 2 )
      Gibber.addSequencingToMethod( scale, 'degree',1 )
    }

    return scale
  },

  getMIDINumber( onebased_scaleDegree ) {
    //FastTriggerFish
    // in a musical context I think it makes more sense that notes start at one
    //i.e 1 is root, 3 is third, 8 is octave etc
    scaleDegree = onebased_scaleDegree -1
    let mode   = this.modeNumbers,
        isNegative = scaleDegree < 0,
        octave = Math.floor( scaleDegree / mode.length ),
        degree = isNegative ?
          mode[Math.abs(mode.length + (scaleDegree % mode.length))]
          : mode[scaleDegree % mode.length],
        out

    if( degree === undefined ) degree = 0

    out = isNegative ? 
        this.rootNumber + (octave * 12 ) + degree : 
        this.rootNumber + (octave * 12 ) + degree
  
    return out 
  },

  degrees: {
    major: {},
    minor: {}
  },

  __getBaseNumber( chord ) {
    const start = scale.baseNumber

  },

  __initDegrees() {
    const base = [ 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii' ]

    const scales = [ { name:'minor', values:Scale.modes.aeolian }, { name:'major', values:Scale.modes.ionian } ]

    for( let scale of scales ) {
      let name = scale.name
      let values = scale.values

      for( let i = 0; i < base.length; i++ ) {
        const chord = base[ i ]
        this.degrees[ name ][ chord ] = { mode:'aeolian', offset: values[i] }
      }

      for( let i = 0; i < base.length; i++ ) {
        const chord = base[ i ].toUpperCase()
        this.degrees[ name ][ chord ] = { mode:'ionian', offset: values[i] }
      }

      for( let i = 0; i < base.length; i++ ) {
        const chord = base[ i ] + '7'
        this.degrees[ name ][ chord ] = { mode:'dorian', offset: values[i] }
      }

      for( let i = 0; i < base.length; i++ ) {
        const chord = base[ i ].toUpperCase() + '7'
        this.degrees[ name ][ chord ] = { mode:'mixolydian', offset: values[i] }
      }

      for( let i = 0; i < base.length; i++ ) {
        const chord = base[ i ] + 'o'
        this.degrees[ name ][ chord ] = { mode:'locrian', offset: values[i] }
      }

      for( let i = 0; i < base.length; i++ ) {
        const chord = base[ i ] + 'M7'
        this.degrees[ name ][ chord ] = { mode:'melodicminor', offset: values[i] }
      }
    }
    
  },

  modes: {
    ionian:     [0,2,4,5,7,9,11],
    dorian:     [0,2,3,5,7,9,10],
    phrygian:   [0,1,3,5,7,8,10],
    lydian:     [0,2,4,6,7,9,11],
    mixolydian: [0,2,4,5,7,9,10],
    aeolian:    [0,2,3,5,7,8,10],
    locrian:    [0,1,3,5,6,8,10],
    melodicminor:[0,2,3,5,7,8,11],
    wholeHalf:  [0,2,3,5,6,8,9,11],
    halfWhole:  [0,1,3,4,6,7,9,10],
    chromatic:  [0,1,2,3,4,5,6,7,8,9,10,11],
  }
}


Scale.modes.major = Scale.modes.ionian
Scale.modes.minor = Scale.modes.aeolian
Scale.modes.blues = Scale.modes.mixolydian

module.exports = {
  Note, 
  Chord, 
  Scale, 

  init( _Gibber ) { 
    Gibber = _Gibber; 

    Scale.__initDegrees()
    Scale.master = Scale.create( 'c4','aeolian' )
    
    return this 
  },

  export( obj ) {
    obj.Theory = this
    obj.Scale = Scale.master
    
    const base = [ 'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii' ]

    for( let chord of base ) {
      obj[ chord ] = chord
      const upper = chord.toUpperCase()

      obj[ upper ] = upper
      obj[ chord+'7'] = chord+'7'
      obj[ upper+'7'] = upper+'7'
      obj[ chord+'M7'] = chord+'M7'
    }
  } 
}
