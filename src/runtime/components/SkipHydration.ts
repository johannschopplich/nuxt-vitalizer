import { createStaticVNode, defineComponent, getCurrentInstance } from 'vue'
import type { VNode } from 'vue'
import { useNuxtApp } from '#imports'
import { getFragmentHTML } from '#app/components/utils'

export default defineComponent({
  setup(_, { slots }) {
    const nuxtApp = useNuxtApp()
    const instance = getCurrentInstance()!
    let vnode: VNode | undefined

    if (import.meta.client && nuxtApp.isHydrating && instance.vnode.el) {
      const fragment = getFragmentHTML(instance.vnode.el, false) ?? []
      vnode = createStaticVNode(fragment.join(''), fragment.length)
    }

    return () => vnode || slots.default?.()
  },
})
