/* eslint-disable */

class FloatingPanel {
  constructor(_a_pos_x, _a_pos_y, _ele_id) {
    this.anchor_position = {x:_a_pos_x, y:_a_pos_y};

    /* this element and others rely on some html */
    this.ele = document.querySelector(_ele_id);
    this.ele.style.top = this.anchor_position.y + "px";
    this.ele.style.left = this.anchor_position.x + "px";

    document
      .querySelector(_ele_id + " .dragHandle")
      .addEventListener("mousedown", (e) => {
        this.handleDrag(e);
      });
    document
      .querySelector(_ele_id + " .dragHandle")
      .addEventListener("touchstart", (e) => {
        this.handleDrag(e);
      });
  }

  handleDrag(e) {
    e.stopPropagation();

    if (e.touches) {
      /* start position is off without this */
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }

    const handleMouseMove = () => {
      this.anchor_position.x = mouseX + 10;
      this.anchor_position.y = mouseY + 10;

      this.ele.style.top = this.anchor_position.y + "px";
      this.ele.style.left = this.anchor_position.x + "px";
    };

    const handleMouseRelease = () => {
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
}

export default FloatingPanel;
