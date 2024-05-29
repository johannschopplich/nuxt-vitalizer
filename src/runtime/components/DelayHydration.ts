import { createStaticVNode, ref, onMounted, defineComponent, getCurrentInstance } from 'vue'
import type { VNode } from 'vue'
import { useNuxtApp } from '#imports'
import { getFragmentHTML } from '#app/components/utils'
import { delayHydrationOptions } from '#build/module/nuxt-lcp-speedup'

interface Handler {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  promise: Promise<void | Event>
  cleanup: () => void
}

export default defineComponent({
  setup(_, { slots }) {
    if (!slots.default) {
      return
    }

    if (import.meta.server) {
      return () => slots.default!()
    }

    const nuxtApp = useNuxtApp()
    const instance = getCurrentInstance()!
    const isIdle = ref(false)
    let vnode: VNode | undefined

    if (import.meta.client) {
      if (nuxtApp.isHydrating) {
        if (instance.vnode.el) {
          const fragment = getFragmentHTML(instance.vnode.el, false)
          if (fragment) {
            vnode = createStaticVNode(fragment.join(''), fragment.length)
          }
        }

        onMounted(async () => {
          if (!('requestIdleCallback' in window)) {
            isIdle.value = true
            return
          }

          const triggers = [idleListener(), eventListeners()]
          nuxtApp._delayHydrationPromise ??= Promise.race(
            triggers.map(t => t.promise),
          ).finally(() => {
            for (const t of triggers) t.cleanup()
          })

          await nuxtApp._delayHydrationPromise
          isIdle.value = true
        })
      }
      else {
        isIdle.value = true
      }
    }

    return () => (isIdle.value ? slots.default!() : vnode)
  },
})

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
