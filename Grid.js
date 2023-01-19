/* eslint-disable */
import { uuidv4, pairing } from "./Utilities.js";

class Grid {
  constructor(pg_id) {
    this.id = uuidv4();
    window.grids[this.id] = this;
    this.pg_id = pg_id;

    this.anchor_position = { x: 0, y: 0 };
    this.pan_position = { x: 0, y: 0 };

    this.cell_size = 35;
    /* a map using an integer key should be faster than an array */
    this.cells = new Map();

    // used by grid to return selected cell
    this._selected_cell_start = undefined;
    this._selected_cell_end = undefined;
  }

  get pg() {
    return window.pgs[this.pg_id];
  }

  get selected_cell() {
    if (this._selected_cell_start) {
      return this.getCell(
        this._selected_cell_start.x,
        this._selected_cell_start.y
      );
    }
  }

  get selected_cells() {
    let arr = [];

    if (this._selected_cell_start && this._selected_cell_end) {
      /* loop through entire range */
      /* flip if the range is backwards */
      let t_start = { ...this._selected_cell_start };
      let start = this._selected_cell_start;
      let t_end = { ...this._selected_cell_end };
      let end = this._selected_cell_end;

      /* it makes it possible to delay selection backwards */
      if (t_start.x > t_end.x) {
        start.x = t_end.x + 1;
        end.x = t_start.x - 1;
      }

      if (t_start.y > t_end.y) {
        start.y = t_end.y + 1;
        end.y = t_start.y - 1;
      }

      let cellDiff = {
        x: end.x - start.x,
        y: end.y - start.y,
      };

      for (let x = 0; x <= cellDiff.x; x++) {
        for (let y = 0; y <= cellDiff.y; y++) {
          let idx = {
            x: start.x + x,
            y: start.y + y,
          };
          let cell = this.getCell(idx.x, idx.y);
          if (cell) {
            /* copy this so it doesn't affect the nodes that are already there */
            cell = cell.clone();
            cell.position.x = x;
            cell.position.y = y;
          }
          arr.push(cell);
        }
      }
    }

    return arr;
  }

  getCell(_x, _y) {
    return this.cells.get(_x + "," + _y);
  }

  get cellCoordinate() {
    return {
      x: Math.floor(
        (mouseX - (this.anchor_position.x + this.pan_position.x)) /
          this.cell_size
      ),
      y: Math.floor(
        (mouseY - (this.anchor_position.y + this.pan_position.y)) /
          this.cell_size
      ),
    };
  }

  drawGrid() {
    this.pg.push();
    this.pg.translate(
      this.pan_position.x % this.cell_size,
      this.pan_position.y % this.cell_size
    );
    this.pg.stroke(color(window.ui.grid_line_color));
    this.pg.strokeWeight(1);
    for (let i = 0; i <= width / this.cell_size + 1; i++) {
      let s = i * this.cell_size;
      this.pg.line(s, -this.cell_size, s, height + this.cell_size);
      for (let j = 0; j <= height / this.cell_size + 1; j++) {
        s = j * this.cell_size;
        this.pg.line(-this.cell_size, s, width + this.cell_size, s);
      }
    }
    this.pg.pop();
  }

  drawCells() {
    /* draw cells */
    this.cells.forEach((v, k) => {
      v.display();
    });
  }

  drawSelection() {
    /* highlight all selected cells from start to end */
    if (this._selected_cell_start) {
      this.pg.push();
      this.pg.translate(this.pan_position.x, this.pan_position.y);
      this.pg.noFill();
      this.pg.strokeWeight(3);
      this.pg.stroke(color(window.ui.selected_cell_color));
      if (this._selected_cell_end) {
        this.pg.rect(
          this._selected_cell_start.x * this.cell_size,
          this._selected_cell_start.y * this.cell_size,
          (this._selected_cell_end.x - (this._selected_cell_start.x - 1)) *
            this.cell_size,
          (this._selected_cell_end.y - (this._selected_cell_start.y - 1)) *
            this.cell_size
        );
      } else {
        this.pg.rect(
          this._selected_cell_pos.x * this.cell_size,
          this._selected_cell_pos.y * this.cell_size,
          this.cell_size
        );
      }

      this.pg.pop();
    }
  }

  display() {
    image(this.pg, this.anchor_position.x, this.anchor_position.y);
  }

  handlePan(e) {
    e.preventDefault();
    e.stopPropagation();

    let initialPosition = { x: mouseX, y: mouseY };
    let initialPan = { ...this.pan_position };

    window.shouldDraw = true;

    /* set cursor style */
    document.querySelector("#workAreaContainer").style.cursor = "all-scroll";

    const handleMouseMove = () => {
      this.pan_position.x = initialPan.x + mouseX - initialPosition.x;
      this.pan_position.y = initialPan.y + mouseY - initialPosition.y;
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

      document.querySelector("#workAreaContainer").style.cursor = "default";
    };

    if (e.touches) {
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseRelease);
    } else {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseRelease);
    }
  }

  handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    this.selectStart();
    window.shouldDraw = true;

    const handleMouseMove = () => {
      this.selectEnd();
    };

    const handleMouseRelease = () => {
      this.selectEnd();
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

  selectStart() {
    /* clear out ending selection each time */
    this.selectEnd();
    this.pg.clear();
    let cx = this.cellCoordinate.x;
    let cy = this.cellCoordinate.y;
    this._selected_cell_start = { x: cx, y: cy };
  }

  selectEnd() {
    this.pg.clear();
    let cx = this.cellCoordinate.x;
    let cy = this.cellCoordinate.y;
    this._selected_cell_end = { x: cx, y: cy };
  }
}

class Cell {
  constructor(
    _label,
    _position,
    _color,
    _parentGridId,
    _type = "NOTE",
    _data = {},
    _parentChainId = undefined
  ) {
    this.label = _label;
    this.position = _position;
    this.parentGridId = _parentGridId;
    this.parentChainId = _parentChainId;
    this.color = _color;
    /* NOTE, INMARK, OUTMARK */
    this.type = _type;
    /* {} */
    this.data = _data;
  }

  get parentGrid() {
    return window.grids[this.parentGridId];
  }

  get parentChain() {
    return window.workArea.chains.get(this.parentChainId);
  }

  get gridPosition() {
    return {
      x:
        this.position.x * this.parentGrid.cell_size +
        this.parentGrid.pan_position.x,
      y:
        this.position.y * this.parentGrid.cell_size +
        this.parentGrid.pan_position.y,
    };
  }

  display() {
    if (this.data.note === "HOLD") return;
    
    this.parentGrid.pg.push();
    this.parentGrid.pg.fill(color(this.color.bg));
    /* if duration is present then make the cell wider */
    if (this.data.duration) {
      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size * this.data.duration,
        this.parentGrid.cell_size
      );
    } else {
      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size
      );
    }
    
    // this.parentGrid.pg.blendMode(REPLACE)

    /* if a label is just a string, use text,
    otherwise, draw image */
    if (typeof this.label === "string") {
      this.parentGrid.pg.fill(color(this.color.txt));
      this.parentGrid.pg.textSize(14);
      this.parentGrid.pg.textAlign(CENTER, CENTER);
      this.parentGrid.pg.text(
        this.label,
        this.gridPosition.x + this.parentGrid.cell_size / 2.0,
        this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
      );
      
    } else {
      /* label is an image (icon)*/
      this.parentGrid.pg.fill(color(this.color.txt));
      this.parentGrid.pg.imageMode(CENTER);
      this.parentGrid.pg.image(
        window.icons[this.label.icon_name],
        this.gridPosition.x + this.parentGrid.cell_size / 2.0,
        this.gridPosition.y + this.parentGrid.cell_size / 2.0,
        this.parentGrid.cell_size,
        this.parentGrid.cell_size
      );
      
    }
    this.parentGrid.pg.pop();
  }

  /* TODO there probably needs to be some restructuring 
  to move this somewhere else */
  displayVelocity() {
    if (this.data.note === "HOLD") return;
    this.parentGrid.pg.push();
    this.parentGrid.pg.fill("#AD5AF4");
    /* if duration is present then make the cell wider */
    if (this.data.duration) {
      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size * this.data.duration,
        this.parentGrid.cell_size
      );
    } else {
      if (this.type === "INMARK") this.parentGrid.pg.fill(color(this.color.bg));
      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size
      );
    }
    if (this.type === "INMARK") {
      /* 
        if a label is just a string, use text,
        otherwise, draw image 
      */
      if (typeof this.label === "string") {
        this.parentGrid.pg.textSize(14);
        this.parentGrid.pg.textAlign(CENTER, CENTER);
        this.parentGrid.pg.fill(color(this.color.txt));
        this.parentGrid.pg.text(
          this.label,
          this.gridPosition.x + this.parentGrid.cell_size / 2.0,
          this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
        );
      } else {
        /* label is an image (icon)*/
        this.parentGrid.pg.imageMode(CENTER);
        this.parentGrid.pg.image(
          window.icons[this.label.icon_name],
          this.gridPosition.x + this.parentGrid.cell_size / 2.0,
          this.gridPosition.y + this.parentGrid.cell_size / 2.0,
          this.parentGrid.cell_size,
          this.parentGrid.cell_size
        );
      }
    } else {
      this.parentGrid.pg.textSize(14);
      this.parentGrid.pg.textAlign(CENTER, CENTER);
      this.parentGrid.pg.fill(color(this.color.txt));
      this.parentGrid.pg.text(
        this.data.velocity,
        this.gridPosition.x + this.parentGrid.cell_size / 2.0,
        this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
      );
    }
    this.parentGrid.pg.pop();
  }

  /* TODO there probably needs to be some restructuring 
  to move this somewhere else */
  displayOctave() {
    if (this.data.note === "HOLD") return;
    this.parentGrid.pg.push();
    this.parentGrid.pg.fill("#0021B3");
    /* if duration is present then make the cell wider */
    if (this.data.duration) {
      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size * this.data.duration,
        this.parentGrid.cell_size
      );
    } else {
      if (this.type === "INMARK") this.parentGrid.pg.fill(color(this.color.bg));
      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size
      );
    }
    if (this.type === "INMARK") {
      /* 
        if a label is just a string, use text,
        otherwise, draw image 
      */
      if (typeof this.label === "string") {
        this.parentGrid.pg.textSize(14);
        this.parentGrid.pg.textAlign(CENTER, CENTER);
        this.parentGrid.pg.fill(color(this.color.txt));
        this.parentGrid.pg.text(
          this.label,
          this.gridPosition.x + this.parentGrid.cell_size / 2.0,
          this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
        );
      } else {
        /* label is an image (icon)*/
        this.parentGrid.pg.imageMode(CENTER);
        this.parentGrid.pg.image(
          window.icons[this.label.icon_name],
          this.gridPosition.x + this.parentGrid.cell_size / 2.0,
          this.gridPosition.y + this.parentGrid.cell_size / 2.0,
          this.parentGrid.cell_size,
          this.parentGrid.cell_size
        );
      }
    } else {
      this.parentGrid.pg.textSize(14);
      this.parentGrid.pg.textAlign(CENTER, CENTER);
      this.parentGrid.pg.fill(color(this.color.txt));
      this.parentGrid.pg.text(
        this.data.octave,
        this.gridPosition.x + this.parentGrid.cell_size / 2.0,
        this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
      );
    }
    this.parentGrid.pg.pop();
  }

  displayMIDIChannel() {
    if (this.data.note === "HOLD") return;

    /* style inmark */
    this.parentGrid.pg.push();

    this.parentGrid.pg.textSize(14);
    this.parentGrid.pg.textAlign(CENTER, CENTER);

    if (this.type === "INMARK") {
      this.parentGrid.pg.fill("GREEN");

      this.parentGrid.pg.rect(
        this.gridPosition.x,
        this.gridPosition.y,
        this.parentGrid.cell_size
      );

      this.parentGrid.pg.fill("white");
      this.parentGrid.pg.text(
        this.data.MIDIChannel,
        this.gridPosition.x + this.parentGrid.cell_size / 2.0,
        this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
      );
    } else {
      /* styled normal cells */
      this.parentGrid.pg.fill(color(this.color.bg));
      /* if duration is present then make the cell wider */
      if (this.data.duration) {
        this.parentGrid.pg.rect(
          this.gridPosition.x,
          this.gridPosition.y,
          this.parentGrid.cell_size * this.data.duration,
          this.parentGrid.cell_size
        );
      } else {
        this.parentGrid.pg.rect(
          this.gridPosition.x,
          this.gridPosition.y,
          this.parentGrid.cell_size
        );
      }

      /* 
        if a label is just a string, use text,
        otherwise, draw image 
      */
      if (typeof this.label === "string") {
        this.parentGrid.pg.textSize(14);
        this.parentGrid.pg.textAlign(CENTER, CENTER);
        this.parentGrid.pg.fill("black");
        this.parentGrid.pg.text(
          this.label,
          this.gridPosition.x + this.parentGrid.cell_size / 2.0,
          this.gridPosition.y + this.parentGrid.cell_size / 2.0 + 2
        );
      } else {
        /* label is an image (icon)*/
        this.parentGrid.pg.imageMode(CENTER);
        this.parentGrid.pg.image(
          window.icons[this.label.icon_name],
          this.gridPosition.x + this.parentGrid.cell_size / 2.0,
          this.gridPosition.y + this.parentGrid.cell_size / 2.0,
          this.parentGrid.cell_size,
          this.parentGrid.cell_size
        );
      }
    }

    this.parentGrid.pg.pop();
  }

  clone() {
    return new Cell(
      this.label,
      { ...this.position },
      this.color,
      this.parentGrid,
      this.type,
      { ...this.data },
      this.parentChainId
    );
  }
}

export { Grid, Cell };
