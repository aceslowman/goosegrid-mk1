/* eslint-disable */
class Toolbar {
  constructor() {

    this.selectedTool = "EDIT";

    document
      .querySelector("#toolbarEditButton")
      .addEventListener("click", () => this.handleEdit());
    document
      .querySelector("#toolbarSelectButton")
      .addEventListener("click", () => this.handleSelect());
    document
      .querySelector("#toolbarPanButton")
      .addEventListener("click", () => this.handlePan());
    document
      .querySelector("#toolbarVelocityButton")
      .addEventListener("click", () => this.handleVelocity());
    document
      .querySelector("#toolbarOctaveButton")
      .addEventListener("click", () => this.handleOctave());
    document
      .querySelector("#toolbarMIDIChannelButton")
      .addEventListener("click", () => this.handleMIDIChannel());
    document
      .querySelector("#toolbarExtendButton")
      .addEventListener("click", () => this.handleExtend());
    document
      .querySelector("#toolbarCopyButton")
      .addEventListener("click", () => this.handleCopy());
    document
      .querySelector("#toolbarPasteButton")
      .addEventListener("click", () => this.handlePaste());
    document
      .querySelector("#toolbarCutButton")
      .addEventListener("click", () => this.handleCut());
    document
      .querySelector("#toolbarDeleteButton")
      .addEventListener("click", () => this.handleDelete());

    this.updateDisplay();
  }

  handleEdit() {
    this.selectedTool = "EDIT";
    this.updateDisplay();
  }

  handleSelect() {
    this.selectedTool = "SELECT";
    this.updateDisplay();
  }

  handlePan() {
    this.selectedTool = "PAN";
    this.updateDisplay();
  }

  handleVelocity() {
    this.selectedTool = "VELOCITY";
    this.updateDisplay();
  }

  handleOctave() {
    this.selectedTool = "OCTAVE";
    this.updateDisplay();
  }

  handleMIDIChannel() {
    this.selectedTool = "MIDICHANNEL";
    this.updateDisplay();
  }

  handleExtend() {
    this.selectedTool = "EXTEND";
    this.updateDisplay();
  }

  handleCopy() {
    window.workArea.copySelection();
    this.updateDisplay();
  }

  handlePaste() {
    window.workArea.pasteSelection();
    this.updateDisplay();
  }

  handleCut() {
    window.workArea.cutSelection();
    this.updateDisplay();
  }

  handleDelete() {
    window.workArea.deleteSelection();
    this.updateDisplay();
  }

  updateDisplay() {
    document
      .querySelector("#toolbarEditButton")
      .classList.remove("squareButtonActive");
    document
      .querySelector("#toolbarSelectButton")
      .classList.remove("squareButtonActive");
    document
      .querySelector("#toolbarPanButton")
      .classList.remove("squareButtonActive");
    document
      .querySelector("#toolbarVelocityButton")
      .classList.remove("squareButtonActive");
    document
      .querySelector("#toolbarOctaveButton")
      .classList.remove("squareButtonActive");
    document
      .querySelector("#toolbarMIDIChannelButton")
      .classList.remove("squareButtonActive");
    document
      .querySelector("#toolbarExtendButton")
      .classList.remove("squareButtonActive");

    switch (this.selectedTool) {
      case "EDIT":
        document
          .querySelector("#toolbarEditButton")
          .classList.add("squareButtonActive");
        break;
      case "SELECT":
        document
          .querySelector("#toolbarSelectButton")
          .classList.add("squareButtonActive");
        break;
      case "PAN":
        document
          .querySelector("#toolbarPanButton")
          .classList.add("squareButtonActive");
        break;
      case "VELOCITY":
        document
          .querySelector("#toolbarVelocityButton")
          .classList.add("squareButtonActive");
        break;
      case "OCTAVE":
        document
          .querySelector("#toolbarOctaveButton")
          .classList.add("squareButtonActive");
        break;
      case "MIDICHANNEL":
        document
          .querySelector("#toolbarMIDIChannelButton")
          .classList.add("squareButtonActive");
        break;
      case "EXTEND":
        document
          .querySelector("#toolbarExtendButton")
          .classList.add("squareButtonActive");
        break;
    }

    /* refresh display */
    window.workArea.display();
  }
}

export default Toolbar;
