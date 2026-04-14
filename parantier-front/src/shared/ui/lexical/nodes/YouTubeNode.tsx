import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'
import { DecoratorNode, $applyNodeReplacement } from 'lexical'

export type SerializedYouTubeNode = Spread<
  { videoID: string },
  SerializedLexicalNode
>

function convertYouTubeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const videoID = domNode.getAttribute('data-lexical-youtube')
  if (videoID) {
    return { node: $createYouTubeNode(videoID) }
  }
  return null
}

export class YouTubeNode extends DecoratorNode<JSX.Element> {
  __id: string

  static getType(): string {
    return 'youtube'
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__key)
  }

  constructor(id: string, key?: NodeKey) {
    super(key)
    this.__id = id
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    return $createYouTubeNode(serializedNode.videoID)
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      type: 'youtube',
      version: 1,
      videoID: this.__id,
    }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-youtube')) return null
        return {
          conversion: convertYouTubeElement,
          priority: 1,
        }
      },
    }
  }

  exportDOM(): DOMExportOutput {
    const wrapper = document.createElement('div')
    wrapper.setAttribute('data-lexical-youtube', this.__id)
    wrapper.style.textAlign = 'center'
    wrapper.style.margin = '12px 0'

    const iframe = document.createElement('iframe')
    iframe.setAttribute('src', `https://www.youtube.com/embed/${this.__id}`)
    iframe.setAttribute('frameborder', '0')
    iframe.setAttribute('allowfullscreen', 'true')
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture')
    iframe.style.width = '100%'
    iframe.style.maxWidth = '560px'
    iframe.style.aspectRatio = '16/9'
    iframe.style.borderRadius = '8px'

    wrapper.appendChild(iframe)
    return { element: wrapper }
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div')
    div.style.textAlign = 'center'
    div.style.margin = '12px 0'
    return div
  }

  updateDOM(): boolean {
    return false
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return (
      <div className="flex justify-center my-3">
        <iframe
          src={`https://www.youtube.com/embed/${this.__id}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg w-full max-w-[560px]"
          style={{ aspectRatio: '16/9' }}
        />
      </div>
    )
  }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
  return $applyNodeReplacement(new YouTubeNode(videoID))
}

export function $isYouTubeNode(node: LexicalNode | null | undefined): node is YouTubeNode {
  return node instanceof YouTubeNode
}

// YouTube URL에서 video ID 추출
export function extractYouTubeVideoID(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
