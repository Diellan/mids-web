# Potential Features

## DataViewer: True Undock to Separate Window
Allow the floating DataViewer to be dragged outside the main Electron window by spawning a separate frameless BrowserWindow via IPC. The child window would load the same Vite app with a route/hash parameter, render only the DataViewer content, and use native OS window dragging/resizing. State would sync between windows via IPC. This is how apps like VS Code handle truly undockable panels.
