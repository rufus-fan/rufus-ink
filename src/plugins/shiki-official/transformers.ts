// https://github.com/shikijs/shiki/tree/main/packages/transformers
import type { ShikiTransformer } from '@shikijs/types'
import type { ElementContent } from 'hast'

import { transformerNotationMap } from './shared-notation-map'
import type { MatchAlgorithmOptions } from './shared-notation-transformer'

// https://shiki.style/packages/transformers#transformernotationdiff
// https://github.com/shikijs/shiki/blob/main/packages/transformers/src/transformers/notation-diff.ts
export interface TransformerNotationDiffOptions extends MatchAlgorithmOptions {
  /**
   * Class for added lines
   */
  classLineAdd?: string
  /**
   * Class for removed lines
   */
  classLineRemove?: string
  /**
   * Class added to the <pre> element when the current code has diff
   */
  classActivePre?: string
  /**
   * Class added to the <code> element when the current code has diff
   */
  classActiveCode?: string
}
/**
 * Use `[!code ++]` and `[!code --]` to mark added and removed lines.
 */
export function transformerNotationDiff(
  options: TransformerNotationDiffOptions = {},
): ShikiTransformer {
  const {
    classLineAdd = 'diff add',
    classLineRemove = 'diff remove',
    classActivePre = 'has-diff',
    classActiveCode,
  } = options

  return transformerNotationMap(
    {
      classMap: {
        '++': classLineAdd,
        '--': classLineRemove,
      },
      classActivePre,
      classActiveCode,
      matchAlgorithm: options.matchAlgorithm,
    },
    '@shikijs/transformers:notation-diff',
  )
}

// https://shiki.style/packages/transformers#transformernotationhighlight
// https://github.com/shikijs/shiki/blob/main/packages/transformers/src/transformers/notation-highlight.ts
export interface TransformerNotationHighlightOptions extends MatchAlgorithmOptions {
  /**
   * Class for highlighted lines
   */
  classActiveLine?: string
  /**
   * Class added to the root element when the code has highlighted lines
   */
  classActivePre?: string
  /**
   * Class added to the <code> element when the code has highlighted lines
   */
  classActiveCode?: string
}
/**
 * Allow using `[!code highlight]` notation in code to mark highlighted lines.
 */
export function transformerNotationHighlight(
  options: TransformerNotationHighlightOptions = {},
): ShikiTransformer {
  const {
    classActiveLine = 'highlighted',
    classActivePre = 'has-highlighted',
    classActiveCode,
  } = options

  return transformerNotationMap(
    {
      classMap: {
        highlight: classActiveLine,
        hl: classActiveLine,
      },
      classActivePre,
      classActiveCode,
      matchAlgorithm: options.matchAlgorithm,
    },
    '@shikijs/transformers:notation-highlight',
  )
}

// https://shiki.style/packages/transformers#transformermetahighlight
// https://github.com/shikijs/shiki/blob/main/packages/transformers/src/transformers/meta-highlight.ts
export interface TransformerMetaHighlightOptions {
  /**
   * Class for highlighted lines
   */
  classActiveLine?: string
  /**
   * Class added to the root element when the code has highlighted lines
   */
  classActivePre?: string
}
/**
 * Use ` ```ts {1,3-5}` meta to highlight lines without polluting the code content.
 */
export function transformerMetaHighlight(
  options: TransformerMetaHighlightOptions = {},
): ShikiTransformer {
  const {
    classActiveLine = 'highlighted',
    classActivePre = 'has-highlighted',
  } = options

  return {
    name: '@shikijs/transformers:meta-highlight',
    code(hast) {
      const raw = this.options.meta?.__raw ?? ''
      const match = raw.match(/\{([\d,\s-]+)\}/)
      if (!match)
        return

      const indices = new Set<number>()
      for (const part of match[1].split(',')) {
        const [startStr, endStr] = part.split('-').map(s => s.trim())
        const start = Number.parseInt(startStr, 10)
        if (Number.isNaN(start))
          continue
        const end = Number.parseInt(endStr, 10) || start
        for (let i = start; i <= end; i++)
          indices.add(i - 1)
      }
      if (!indices.size)
        return

      const lines = hast.children.filter(i => i.type === 'element')
      lines.forEach((line, idx) => {
        if (indices.has(idx))
          this.addClassToHast(line, classActiveLine)
      })
      this.addClassToHast(this.pre, classActivePre)
    },
  }
}

// https://shiki.style/packages/transformers#transformerremovenotationescape
// https://github.com/shikijs/shiki/blob/main/packages/transformers/src/transformers/remove-notation-escape.ts
/**
 * Remove notation escapes.
 * Useful when you want to write `// [!code` in markdown.
 * If you process `// [\!code ...]` expression, you can get `// [!code ...]` in the output.
 */
export function transformerRemoveNotationEscape(): ShikiTransformer {
  return {
    name: '@shikijs/transformers:remove-notation-escape',
    code(hast) {
      function replace(node: ElementContent): void {
        if (node.type === 'text') {
          node.value = node.value.replace('[\\!code', '[!code')
        }
        else if ('children' in node) {
          for (const child of node.children) {
            replace(child)
          }
        }
      }

      replace(hast)
      return hast
    },
  }
}
