/* eslint-disable */
import WorkArea from "./WorkArea.js";
import Transport from "./Transport.js";
import Palette from "./Palette.js";
import Toolbar from "./Toolbar.js";
import Chain from "./Chain.js";
import { Grid, Cell } from "./Grid.js";

/*  
  NOTES ABOUT HOW THIS WORKS
  
  ggrid is split up into separate parts
  
  the work area is where cells are placed and it
  inherits from 'Grid', which handles some shared 
  logic between the Palette and the WorkArea
  
  the palette is where you can select cells that 
  can be placed on the work area grid
  
  for performance I'm only drawing to the screen 
  when something changes, and to get around some
  issues with using mousemove
*/

window.debugGrid = false;

let showHelp = false;
let showSettings = false;

/* boosts performance */
p5.disableFriendlyErrors = true;

const toggleHelp = () => {
  showHelp = !showHelp;

  if (showHelp) {
    document
      .querySelector("#toggleHelp button")
      .classList.add("squareButtonActive");
    document.querySelector("#help").style.display = "block";
  } else {
    document
      .querySelector("#toggleHelp button")
      .classList.remove("squareButtonActive");
    document.querySelector("#help").style.display = "none";
  }
};

const toggleSettings = () => {
  showSettings = !showSettings;

  if (showSettings) {
    document
      .querySelector("#toggleSettings button")
      .classList.add("squareButtonActive");
    document.querySelector("#settings").style.display = "block";
  } else {
    document
      .querySelector("#toggleSettings button")
      .classList.remove("squareButtonActive");
    document.querySelector("#settings").style.display = "none";
  }
};

const loadFromFile = () => {
  let link = document.createElement("input");
  link.type = "file";

  link.onchange = (e) => {
    var file = e.target.files[0];

    let reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = (e) => {
      let content = JSON.parse(e.target.result);
      content.cells = new Map(content.cells);
      /* all cells need to be actually turned into Cell objects */
      for (let cell of content.cells) {
        content.cells.set(
          cell[0],
          Object.assign(new Cell("", {}, "", "", "", {}), cell[1])
        );
      }

      /* all chains also need to be turned into proper chain objects */
      content.chains = new Map(content.chains);
      for (let chain of content.chains) {
        let r = content.cells.get(
          chain[1].root.position.x + "," + chain[1].root.position.y
        );
        content.chains.set(
          chain[0],
          Object.assign(new Chain(chain[1].id, r), chain[1])
        );
        content.chains.get(chain[0]).setupSynths();
      }

      /* fit the json data to this class */
      content = Object.assign(new WorkArea(), content);
      window.grids[content.id] = content;

      window.workArea = content;

      for (let chain of window.workArea.chains) {
        chain = chain[1];
        chain.assemble();
      }

      window.workArea.display();
    };
  };

  link.click();
};

const saveToFile = () => {
  window.workArea.saveToFile();
};

const handleCellSizeInput = (e) => {
  window.workArea.cell_size = Number(e.target.value);
  window.palette.grid.cell_size = Number(e.target.value);

  localStorage.setItem("cell_size", Number(e.target.value));

  window.pgs["PALETTE"].canvas.width = 8 * Number(e.target.value);
  window.pgs["PALETTE"].canvas.height = 7 * Number(e.target.value);
  window.pgs["PALETTE"].canvas.style.width = 8 * Number(e.target.value) + "px";
  window.pgs["PALETTE"].canvas.style.height = 7 * Number(e.target.value) + "px";

  document.getElementById("palette").style.width =
    8 * Number(e.target.value) + "px";
  document.getElementById("palette").style.height =
    7 * Number(e.target.value) + "px";

  window.palette.anchor_position = {
    x: Number(e.target.value),
    y: Number(e.target.value),
  };

  window.palette.ele.style.top = window.palette.anchor_position.y + "px";
  window.palette.ele.style.left = window.palette.anchor_position.x + "px";

  /* update the size and position of the toolbar */

  let btns = document.querySelectorAll(".squareButton");

  for (let btn of btns) {
    btn.style.width = Number(e.target.value) + "px";
    btn.style.height = Number(e.target.value) + "px";
  }

  let dh = document.querySelectorAll(".dragHandle");

  for (let btn of dh) {
    btn.style.width = Number(e.target.value) + "px";
    btn.style.height = Number(e.target.value) + "px";
    btn.style.top = -Number(e.target.value) + "px";
    btn.style.left = -Number(e.target.value) + "px";
  }

  // document.querySelector("#info").style.height = Number(e.target.value) + "px";

  window.palette.display();
  window.workArea.display();
};

/* set up webmidi */
window.midi = {
  currentMIDIPort: undefined,
  inputs: {},
  outputs: {},
};

const initializeMIDI = async () => {
  await navigator.requestMIDIAccess().then((access) => {
    // Get lists of available MIDI controllers

    for (const input of access.inputs.values()) {
      window.midi.inputs = {
        ...window.midi.inputs,
        [input.name]: input,
      };
    }

    for (const output of access.outputs.values()) {
      /* loop through all possible outputs and list them in the select element */

      let newOption = document.createElement("option");
      newOption.text = output.name;
      newOption.value = output.name;

      document.querySelector("#MIDIOutputSelect").appendChild(newOption);

      window.midi.outputs = {
        ...window.midi.outputs,
        [output.name]: output,
      };
    }

    /* get the previously selected midi output, if it exists */
    if (
      window.localStorage.getItem("selected_midi_output") &&
      window.midi.outputs[window.localStorage.getItem("selected_midi_output")]
    ) {
      window.midi.currentMIDIPort =
        window.midi.outputs[
          window.localStorage.getItem("selected_midi_output")
        ];
    } else {
      window.midi.currentMIDIPort =
        window.midi.outputs[Object.keys(window.midi.outputs)[0]];
      window.localStorage.setItem(
        "selected_midi_output",
        Object.keys(window.midi.outputs)[0]
      );
    }

    /* update the select inputb */
    if (window.midi.currentMIDIPort) {
      document.querySelector("#MIDIOutputSelect").value =
        window.midi.currentMIDIPort.name;
    }

    access.onstatechange = function (e) {
      // Print information about the (dis)connected MIDI controller
      console.log(e.port.name, e.port.manufacturer, e.port.state);
      /* TODO if a new midi port has been added or removed the select input */
    };
  });
};

initializeMIDI();

const handleMIDIOutputSelect = (e) => {
  console.log(window.midi);
  let output_id = e.target.value;
  /* clear all notes before changing ports */
  transport.handleStopButton();
  transport.handleStopButton();

  midi.currentMIDIPort = window.midi.outputs[output_id];

  window.localStorage.setItem("selected_midi_output", output_id);
};

window.ui = {
  chainStrokeWeight: 6,
  chainStrokeColor: "purple",
  chainSelectedColor: "yellow",
  grid_line_color: 75,
  selected_cell_color: "blue",
};

window.preload = () => {
  let filetype = ".webp";
  window.icons = {
    kick1: loadImage("icons/Kick1" + filetype),
    kick2: loadImage("icons/Kick2" + filetype),
    snare1: loadImage("icons/Snare1" + filetype),
    snare2: loadImage("icons/Snare2" + filetype),
    clap: loadImage("icons/Clap" + filetype),
    crash: loadImage("icons/Crash" + filetype),
    ride: loadImage("icons/Ride" + filetype),
    lowtom1: loadImage("icons/LowTom1" + filetype),
    lowtom2: loadImage("icons/LowTom2" + filetype),
    hightom1: loadImage("icons/HighTom1" + filetype),
    hightom2: loadImage("icons/HighTom2" + filetype),
    lmTom: loadImage("icons/LMTom" + filetype),
    hmTom: loadImage("icons/HMTom" + filetype),
    hhOpen: loadImage("icons/HiHatOpen" + filetype),
    hhClosed: loadImage("icons/HiHatClosed" + filetype),
    hhPedal: loadImage("icons/HiHatPedal" + filetype),
    rim: loadImage("icons/Rim" + filetype),
    loop: loadImage("icons/Loop" + filetype),
  };
};

window.setup = () => {
  colorMode(HSB);

  window.pgs = {
    WORKAREA: createGraphics(innerWidth, innerHeight), // grid size
    WORKAREA_GRID: createGraphics(innerWidth, innerHeight), // grid size
    PALETTE: createGraphics(275, 175), // palette size
  };

  window.midi = midi;
  window.grids = {};

  window.palette = new Palette();
  window.transport = new Transport();
  window.workArea = new WorkArea();

  window.toolbar = new Toolbar();

  /* remembers cell size */
  if (localStorage.getItem("cell_size")) {
    /* if cell size exists */
    handleCellSizeInput({
      target: { value: localStorage.getItem("cell_size") },
    });
  }

  /* remember mute */
  if (localStorage.getItem("isMuted")) {
    /* if cell size exists */

    window.transport.isMuted = localStorage.getItem("isMuted");
    if (window.transport.isMuted) {
      document
        .querySelector("#toggleMute button")
        .classList.add("squareButtonActive");
      document.querySelector("#toggleMute button").innerHTML = `<img src="icons/Muted.webp" alt="the icon representing Muted" />`;
    } else {
      document
        .querySelector("#toggleMute button")
        .classList.remove("squareButtonActive");
      document.querySelector("#toggleMute button").innerHTML = `<img src="icons/Unmuted.webp" alt="the icon representing Muted" />`;
    }
  }

  document.querySelector(".loading").style.display = "none";
  document.querySelector("#CellSizeInput").value = window.workArea.cell_size;

  background(255);
  window.workArea.display();
  window.palette.display();
};

window.shouldDraw = false;
window.draw = () => {
  if (window.shouldDraw) {
    background(255);
    image(window.pgs.WORKAREA_GRID, 0, 0);
    window.workArea.display();
    window.palette.display();
  }
};

window.windowResized = () => {
  resizeCanvas(innerWidth, innerHeight);
  if (window.pgs["WORKAREA"]) {
    /* remove it first! */
    window.pgs["WORKAREA"].remove();
    window.pgs["WORKAREA"] = createGraphics(innerWidth, innerHeight);
    window.workArea.display();
  }
};

window.mousePressed = (e) => {
  userStartAudio();
};

/* ----------------------LISTENERS---------------------------- */

/* bring up settings */
document
  .querySelector("#toggleSettings button")
  .addEventListener("click", toggleSettings);

/* bring up help text */
document
  .querySelector("#toggleHelp button")
  .addEventListener("click", toggleHelp);

/* load from text file */
document
  .querySelector("#loadFile button")
  .addEventListener("click", loadFromFile);

/* save to text file */
document
  .querySelector("#saveFile button")
  .addEventListener("click", saveToFile);

/* change the cell size */
document
  .querySelector("#CellSizeInput")
  .addEventListener("change", handleCellSizeInput);

/* whenever a midi output is selected, update */
document
  .querySelector("#MIDIOutputSelect")
  .addEventListener("input", handleMIDIOutputSelect);

/* disable right click for context menu */
document.addEventListener("contextmenu", (e) => e.preventDefault());
