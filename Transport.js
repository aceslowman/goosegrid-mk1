/* eslint-disable */
import FloatingPanel from "./FloatingPanel.js";

/*  
  Transport is responsible for playing, pausing, bpm change,
  and it also holds the p5.SoundLoop that actually calls the 
  synthesizers. This is useful because it comes with a 
  timeFromNow value.
*/

class Transport {
  constructor() {
    /* this element and others rely on some html */
    this.ele = document.querySelector("#transport");

    /* transport settings */
    this.isPlaying = false;
    this.isMuted = false;
    this.bpm = 120;

    /* bars.beats.sixteenths */
    this.bars = 1;
    this.beats = 1;
    this.sixteenths = 1;

    /* sound loop is preferable to set interval because 
    it provides a timeFromNow value in the callback
    with that said it still does have timing issues*/
    this.soundLoop = new p5.SoundLoop((t) => {
      if (this.isPlaying) this.stepForward(t);
    }, "16n");
    this.soundLoop.bpm = this.bpm;
    this.soundLoop.start();

    /* register event listeners */
    document
      .querySelector("#transportPlayButton")
      .addEventListener("click", () => this.handlePlayButton());
    document
      .querySelector("#transportStopButton")
      .addEventListener("click", () => this.handleStopButton());
    document
      .querySelector("#transportBPMInput")
      .addEventListener("input", (e) => this.handleBPMInput(e));
    document
      .querySelector("#toggleMute button")
      .addEventListener("click", (e) => this.handleMute(e));
  }

  get sixteenthNoteLength() {
    let quarterNoteLength = 60 / this.bpm;
    return quarterNoteLength / 4;
  }

  stepForward(timeFromNow) {
    if (!this.isPlaying) return;

    /* update transport position */
    this.sixteenths = (this.sixteenths % 4) + 1;

    if (this.sixteenths === 1) {
      this.beats = (this.beats % 4) + 1;

      if (this.beats === 1) {
        this.bars += 1;
      }
    }

    /* loop through all chains and playback */
    for (let chain of window.workArea.chains.values()) {
      chain.play(timeFromNow);
    }

    /* refresh display */
    this.updateDisplay();
    window.workArea.display();
  }

  updateDisplay() {
    document.querySelector("#transportPlayButton").style.backgroundColor = this
      .isPlaying
      ? "rgb(52, 203, 55)"
      : "rgb(240, 240, 240)";
    document.querySelector("#transportPlayButton").style.color = this.isPlaying
      ? "white"
      : "black";
    // document.querySelector(
    //   "#transportPosition"
    // ).innerHTML = `${this.bars}.${this.beats}.${this.sixteenths}`;
  }

  handlePlayButton() {
    this.isPlaying = true;
    window.workArea.chains.forEach((chain) => {
      let channel = chain.root.data.MIDIChannel;
      chain.synthVoices.forEach((synth) => {
        synth.amp(1.0, 0.1);
      });
    });
    /* refresh display */
    this.updateDisplay();
  }

  handleStopButton() {
    /* if it was already paused then return markers to beginning */
    if (this.isPlaying === false) {
      /* reset transport */
      this.bars = 1;
      this.beats = 1;
      this.sixteenths = 1;
    }

    window.workArea.chains.forEach((chain) => {
      let channel = chain.root.data.MIDIChannel;
      chain.synthVoices.forEach((synth) => {
        if (!this.isPlaying) {
          /* jump back to start */
          chain.cursor = 0;
        }

        /* 
          delay the release by a moment to prevent the synth from
          retriggering
          
          TODO triggering twice is a little hacky
        */
        synth.triggerRelease(0.1);
        synth.triggerRelease(0.4);
        synth.amp(0.0, 0.2);
        // all notes off
        if (window.midi.currentMIDIPort !== undefined) {
          window.midi.currentMIDIPort.send([
            parseInt(0xb0),
            parseInt(0x7b),
            channel,
          ]);
        }
      });
    });

    this.isPlaying = false;
    this.updateDisplay();

    /* refresh display */
    window.workArea.display();
  }

  handleBPMInput(e) {
    this.bpm = Number(e.target.value);
    this.soundLoop.bpm = this.bpm;
    this.soundLoop.interval = "16n";
  }

  handleMute(e) {
    this.isMuted = !this.isMuted;

    window.workArea.chains.forEach((chain) => {
      let channel = chain.root.data.MIDIChannel;
      chain.synthVoices.forEach((synth) => {
        synth.triggerRelease(0.4);
        synth.amp(this.isMuted ? 0.0 : 1, 0.1);
        // all notes off
        window.midi.currentMIDIPort.send([
          parseInt(0xb0),
          parseInt(0x7b),
          channel,
        ]);
      });
    });

    if (this.isMuted) {
      document
        .querySelector("#toggleMute button")
        .classList.add("squareButtonActive");
      document.querySelector("#toggleMute button").innerHTML = `<img src="icons/Muted.webp" alt="the icon representing Muted" />`;
    } else {
      document
        .querySelector("#toggleMute button")
        .classList.remove("squareButtonActive");
      document.querySelector("#toggleMute button").innerHTML = `<img src="icons/Umuted.webp" alt="the icon representing Muted" />`;
    }

    /* remember mute */
    localStorage.setItem("isMuted", this.isMuted);

    /* refresh display */
    window.workArea.display();
  }
}

export default Transport;
