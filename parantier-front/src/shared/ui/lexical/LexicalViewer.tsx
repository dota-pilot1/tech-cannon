import { useMemo, useRef, useEffect, useState } from "react";
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { editorTheme } from "./theme";

interface CodeBlock {
  id: string;
  text: string;
  top: number;
  right: number;
}

export function LexicalViewer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const html = useMemo(() => {
    if (!content) return "";
    try {
      const editor = createEditor({
        namespace: "TaskViewer",
        theme: editorTheme,
        nodes: [
          HeadingNode,
          ListNode,
          ListItemNode,
          CodeNode,
          CodeHighlightNode,
        ],
        onError: () => {},
      });
      const state = editor.parseEditorState(content);
      let result = "";
      state.read(() => {
        result = $generateHtmlFromNodes(editor, null);
      });
      return result;
    } catch {
      return `<div class="text-sm whitespace-pre-wrap">${content}</div>`;
    }
  }, [content]);

  // 코드 블록 위치 계산해서 버튼 오버레이 배치
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const codeEls = container.querySelectorAll<HTMLElement>("code");
    if (codeEls.length === 0) return;

    const containerRect = container.getBoundingClientRect();

    const blocks: CodeBlock[] = Array.from(codeEls).map((code, idx) => {
      const rect = code.getBoundingClientRect();
      // 텍스트 추출 (하이라이트 span 포함)
      const text = code.innerText || code.textContent || "";
      return {
        id: `code-${idx}`,
        text,
        top: rect.top - containerRect.top + container.scrollTop + 8,
        right: 8,
      };
    });

    setCodeBlocks(blocks);
  }, [html]);

  const handleCopy = (block: CodeBlock) => {
    navigator.clipboard.writeText(block.text).then(() => {
      setCopiedId(block.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (!content) return null;

  return (
    <div ref={containerRef} className="lexical-viewer text-sm relative">
      <div dangerouslySetInnerHTML={{ __html: html }} />

      {codeBlocks.map((block) => {
        const isCopied = copiedId === block.id;
        return (
          <button
            key={block.id}
            onClick={() => handleCopy(block)}
            style={{ top: block.top, right: block.right }}
            className={`
              absolute flex items-center gap-1.5 px-2 py-1 text-xs rounded
              border transition-all duration-150 select-none z-10
              ${
                isCopied
                  ? "bg-green-800 border-green-600 text-green-200"
                  : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
              }
            `}
          >
            {isCopied ? (
              <>
                {/* check icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                복사됨
              </>
            ) : (
              <>
                {/* copy icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                복사
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
