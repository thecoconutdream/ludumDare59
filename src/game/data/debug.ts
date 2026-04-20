export const debugSettings = {
  zoom: 1,
  pendingWarp: null as string | null,
}

;(window as any).debug = {
  settings: debugSettings,
  warpToCannon: () => { debugSettings.pendingWarp = 'cannon' },
}
