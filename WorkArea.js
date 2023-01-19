/* eslint-disable */
import { Grid, Cell } from "./Grid.js";
import Chain from "./Chain.js";
import { uuidv4 } from "./Utilities.js";

class WorkArea extends Grid {
  constructor() {
    super("WORKAREA");
    let cnv = createCanvas(innerWidth, innerHeight);
    cnv.parent("workAreaContainer");

    this.chains = new Map();
    this.cell_size = 27;

    this.copiedCells = undefined;

    /* register event listeners */
    cnv.canvas.addEventListener("mousedown", (e) => this.handleClick(e));
    cnv.canvas.addEventListener("touchstart", (e) => this.handleTouch(e));
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  handleClick(e) {
    switch (window.toolbar.selectedTool) {
      /* edit is the default mode and it allows for adding nodes */
      case "EDIT":
        // left click
        if (e.button === 0) {
          /* handles things like selecting cells */

          if (window.palette.grid.selected_cell)
            this.addCell(
              window.palette.grid.selected_cell,
              this.cellCoordinate.x,
              this.cellCoordinate.y
            );

          this.handleExtend(e);

          if (!window.palette.grid.selected_cell) super.selectStart();
        }

        // remove on right click
        if (e.button === 2) {
          this.handleDragRemove(e);
        }

        break;
      /* select only allows for region selection */
      case "SELECT":
        super.selectStart();
        break;
      /* pan only allows for panning */
      case "PAN":
        this.handlePan(e);
        break;
      /* extend will create connections between nodes
      for note duration*/
      case "EXTEND":
        /* extend selected nodes */
        this.handleExtend(e);
        break;
    }

    //middle click
    if (e.button === 1) {
      /* middle click will pan by default */
      this.handlePan(e);

      /* the conditional below disables range selection */
    } else if (
      window.toolbar.selectedTool !== "EXTEND"
      // && window.toolbar.selectedTool !== "EDIT"
    ) {
      if (
        window.toolbar.selectedTool === "EDIT" &&
        window.palette.grid.selected_cell
      ) {
        /* otherwise all dragging will be treated as selection */
      } else {
        this.handleDrag(e);
      }
    }

    this.display();
  }

  handleTouch(e) {
    e.preventDefault();
    e.stopPropagation();

    /* start position is off without this */
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;

    switch (window.toolbar.selectedTool) {
      case "EDIT":
        // left click
        if (e.touches.length === 1) {
          /* handles things like selecting cells */
          super.selectStart();

          this.addCell(
            window.palette.grid.selected_cell,
            this.cellCoordinate.x,
            this.cellCoordinate.y
          );

          this.handleExtend(e);
        }
        // right click
        if (e.button === 2)
          this.removeCell(this.cellCoordinate.x, this.cellCoordinate.y);

        break;
      case "SELECT":
        /* handles things like selecting cells */
        super.selectStart();
        break;
      case "PAN":
        /* handles things like selecting cells */
        this.handlePan(e);
        break;
      /* extend will create connections between nodes
      for note duration*/
      case "EXTEND":
        /* extend selected nodes */
        this.handleExtend(e);
        break;
      default:
    }

    /* select with one finger */
    if (e.touches.length === 1 && window.toolbar.selectedTool !== "EDIT") {
      this.handleDrag(e);
    }

    /* pan with two fingers*/
    if (e.touches.length === 2) {
      this.handlePan(e);

      /* zoom */
      /* TODO decide whether or not to include any kind of zooming */
      // this.handlePinch(e);
    }

    this.display();
  }

  handleExtend(e) {
    e.preventDefault();
    e.stopPropagation();

    /* clear out selection */
    this._selected_cell_start = undefined;
    this._selected_cell_end = undefined;

    /* get initial cell to add to */
    let cx = this.cellCoordinate.x;
    let cy = this.cellCoordinate.y;
    let initialCell = this.getCell(cx, cy);

    let noteRoot = undefined;
    let left = initialCell;
    while (left) {
      /* if we encounter another hold note */
      if (left.type === "NOTE" && left.data.note === "HOLD") {
        left = this.getCell(left.position.x - 1, cy);
      } else if (left.type === "NOTE") {
        // the root node was found
        noteRoot = left;
        left = false;
      } else if (left.type === "INMARK") {
        /* 
          bail out if we hit an inmark,
          otherwise it's an infinite loop
        */
        left = false;
      }
    }

    initialCell = noteRoot;

    /* if there was no cell to start with don't extend */
    if (!initialCell) return;

    /* if the node is an inmark then ignore the rest */
    if (initialCell.type === "INMARK") return;

    /* store previous coordinate */
    let px = cx;
    let py = cy;

    /* make sure to draw smoothly while moving */
    window.shouldDraw = true;

    const handleMouseMove = () => {
      /* get horizontal coordinate as mouse moves */
      let cx = this.cellCoordinate.x;
      /* constrain vertically */
      let cy = initialCell.position.y;

      /* if the mouse is moving leftward... */
      if (cx < px) {
        /* do not create new holds */
        /* TODO instead remove duration */
      } else if (cx > px) {
        /* if horizontal coordinates change */
        /* get the difference just in case mouse was moving fast */
        let d_x = cx - px;

        /* loop through all cells to the right even if some have been skipped */
        for (let i = 1; i <= d_x; i++) {
          let cell = this.getCell(px + i, cy);

          /* if there is a cell already at the destination */
          if (cell) {
            /* remove whatever it is */
            this.removeCell(px + i, cy);
          }

          /* then go ahead and add a new hold cell */
          this.addCell(
            new Cell("H", { x: px + i, y: cy }, 0, this.id, "NOTE", {
              note: "HOLD",
            }),
            px + i,
            cy
          );

          /* and increment the duration of the initial cell */
          initialCell.data.duration++;
        }
      }

      px = cx;
      py = cy;
    };

    const handleMouseRelease = () => {
      window.shouldDraw = false;

      if (e.touches) {
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseRelease);
      } else {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseRelease);
      }
    };

    if (e.touches) {
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseRelease);
    } else {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseRelease);
    }
  }

  handleDragRemove(e) {
    this._selected_cell_start = undefined;
    this._selected_cell_end = undefined;

    window.shouldDraw = true;

    /* get initial cell to remove */
    let cx = this.cellCoordinate.x;
    let cy = this.cellCoordinate.y;

    this.removeCell(cx, cy);

    const handleMouseMove = () => {
      let cx = this.cellCoordinate.x;
      let cy = this.cellCoordinate.y;

      this.removeCell(cx, cy);
    };

    const handleMouseRelease = () => {
      window.shouldDraw = false;
      if (e.touches) {
        document.removeEventListener("touchmove", handleMouseMove);
        document.removeEventListener("touchend", handleMouseRelease);
      } else {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseRelease);
      }
    };

    if (e.touches) {
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseRelease);
    } else {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseRelease);
    }
  }

  serialize() {
    let this_copy = {
      ...this,
      cells: Array.from(this.cells.entries()),
      chains: Array.from(this.chains.entries()),
      /* remove copied cells from workarea */
      copiedCells: undefined,
    };

    /* remove all synths from chains */
    for (let chain of this_copy.chains) {
      chain[1] = { ...chain[1] };
      console.log("removing synths", chain);
      chain[1].synthVoices = [];
      chain[1].steps = [];
    }

    return JSON.stringify(this_copy);
  }

  saveToFile() {
    console.log("saving project");

    let src = this.serialize();
    let blob = new Blob([src], { type: "text/plain" });

    let link = document.createElement("a");
    link.download = `${new Date().toJSON().slice(0, 10)}_${uuidv4().substring(
      0,
      5
    )}.ggrid`;

    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked without actually adding it to the DOM.
      link.href = window.webkitURL.createObjectURL(blob);
    } else {
      // Firefox requires the link to be added to the DOM before it can be clicked.
      link.href = window.URL.createObjectURL(blob);
      link.onclick = (e) => {
        document.body.removeChild(e.target);
      };
      link.style.display = "none";
      document.body.appendChild(link);
    }

    link.click();
  }

  handleKeyDown(e) {
    /* remove selected cell from palate on escape*/
    if (e.code === "Escape") {
      window.palette.grid._selected_cell_start = undefined;
      window.palette.grid._selected_cell_end = undefined;
      window.palette.display();
    }

    /* testing serialization */
    if (e.code === "KeyS") {
      this.saveToFile();
    }

    /* navigate cells using arrow keys */
    if (!e.ctrlKey) {
      if (e.code === "ArrowUp") {
        if (e.shiftKey) {
          if (this._selected_cell_end.y > this._selected_cell_start.y)
            this._selected_cell_end.y -= 1;
        } else {
          this.selectEnd();
          this.pg.clear();
          this._selected_cell_start.y -= 1;
          this._selected_cell_end = { ...this._selected_cell_start };
        }
      }
      if (e.code === "ArrowDown") {
        if (e.shiftKey) {
          this._selected_cell_end.y += 1;
        } else {
          this.selectEnd();
          this.pg.clear();
          this._selected_cell_start.y += 1;
          this._selected_cell_end = { ...this._selected_cell_start };
        }
      }
      if (e.code === "ArrowLeft") {
        if (e.shiftKey) {
          if (this._selected_cell_end.x > this._selected_cell_start.x)
            this._selected_cell_end.x -= 1;
        } else {
          this.selectEnd();
          this.pg.clear();
          this._selected_cell_start.x -= 1;
          this._selected_cell_end = { ...this._selected_cell_start };
        }
      }
      if (e.code === "ArrowRight") {
        if (e.shiftKey) {
          this._selected_cell_end.x += 1;
        } else {
          this.selectEnd();
          this.pg.clear();
          this._selected_cell_start.x += 1;
          this._selected_cell_end = { ...this._selected_cell_start };
        }
      }
    }

    /* delete whatever selected cells on backspace */
    if (e.code === "Backspace") {
      /* delete all selected cells */
      for (let cell of this.selected_cells) {
        if (cell) {
          let cx = cell.position.x + this._selected_cell_start.x;
          let cy = cell.position.y + this._selected_cell_start.y;

          this.removeCell(cx, cy);
        }
      }
    }

    /* toggle play with spacebar */
    if (e.code === "Space") {
      if (!window.transport.isPlaying) {
        window.transport.handlePlayButton();
      } else {
        window.transport.handleStopButton();
      }
    }

    if (e.code === "KeyC" && e.ctrlKey) {
      this.copySelection();
    } else if (e.code === "KeyV" && e.ctrlKey) {
      this.pasteSelection();
    } else if (e.code === "KeyX" && e.ctrlKey) {
      this.cutSelection();
    }

    if (window.toolbar.selectedTool === "VELOCITY") {
      if (e.code === "ArrowUp") {
        for (let cell of this.selected_cells) {
          if (cell) {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            if (realCell.data.velocity < 9) {
              realCell.data.velocity++;
            }
          }
        }
      } else if (e.code === "ArrowDown") {
        for (let cell of this.selected_cells) {
          if (cell) {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            if (realCell.data.velocity > 0) {
              realCell.data.velocity--;
            }
          }
        }
      }

      /* make it possible to type in numbers for velocity */

      let allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (allNumbers.includes(Number(e.key))) {
       /* changed the velocity of the currently selected cells */
        for (let cell of this.selected_cells) {
          if (cell) {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            realCell.data.velocity = Number(e.key);
          }
        }
      }
    }

    if (window.toolbar.selectedTool === "OCTAVE") {
      if (e.code === "ArrowUp" && e.ctrlKey) {
        for (let cell of this.selected_cells) {
          if (cell) {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            if (realCell.data.octave < 9) {
              realCell.data.octave++;
            }
          }
        }
      } else if (e.code === "ArrowDown" && e.ctrlKey) {
        for (let cell of this.selected_cells) {
          if (cell) {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            if (realCell.data.octave > 0) {
              realCell.data.octave--;
            }
          }
        }
      }
      
      /* make it possible to type in numbers for octave */
      let allNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      if (allNumbers.includes(Number(e.key))) {
       /* changed the octave of the currently selected cells */
        for (let cell of this.selected_cells) {
          if (cell) {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            realCell.data.octave = Number(e.key);
          }
        }
      }
    }

    if (window.toolbar.selectedTool === "MIDICHANNEL") {
      if (e.code === "ArrowUp" && e.ctrlKey) {
        for (let cell of this.selected_cells) {
          if (cell && cell.type === "INMARK") {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            if (realCell.data.MIDIChannel < 15) {
              realCell.data.MIDIChannel++;
            }
          }
        }
      } else if (e.code === "ArrowDown" && e.ctrlKey) {
        for (let cell of this.selected_cells) {
          if (cell && cell.type === "INMARK") {
            /* the quirk here is that selected cells carry copies
            (something to do with the weird way that I'm copying and pasting)
            could be improved*/
            let cx = cell.position.x + this._selected_cell_start.x;
            let cy = cell.position.y + this._selected_cell_start.y;
            let realCell = this.getCell(cx, cy);

            if (realCell.data.MIDIChannel > 0) {
              realCell.data.MIDIChannel--;
            }
          }
        }
      }
    }

    this.display();
  }

  copySelection() {
    this.copiedCells = this.selected_cells;
  }

  pasteSelection() {
    for (let cell of this.copiedCells) {
      /* if the cell exists, clone it and add it to grid */
      if (cell) {
        /* each placed cell needs to be cloned */
        cell = cell.clone();
        /* shift the position of the cell to its destination */
        cell.position.x += this._selected_cell_start.x;
        cell.position.y += this._selected_cell_start.y;
        this.addCell(cell, cell.position.x, cell.position.y);
      }
    }
    this.display();
  }

  cutSelection() {
    this.copiedCells = this.selected_cells;

    /* remove all of the cells from their location */
    for (let cell of this.copiedCells) {
      if (cell) {
        this.removeCell(
          cell.position.x + this._selected_cell_start.x,
          cell.position.y + this._selected_cell_start.y
        );
      }
    }
    this.display();
  }

  deleteSelection() {
    /* remove all of the cells from their location */
    for (let cell of this.selected_cells) {
      if (cell) {
        this.removeCell(
          cell.position.x + this._selected_cell_start.x,
          cell.position.y + this._selected_cell_start.y
        );
      }
    }
    this.display();
  }

  addCell(cell, cx, cy) {
    /* if a cell is selected and ready to place */
    if (cell) {
      let cloned = cell.clone();
      cloned.position = { x: cx, y: cy };
      cloned.parentGridId = this.id;

      /*  
          then, get the surrounding cells,
          below we will adjust the duration of 
          neighboring held notes, and then all
          adjacent chains will be updated
        */

      let center = this.getCell(cx, cy);
      let left = this.getCell(cx - 1, cy);
      let right = this.getCell(cx + 1, cy);
      let north = this.getCell(cx, cy - 1);
      let south = this.getCell(cx, cy + 1);

      /*  
        if the cell that is being replaced is an inmark
        remove and fully disable the associated chain
      */
      if (center && center.type === "INMARK") {
        center.parentChain.releaseAndClear();
        this.chains.delete(center.position.x + "," + center.position.y);
      }

      /* 
          if there is a hold note to the right, center, or left, then
          we have interrupted a hold sequence. remove all
          hold notes to the right.
      
          first, scan leftward to find the root of the chain, 
          to update it's length afterwards
          
          once you find what the root of the chain is, use that to delete
          to the right
          
          Root ----- <-
          Root ------->
        */
      let rightIsHold =
        right && right.type === "NOTE" && right.data.note === "HOLD";
      let centerIsHold =
        center && center.type === "NOTE" && center.data.note === "HOLD";

      /* 
        if we're adding a node to the left of an existing hold 
        sever the chain and correct the duration of the root note
      */
      if (rightIsHold || centerIsHold) {
        console.log("hold to the right");
        // start at center, just in case we are clicking
        // on the rootnote itself.
        let left = this.getCell(cx, cy);

        let noteRoot = undefined;
        while (left) {
          /* if we encounter another hold note */
          if (left.type === "NOTE" && left.data.note === "HOLD") {
            left = this.getCell(left.position.x - 1, cy);
          } else if (left.type === "NOTE") {
            // the root node was found
            noteRoot = left;
            left = false;
          } else if (left.type === "INMARK") {
            /* 
                bail out if we hit an inmark,
                otherwise it's an infinite loop
              */
            left = false;
          }
        }

        if (centerIsHold) noteRoot.data.duration--;

        /* then, remove all HOLD notes to the right */
        let right = this.getCell(cx + 1, cy);

        while (right) {
          /* if we encounter another hold note */
          if (right.type === "NOTE" && right.data.note === "HOLD") {
            /* delete it, and keep checking rightward */
            this.cells.delete(right.position.x + "," + right.position.y);
            /* remove it from the chain */
            if (right.parentChain) right.parentChain.removeFromChain(right);
            noteRoot.data.duration--;
            right = this.getCell(right.position.x + 1, cy);
          } else {
            right = false;
          }
        }
      }

      /* add the cell to the grid */
      this.cells.set(cx + "," + cy, cloned);

      /* 
        if this new cell is an inmark,
        then a new chain will be defined
        and assembled
        
        otherwise the surrounding cells 
        will be checked
      */

      if (cloned.type === "INMARK") {
        /* add the cell to the grid */
        let chain = new Chain(cx + "," + cy, cloned);
        chain.assemble();
        cloned.parentChainId = chain.id;
        this.chains.set(cx + "," + cy, chain);

        /* automatically increment the channel number for a given inmark */
        /* loop through all existing chains, find the max MIDIChannel */
        let maxCh = 0;
        for (let chain of this.chains) {
          chain = chain[1];
          if (chain.root.data.MIDIChannel > maxCh) {
            maxCh = chain.root.data.MIDIChannel;
          }
        }

        if (this.chains.size > 1) chain.root.data.MIDIChannel = maxCh + 1;
      }

      /* if neighboring node exists then add it to its chain */
      if (left && left.parentChain) {
        left.parentChain.assemble(left);
      } else if (north && north.parentChain) {
        north.parentChain.assemble(north);
      } else if (south && south.parentChain) {
        south.parentChain.assemble(south);
      } else if (right && right.parentChain) {
        right.parentChain.assemble(right);
      }

      this.display();
    }
  }

  removeCell(cx, cy) {
    let cell = this.getCell(cx, cy);

    if (cell) {
      /* if deleting an inmark, delete the chain as well */
      if (cell.type === "INMARK") {
        cell.parentChain.releaseAndClear();
        this.chains.delete(cell.position.x + "," + cell.position.y);
      }

      /* 
        if a hold note is being deleted...
        
        delete it and all hold notes to the right
        and adjust the duration of the root note
        accordingly
      */
      if (cell.data.note === "HOLD") {
        /* trace leftward */
        let left = this.getCell(cx, cy);

        /* what note does this hold belong to? */
        let noteRoot = undefined;
        while (left) {
          /* if we encounter another hold note */
          if (left.data.note === "HOLD") {
            /* keep looking to the left */
            left = this.getCell(left.position.x - 1, cy);
          } else if (left.type === "NOTE") {
            /* the root node was found, stop seeking */
            noteRoot = left;
            left = false;
          }
        }

        /* 
          then, scan rightward...
          remove all HOLD notes to the right 
        */
        let right = this.getCell(cx + 1, cy);

        while (right) {
          /* if we encounter another hold note */
          if (right.data.note === "HOLD") {
            /* delete it, and keep checking rightward */
            this.cells.delete(right.position.x + "," + right.position.y);
            noteRoot.data.duration--;
            right = this.getCell(right.position.x + 1, cy);
          } else {
            right = false;
          }
        }

        /* now reduce the duration by one */
        noteRoot.data.duration--;
      } else if (cell.type === "NOTE") {
        /* otherwise if we're removing a note, 
        remove all hold notes to the right of it,
        if they exist*/

        let right = this.getCell(cx + 1, cy);

        while (right) {
          /* if we encounter another hold note */
          if (right.data.note === "HOLD") {
            /* delete it, and keep checking rightward */
            this.cells.delete(right.position.x + "," + right.position.y);
            right = this.getCell(right.position.x + 1, cy);
          } else {
            right = false;
          }
        }
      }

      /* now delete the cell */
      this.cells.delete(cell.position.x + "," + cell.position.y);
      if (cell.parentChain) cell.parentChain.removeFromChain(cell);

      this.display();
    }
  }

  display() {
    this.pg.background(255);

    /* another heavy process */
    this.drawGrid();

    this.pg.push();
    this.pg.strokeWeight(window.ui.chainStrokeWeight);
    /* draw chains */
    for (let chain of this.chains.values()) {
      let i = 0;
      for (let step_array of chain.steps) {
        for (let cell of step_array) {
          if (!cell) continue;
          this.pg.push();
          /* draw chain outlines */
          if (chain.cursor === i) {
            this.pg.stroke(color(window.ui.chainSelectedColor));
          } else {
            this.pg.stroke(color(window.ui.chainStrokeColor));
          }
          this.pg.rect(
            cell.position.x * this.cell_size +
              this.pan_position.x -
              window.ui.chainStrokeWeight / 2 / 2,
            cell.position.y * this.cell_size +
              this.pan_position.y -
              window.ui.chainStrokeWeight / 2 / 2,
            this.cell_size + window.ui.chainStrokeWeight / 2
          );
          this.pg.pop();
        }
        i++;
      }
    }

    this.pg.pop();

    this.drawCells();

    this.drawSelection();

    /* one of the heavier processes  */
    image(this.pg, this.anchor_position.x, this.anchor_position.y);
  }

  drawCells() {
    /* draw cells */
    this.cells.forEach((v, k) => {
      switch (window.toolbar.selectedTool) {
        case "EDIT":
          v.display();
          break;
        case "SELECT":
          v.display();
          break;
        case "PAN":
          v.display();
          break;
        case "VELOCITY":
          v.displayVelocity();
          break;
        case "OCTAVE":
          v.displayOctave();
          break;
        case "EXTEND":
          v.display();
          break;
        case "MIDICHANNEL":
          v.displayMIDIChannel();
          break;
        default:
      }
    });
  }
}

export default WorkArea;
