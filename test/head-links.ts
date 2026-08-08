export interface HeadLink {
  rel: string
  as?: string
  href: string
}

export function headLinks(html: string): HeadLink[] {
  return [...html.matchAll(/<link\b([^>]*)>/g)].map(([, attributes]) => ({
    rel: attribute(attributes!, 'rel') ?? '',
    as: attribute(attributes!, 'as'),
    href: attribute(attributes!, 'href') ?? '',
  }))
}

export function prefetched(html: string, as: string): HeadLink[] {
  return headLinks(html).filter(link => link.rel === 'prefetch' && link.as === as)
}

export function countLinks(html: string, rel: string): number {
  return headLinks(html).filter(link => link.rel === rel).length
}

function attribute(attributes: string, name: string): string | undefined {
  return attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
}
