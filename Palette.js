/* eslint-disable */
import FloatingPanel from "./FloatingPanel.js";
import { Grid, Cell } from "./Grid.js";

class Palette extends FloatingPanel {
  constructor() {
    super(25, 25, "#palette");

    this.grid = new Grid("PALETTE");
    this.grid.cell_size = 25;
    this.grid.anchor_position = this.anchor_position;

    let icons = window.icons
    
    /* fill cells with prototype cells */
    this.grid.cells.set(
      "0,0",
      new Cell({icon_name: 'loop'}, { x: 0, y: 0 }, {bg:"red",txt:"white"}, this.grid.id, "INMARK", {
        playMode: "LOOP",
        MIDIChannel: 0,
      })
    );
    // this.grid.cells.set(
    //   "1,0",
    //   new Cell("➔", { x: 1, y: 0 }, "violet", this.grid, "INMARK", {
    //     playMode: "ONESHOT",
    //     MIDIChannel: 0,
    //   })
    // );

    /* rest cell */
    this.grid.cells.set(
      "6,0",
      new Cell("𝄽", { x: 6, y: 0 }, {bg:"orange",txt:"white"}, this.grid.id, "NOTE", {
        note: "REST",
        duration: 1,
      })
    );
    

    let c0 = {bg:70,txt:"white"};
    let c1 = {bg:30,txt:"white"};
    let c2 = {bg:90,txt:"white"};
    this.grid.cells.set(
      "0,3",
      new Cell("C", { x: 0, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 0,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "0,2",
      new Cell("C#", { x: 0, y: 2 }, c1, this.grid.id, "NOTE", {
        note: 1,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "1,3",
      new Cell("D", { x: 1, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 2,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "1,2",
      new Cell("D#", { x: 1, y: 2 }, c1, this.grid.id, "NOTE", {
        note: 3,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "2,3",
      new Cell("E", { x: 2, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 4,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "3,3",
      new Cell("F", { x: 3, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 5,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "3,2",
      new Cell("F#", { x: 3, y: 2 }, c1, this.grid.id, "NOTE", {
        note: 6,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "4,3",
      new Cell("G", { x: 4, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 7,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );

    this.grid.cells.set(
      "4,2",
      new Cell("G#", { x: 4, y: 2 }, c1, this.grid.id, "NOTE", {
        note: 8,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "5,3",
      new Cell("A", { x: 5, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 9,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "5,2",
      new Cell("A#", { x: 5, y: 2 }, c1, this.grid.id, "NOTE", {
        note: 10,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "6,3",
      new Cell("B", { x: 6, y: 3 }, c0, this.grid.id, "NOTE", {
        note: 11,
        octave: 4,
        velocity: 5,
        duration: 1,
      })
    );

    /* NUMBERS */
    // this.grid.cells.set(
    //   "8,0",
    //   new Cell("1", { x: 8, y: 0 }, c0, this.grid.id, "DATA", {
    //     value: 1,
    //   })
    // );
    // this.grid.cells.set(
    //   "9,0",
    //   new Cell("2", { x: 9, y: 0 }, c0, this.grid.id, "DATA", {
    //     value: 2,
    //   })
    // );
    // this.grid.cells.set(
    //   "10,0",
    //   new Cell("3", { x: 10, y: 0 }, c0, this.grid.id, "DATA", {
    //     value: 3,
    //   })
    // );
    // this.grid.cells.set(
    //   "8,1",
    //   new Cell("4", { x: 8, y: 1 }, c0, this.grid.id, "DATA", {
    //     value: 4,
    //   })
    // );
    // this.grid.cells.set(
    //   "9,1",
    //   new Cell("5", { x: 9, y: 1 }, c0, this.grid.id, "DATA", {
    //     value: 5,
    //   })
    // );
    // this.grid.cells.set(
    //   "10,1",
    //   new Cell("6", { x: 10, y: 1 }, c0, this.grid.id, "DATA", {
    //     value: 6,
    //   })
    // );
    // this.grid.cells.set(
    //   "8,2",
    //   new Cell("7", { x: 8, y: 2 }, c0, this.grid.id, "DATA", {
    //     value: 7,
    //   })
    // );
    // this.grid.cells.set(
    //   "9,2",
    //   new Cell("8", { x: 9, y: 2 }, c0, this.grid.id, "DATA", {
    //     value: 8,
    //   })
    // );
    // this.grid.cells.set(
    //   "10,2",
    //   new Cell("9", { x: 10, y: 2 }, c0, this.grid.id, "DATA", {
    //     value: 9,
    //   })
    // );
    // this.grid.cells.set(
    //   "9,3",
    //   new Cell("0", { x: 9, y: 3 }, c0, this.grid.id, "DATA", {
    //     value: 0,
    //   })
    // );
    
    /* PERCUSSION */
    this.grid.cells.set(
      "0,5",
      new Cell({icon_name: 'kick1'}, { x: 0, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 0,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "1,5",
      new Cell({icon_name: 'rim'}, { x: 1, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 1,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "2,5",
      new Cell({icon_name: 'snare1'}, { x: 2, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 2,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "3,5",
      new Cell({icon_name: 'clap'}, { x: 3, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 3,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
      this.grid.cells.set(
      "4,5",
      new Cell({icon_name: 'snare2'}, { x: 4, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 4,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "5,5",
      new Cell({icon_name: 'lowtom1'}, { x: 5, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 5,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "6,5",
      new Cell({icon_name: 'hhClosed'}, { x: 6, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 6,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "7,5",
      new Cell({icon_name: 'hightom1'}, { x: 7, y: 5 }, c2, this.grid.id, "NOTE", {
        note: 7,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "0,6",
      new Cell({icon_name: 'hhPedal'}, { x: 0, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 8,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );

    this.grid.cells.set(
      "1,6",
      new Cell({icon_name: 'lowtom2'}, { x: 1, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 9,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "2,6",
      new Cell({icon_name: 'hhOpen'}, { x: 2, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 10,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "3,6",
      new Cell({icon_name: 'lmTom'}, { x: 3, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 10,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "4,6",
      new Cell({icon_name: 'hmTom'}, { x: 4, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 11,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
        this.grid.cells.set(
      "5,6",
      new Cell({icon_name: 'crash'}, { x: 5, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 12,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "6,6",
      new Cell({icon_name: 'hightom2'}, { x: 6, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 13,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );
    this.grid.cells.set(
      "7,6",
      new Cell({icon_name: 'ride'}, { x: 7, y: 6 }, c2, this.grid.id, "NOTE", {
        note: 14,
        octave: 2,
        velocity: 5,
        duration: 1,
      })
    );

    this.ele.style.width = this.grid.pg.width + "px";
    this.ele.style.height = this.grid.pg.height + "px";

    this.grid.pg.parent("palette");

    document
      .querySelector("#palette")
      .addEventListener("click", (e) => this.handleClick(e));
  }

  handleClick(e) {
    /* if the palate is clicked then we should jump 
    back to the edit mode unless we're in octave or 
    velocity mode */
    if (
      window.toolbar.selectedTool !== "EDIT" &&
      window.toolbar.selectedTool !== "OCTAVE" &&
      window.toolbar.selectedTool !== "VELOCITY"
    ) {
      window.toolbar.handleEdit();
    }
    this.grid.selectStart();
    
    this.display()
  }

  handleDrag(e) {
    super.handleDrag(e);

    this.grid.anchor_position = this.anchor_position;
  }

  display() {
    this.grid.pg.background(255);

    this.grid.drawGrid();
    this.grid.drawCells();
    this.grid.drawSelection();
  }
}

export default Palette;