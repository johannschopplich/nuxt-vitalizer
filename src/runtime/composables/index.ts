export * from './use-viewport-listener'
export * from './use-window-listeners'

export function isIntersectionObserverSupported() {
  return window && 'IntersectionObserver' in window
}
