import type { Ref, RendererNode } from 'vue'
import { nextTick, onMounted, onBeforeUnmount } from 'vue'

export function useViewportListener(node: RendererNode, shouldRender: Ref<boolean>) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      shouldRender.value = true
      observer.disconnect()
    }
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  })

  onBeforeUnmount(() => {
    observer.disconnect()
  })

  onMounted(() => {
    nextTick(() =>
      observer.observe(node.previousElementSibling),
    )
  })
}
