import { useMemo, useState } from "react";
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { editorTheme } from "./theme";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        flex items-center gap-1.5 px-2 py-1 text-xs rounded border
        transition-all duration-150 select-none font-sans
        ${
          copied
            ? "bg-green-800 border-green-600 text-green-200"
            : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white"
        }
      `}
      title="코드 복사"
    >
      {copied ? (
        <>
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
}

interface HtmlPart {
  type: "html" | "code";
  content: string;
}

function splitHtmlByCodeBlocks(html: string): HtmlPart[] {
  const parts: HtmlPart[] = [];
  // Lexical CodeNode → <code class="...">...</code> 단독 태그로 렌더링됨
  const codeRegex = /<code([^>]*)>([\s\S]*?)<\/code>/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(html)) !== null) {
    // code 태그 앞 HTML
    if (match.index > lastIndex) {
      parts.push({ type: "html", content: html.slice(lastIndex, match.index) });
    }
    // code 태그 자체
    parts.push({ type: "code", content: match[0] });
    lastIndex = match.index + match[0].length;
  }

  // 나머지 HTML
  if (lastIndex < html.length) {
    parts.push({ type: "html", content: html.slice(lastIndex) });
  }

  return parts;
}

function extractTextFromHtml(html: string): string {
  // span 태그 제거 후 텍스트만 추출
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export function LexicalViewer({ content }: { content: string }) {
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

  const parts = useMemo(() => splitHtmlByCodeBlocks(html), [html]);

  if (!content) return null;

  return (
    <div className="lexical-viewer text-sm">
      {parts.map((part, idx) => {
        if (part.type === "code") {
          const plainText = extractTextFromHtml(
            part.content.replace(/<code[^>]*>([\s\S]*?)<\/code>/i, "$1"),
          );
          return (
            <div key={idx} className="relative my-2 group">
              {/* 복사 버튼 - 항상 우상단 고정 */}
              <div className="absolute top-2 right-2 z-10">
                <CopyButton text={plainText} />
              </div>
              {/* 코드 블록 */}
              <div dangerouslySetInnerHTML={{ __html: part.content }} />
            </div>
          );
        }
        return (
          <div key={idx} dangerouslySetInnerHTML={{ __html: part.content }} />
        );
      })}
    </div>
  );
}
