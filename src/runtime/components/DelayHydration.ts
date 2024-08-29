// Part of this code is forked from nuxt-delay-hydration by @harlan-zw
// @see https://github.com/harlan-zw/nuxt-delay-hydration/blob/main/src/template/global.ts
// @license MIT

import { createStaticVNode, ref, defineComponent, getCurrentInstance } from 'vue'
import type { VNode } from 'vue'
import { isIntersectionObserverSupported, useViewportListener, useWindowListeners } from '../composables'
import { useNuxtApp } from '#imports'
import { getFragmentHTML } from '#app/components/utils'

export default defineComponent({
  props: {
    hydrateWhenVisible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
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

      if (instance.vnode.el && props.hydrateWhenVisible && isIntersectionObserverSupported()) {
        useViewportListener(instance.vnode.el, shouldRender)
      }
      else {
        useWindowListeners(shouldRender)
      }
    }

    return () => (shouldRender.value ? slots.default?.() : vnode)
  },
})
