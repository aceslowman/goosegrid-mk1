# goosegrid

goosegrid is a sequencer that can be used to live code and compose music 
(and other things that can be connected via MIDI). Notes are arranged along 
a grid, the sequencer plays connected cells from left to right and plays 
connected vertical notes as harmony.

The palatte is where you select notes that can be placed onto the grid.
Tap on any of the cells in the palatte to select, and then click within the grid
to place it. If you click and drag, you can extend notes over longer durations.

![palatte](https://cdn.glitch.global/2e194b33-799a-4322-a267-3de86eb8fd0c/slice1.png?v=1670906038123)

The toolbar is where you can affect playback and a handful of tools 
that can change the mode that you're currently in.

![toolbar](https://cdn.glitch.global/2e194b33-799a-4322-a267-3de86eb8fd0c/slice2.png?v=1670906038530)

#### ✏ (Edit)
- Edit allows you to select notes from the palate and place them into the main grid. Left click will place a note and right click will delete a note. If no notes are selected from the palatte then clicking and dragging will select cells.
#### ⛶ (Select)
- Select allows you to click and drag regions for selection.
#### 🖑 (Pan)
- Pan moves the main grid. Also achieved by the middle mouse button, or two finger drag with touch devices.
#### V (Velocity)
- Velocity puts the the editor into mode that allows you to change the loudness of individual notes.
#### O (Octave)
- Octave puts the editor into a mode that allows you to change the octave of individual notes.
#### 🎹 (MIDI Channel)
- MIDI Channel allows you to change the current midi channel of the given chain.
#### 🔗 (Extend Notes)
- Extend allows you to hold notes and extend duration.
#### ⧉ (Copy)
- Copy will hold on to any selected cells.
#### 📋 (Paste)
- Paste will place any copied cells at the currently selected cell.
#### ✂️ (Cut)
- Cut will copy the selected cells and remove them.
#### 🗑 (Delete)
- Delete will remove the selected cells from the grid.

## MIDI

To use WebMIDI you will likely want to be on Chrome, and you will need to have some sort of virtual MIDI loopback. 

On Windows check out Tobias Erichsen's [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)

On MacOS you can use the built in IAC bus, which has to be enabled in Audio MIDI Setup. 

Check out [this article](https://help.ableton.com/hc/en-us/articles/209774225-Setting-up-a-virtual-MIDI-bus) if you have issues.
