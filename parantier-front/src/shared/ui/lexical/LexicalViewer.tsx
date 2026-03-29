import { useMemo, useRef, useEffect } from "react";
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { editorTheme } from "./theme";

export function LexicalViewer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  // 코드 블록에 복사 버튼 추가
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Lexical은 code 블록을 <code class="..."> 로 직접 렌더링
    // pre > code 또는 단독 code 모두 커버
    const codeEls = container.querySelectorAll<HTMLElement>("code");

    codeEls.forEach((code) => {
      // 이미 버튼 추가된 경우 스킵
      const wrapper = code.parentElement;
      if (!wrapper) return;
      if (wrapper.querySelector(".copy-btn")) return;

      // code 감싸는 래퍼를 relative로
      const isPreChild = wrapper.tagName === "PRE";
      const target = isPreChild ? wrapper : code;

      target.style.position = "relative";

      // 복사 버튼 생성
      const btn = document.createElement("button");
      btn.className =
        "copy-btn absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs " +
        "bg-gray-700 text-gray-300 rounded hover:bg-gray-500 hover:text-white " +
        "opacity-0 transition-all duration-150 select-none z-10";
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span class="copy-label">복사</span>
      `;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const text = code.textContent || "";
        navigator.clipboard.writeText(text).then(() => {
          const label = btn.querySelector(".copy-label");
          const svg = btn.querySelector("svg");
          if (label) label.textContent = "복사됨";
          if (svg) {
            svg.innerHTML = `
              <polyline points="20 6 9 17 4 12"></polyline>
            `;
          }
          btn.classList.add("bg-green-700", "text-green-200");
          btn.classList.remove("bg-gray-700", "text-gray-300");
          setTimeout(() => {
            if (label) label.textContent = "복사";
            if (svg) {
              svg.innerHTML = `
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              `;
            }
            btn.classList.remove("bg-green-700", "text-green-200");
            btn.classList.add("bg-gray-700", "text-gray-300");
          }, 2000);
        });
      });

      target.appendChild(btn);

      // hover 시 버튼 표시
      const show = () => {
        btn.style.opacity = "1";
      };
      const hide = () => {
        btn.style.opacity = "0";
      };
      target.addEventListener("mouseenter", show);
      target.addEventListener("mouseleave", hide);
    });
  }, [html]);

  if (!content) return null;

  return (
    <div
      ref={containerRef}
      className="lexical-viewer text-sm"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
