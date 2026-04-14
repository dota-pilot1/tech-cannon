import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createLinkNode, $isLinkNode } from '@lexical/link'
import { $createTextNode, TextNode } from 'lexical'

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/

export function AutoLinkPlugin(): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerNodeTransform(TextNode, (node) => {
      if (!node.isSimpleText()) return
      const parent = node.getParent()
      if ($isLinkNode(parent)) return

      const text = node.getTextContent()
      const match = URL_REGEX.exec(text)
      if (!match) return

      const url = match[0]
      const startIndex = match.index
      const endIndex = startIndex + url.length

      let targetNode: TextNode
      if (startIndex > 0) {
        ;[, targetNode] = node.splitText(startIndex, endIndex)
      } else {
        ;[targetNode] = node.splitText(endIndex)
      }

      if (!targetNode) return

      const linkNode = $createLinkNode(url, { target: '_blank', rel: 'noopener noreferrer' })
      const linkText = $createTextNode(url)
      linkNode.append(linkText)
      targetNode.replace(linkNode)
    })
  }, [editor])

  return null
}
