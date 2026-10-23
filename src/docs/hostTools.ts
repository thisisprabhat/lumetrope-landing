// Tools the app itself provides on top of the engine catalogue (mirrors packages/mcp/src/hostTools.ts
// in the Lumetrope repo; the generated engine catalogue lives in src/content/mcp-catalog.json).
export const HOST_TOOLS: { name: string; description: string }[] = [
  { name: "get_editor_state", description: "Current editor state: file name, mode, playhead frame, selected layers, scene being edited, and whether there are unsaved versions." },
  { name: "get_frame_image", description: "Render a frame of the active animation to a PNG so you can see the result. Use it after edits to verify layout, colours and motion." },
  { name: "set_current_frame", description: "Move the editor's playhead (also the frame new keyframes are added at by the UI)." },
  { name: "undo", description: "Undo the last change." },
  { name: "redo", description: "Redo the last undone change." },
  { name: "save_version", description: "Save the current document as a named version in the local history." },
  { name: "list_versions", description: "List saved versions (newest first) on the current branch." },
  { name: "restore_version", description: "Restore a saved version by id (from list_versions). Unsaved work is first kept as an Auto-saved version." },
  { name: "preview_state_machine", description: "Start running a state machine in the preview so you can test it with the state_machine_* tools." },
  { name: "state_machine_input", description: "Set an input of the running state machine (boolean, number or string) or fire an event input. Returns the new state." },
  { name: "state_machine_pointer", description: "Simulate a pointer event (click, down, up, move, enter, exit) at scene coordinates on the running state machine." },
  { name: "state_machine_advance", description: "Advance the running state machine by some seconds so segments can finish and OnComplete can fire. Returns the state." },
  { name: "stop_state_machine_preview", description: "Stop the running state machine preview." },
];
