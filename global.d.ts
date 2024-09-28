/* eslint-disable @typescript-eslint/no-explicit-any */

// Extend the Window interface
interface Window {
  cast?: any
  chrome?: any
  ["__onGCastApiAvailable"]?: any
}
