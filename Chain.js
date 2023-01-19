/* eslint-disable */

class Chain {
  constructor(_id, _root) {
    this.id = _id;
    this.cursor = 0;

    this.isPlaying = false;
    this.root = _root;
    this.parentGridId = _root.parentGridId;

    this.voiceCount = 9;
    this.steps = [];

    this.setupSynths();
  }

  setupSynths() {
    this.synthVoices = [];

    for (let i = 0; i < this.voiceCount; i++) {
      this.synthVoices.push(new p5.MonoSynth());
    }
  }

  get parentGrid() {
    return window.grids[this.parentGridId];
  }

  assemble(startingAt = this.root) {
    /* 
      starting at the current cell...
      check to see if there are any connected cells 
      on the top right or bottom
      
      if those cell doesn't belong to another chain
      and add the cell to the chain of the current cell
      
      add the current node to this.steps and
      nodes above and below should be added to a voiceArray      
      
      then call this function recursively on that new cell
      and make sure that new recursive function ignores
      the cell that initiated the recursive call
    */

    let stack = [];
    /* this turned out to be in a massive performance save */
    let checked = [];
    stack.push([startingAt, undefined]);

    while (stack.length) {
      let obj = stack.pop();
      let node = obj[0];
      let referrer = obj[1];

      let h_dist_from_root = node.position.x - this.root.position.x;
      let v_dist_from_root = this.root.position.y - node.position.y;

      // if the root is to the left, break. this
      // happens when a hold chain is broken by
      // a new inmark
      if (h_dist_from_root < 0) return;
      if (h_dist_from_root >= this.steps.length) {
        this.steps.push(new Array(this.voiceCount));
      }

      this.steps[h_dist_from_root][4 + v_dist_from_root] = node;

      let up = this.parentGrid.getCell(node.position.x, node.position.y - 1);
      let down = this.parentGrid.getCell(node.position.x, node.position.y + 1);
      let right = this.parentGrid.getCell(node.position.x + 1, node.position.y);
      let left = this.parentGrid.getCell(node.position.x - 1, node.position.y);

      if (right && right !== referrer && !checked.includes(right)) {
        right.parentChainId = this.id;
        stack.push([right, node]);
        checked.push(node);
      }

      if (
        left &&
        left !== referrer &&
        !checked.includes(left) &&
        left.parentChain !== this
      ) {
        left.parentChainId = this.id;
        stack.push([left, node]);
        checked.push(node);
      }

      if (up && up !== referrer && !checked.includes(up)) {
        up.parentChainId = this.id;
        stack.push([up, node]);
        checked.push(node);
      }

      if (down && down !== referrer && !checked.includes(down)) {
        down.parentChainId = this.id;
        stack.push([down, node]);
        checked.push(node);
      }
    }
  }

  removeFromChain(node) {
    this.steps = [];
    this.assemble(this.root);
  }

  releaseAndClear() {
    for (let voice of this.synthVoices) {
      voice.dispose();
      // all notes off
      if (window.midi.currentMIDIPort) {
        window.midi.currentMIDIPort.send([
          parseInt(0xb0),
          parseInt(0x7b),
          this.root.data.MIDIChannel,
        ]);
      }
    }
  }

  play(timeFromNow) {
    /* if the only node is the root, bail out */
    if (this.steps.length === 1) return;

    let enableSound = !window.transport.isMuted;
    let midi = window.midi.currentMIDIPort;
    let enableMidi = midi !== undefined;

    let channel = this.root.data.MIDIChannel;

    let now = window.performance.now();
    let msTimeFromNow = timeFromNow * 1000;

    this.cursor++;

    // LOOP from end
    if (this.root.type === "INMARK" && this.root.data.playMode === "LOOP") {
      /* if we've reached the end then jump back to the beginning */
      if (this.cursor >= this.steps.length) {
        this.cursor = 1;
      }
    } else if (
      this.root.type === "INMARK" &&
      this.root.data.playMode === "ONESHOT"
    ) {
      /* if we've reached the end then stay there */
      if (this.cursor >= this.steps.length - 1) {
        this.cursor = this.steps.length - 1;
      }
    }

    let voices = this.steps[this.cursor];

    for (let i = 0; i < voices.length; i++) {
      let cell = voices[i];
      let synth = this.synthVoices[i];

      /* if there's no cell than terminate the previous note */
      if (!cell) {
        if (enableSound) synth.triggerRelease(timeFromNow / 2.0);
        if (enableMidi) {
          let prevMidiNote = synth._prevNote;
          if (!prevMidiNote) continue;

          // 0x80 is note off
          midi.send(
            [parseInt(0x80) + channel, prevMidiNote, 0],
            now + msTimeFromNow
          );
        }
        continue;
      }

      let note = cell.data.note;

      /* only trigger a note when the note is not flagged as rest or hold */
      if (note !== "REST" && note !== "HOLD") {
        let octave = cell.data.octave;
        let velocity = cell.data.velocity / 10; // 0 - 10
        let midiNote = note + 12 * (octave + 1);
        /* this helps with midi note off */
        synth._prevNote = note;

        /* if a note was previously playing at the current voice, release it */
        if (enableSound) {
          synth.triggerRelease(timeFromNow / 2.0);
          synth.triggerAttack(midiToFreq(midiNote), velocity, timeFromNow);
        }

        /* this is hacky and is resulting in some timing issues 
        also seems to be some kind of bottleneck*/
        if (enableMidi) {
          // 0x90 is noteOn
          midi.send(
            [parseInt(0x90) + channel, midiNote, velocity * 127],
            now + msTimeFromNow
          );

          let duration =
            window.transport.sixteenthNoteLength * cell.data.duration * 1000;

          // 0x80 is note off
          midi.send(
            [parseInt(0x80) + channel, midiNote, velocity * 127],
            now + msTimeFromNow + duration - 20
          );
        }
      }

      if (note === "REST") {
        if (enableSound) synth.triggerRelease(timeFromNow / 2.0);
        if (enableMidi) {
          let prevMidiNote = synth._prevNote;
          if (!prevMidiNote) continue;

          // 0x80 is note off
          midi.send(
            [parseInt(0x80) + channel, prevMidiNote, 0],
            now + msTimeFromNow
          );
        }
      }
    }
  }
}

export default Chain;
