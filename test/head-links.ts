export function countLinks(html: string, rel: string): number {
  return html.split(`rel="${rel}"`).length - 1
}
