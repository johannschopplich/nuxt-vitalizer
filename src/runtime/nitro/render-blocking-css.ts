import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response) => {
    if (response.body && typeof response.body === 'string') {
      // Add blocking="render" attribute to stylesheet links to prevent FOUC
      // Use a simpler regex to avoid backtracking issues
      response.body = response.body.replace(
        /<link\s+rel="stylesheet"([^>]*)>/gi,
        (match: string) => {
          // Don't add blocking attribute if it already exists
          if (match.includes('blocking=')) {
            return match
          }
          // Add blocking="render" before the closing >
          return match.replace('>', ' blocking="render">')
        },
      )
    }
  })
})
