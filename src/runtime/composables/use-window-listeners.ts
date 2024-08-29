import type { Ref } from 'vue'
import { delayHydrationOptions } from '#build/module/nuxt-vitalizer'
import { onMounted, useNuxtApp } from '#imports'

interface Handler {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  promise: Promise<void | Event>
  cleanup: () => void
}

export function useWindowListeners(shouldRender: Ref<boolean>) {
  const nuxtApp = useNuxtApp()

  onMounted(async () => {
    const triggers = [idleListener(), eventListeners()]
    nuxtApp._delayHydrationPromise ??= Promise.race(
      triggers.map(t => t.promise),
    ).finally(() => {
      for (const t of triggers) t.cleanup()
    })

    await nuxtApp._delayHydrationPromise
    shouldRender.value = true
  })
}

function eventListeners(): Handler {
  const abortController = new AbortController()
  const promise = new Promise<Event>((resolve) => {
    const listener = (e: Event) => {
      for (const e of delayHydrationOptions.hydrateOnEvents) window.removeEventListener(e, listener)
      requestAnimationFrame(() => resolve(e))
    }

    for (const e of delayHydrationOptions.hydrateOnEvents) {
      window.addEventListener(e, listener, {
        capture: true,
        once: true,
        passive: true,
        signal: abortController.signal,
      })
    }
  })

  return {
    promise,
    cleanup: () => abortController.abort(),
  }
}

function idleListener(): Handler {
  let idleId: number

  const promise = new Promise<void>((resolve) => {
    const timeoutDelay = () => {
      setTimeout(() => {
        requestAnimationFrame(() => resolve())
      }, delayHydrationOptions.postIdleTimeout)
    }
    idleId = requestIdleCallback(timeoutDelay, {
      timeout: delayHydrationOptions.idleCallbackTimeout,
    })
  })

  return {
    promise,
    cleanup: () => cancelIdleCallback(idleId),
  }
}
