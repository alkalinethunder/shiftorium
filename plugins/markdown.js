import Vue from 'vue'
import SshPre from 'simple-syntax-highlighter'

import mdRenderer from 'vue-markdown-renderer'

function getHeadingClass(depth) {
  switch (depth) {
    case 1:
      return 'headline'
    case 2:
      return 'title'
    case 3:
      return 'subtitle-1'
    case 4:
      return 'subtitle-2'
    case 5:
      return 'caption'
    case 6:
      return 'overline'
  }
}

Vue.component('code-view', SshPre)

Vue.use(mdRenderer, {
  marked: {
    gfm: true,
    breaks: true,
    mangle: false,
  },
  elements: {
    image: 'v-img',
    table: 'v-simple-table',
  },
  mappings: {
    hr: ({ createElement }) => createElement('v-divider'),
    heading: ({ token, createElement, config, processTokens }) =>
      createElement(
        config.elements.headingPrefix + token.depth,
        {
          attrs: {
            class: getHeadingClass(token.depth),
          },
        },
        processTokens(token.tokens, createElement, config),
      ),
    code: ({ token, createElement }) =>
      createElement(
        'code-view',
        {
          attrs: {
            language: token.lang,
          },
        },
        token.text.replace('<', '&lt;').replace('>', '&gt;'),
      ),
  },
})
