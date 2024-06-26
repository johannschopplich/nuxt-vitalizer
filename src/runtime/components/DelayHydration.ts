// Part of this code is forked from nuxt-delay-hydration by @harlan-zw
// @see https://github.com/harlan-zw/nuxt-delay-hydration/blob/main/src/template/global.ts
// @license MIT

import { createStaticVNode, ref, onMounted, defineComponent, getCurrentInstance } from 'vue'
import type { VNode } from 'vue'
import { useNuxtApp } from '#imports'
import { getFragmentHTML } from '#app/components/utils'
import { delayHydrationOptions } from '#build/module/nuxt-vitalizer'

interface Handler {
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  promise: Promise<void | Event>
  cleanup: () => void
}

export default defineComponent({
  setup(_, { slots }) {
    const nuxtApp = useNuxtApp()
    const instance = getCurrentInstance()!
    const supportsIdleCallback = import.meta.client ? ('requestIdleCallback' in window) : false
    const shouldRender = ref(import.meta.server || !supportsIdleCallback || !nuxtApp.isHydrating)
    let vnode: VNode | undefined

    if (import.meta.client && !shouldRender.value) {
      if (instance.vnode.el) {
        const fragment = getFragmentHTML(instance.vnode.el, false) ?? []
        vnode = createStaticVNode(fragment.join(''), fragment.length)
      }

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

    return () => (shouldRender.value ? slots.default?.() : vnode)
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
