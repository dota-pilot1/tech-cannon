import { useMemo, useRef, useEffect } from "react";
import { createEditor } from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";
import { HeadingNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ImageNode } from "./nodes/ImageNode";
import { YouTubeNode } from "./nodes/YouTubeNode";
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
          ImageNode,
          LinkNode,
          YouTubeNode,
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // pre 태그 찾기
    const preEls = container.querySelectorAll<HTMLElement>("pre");
    preEls.forEach((pre) => {
      // 이미 처리된 경우 스킵
      if (pre.parentElement?.classList.contains("code-wrapper")) return;

      // 래퍼 div 생성
      const wrapper = document.createElement("div");
      wrapper.className = "code-wrapper relative my-2";

      // 복사 버튼 생성
      const btn = document.createElement("button");
      btn.className =
        "absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 text-xs rounded " +
        "bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white transition-colors select-none";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
        "<span>복사</span>";

      btn.addEventListener("click", () => {
        // br → \n 변환 후 텍스트 추출
        const clone = pre.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("br").forEach((br) => {
          br.replaceWith("\n");
        });
        const text = clone.innerText || clone.textContent || "";

        navigator.clipboard.writeText(text).then(() => {
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
            "<span>복사됨</span>";
          btn.classList.add(
            "bg-green-800",
            "border-green-600",
            "text-green-200",
          );
          btn.classList.remove(
            "bg-gray-700",
            "border-gray-600",
            "text-gray-300",
          );

          setTimeout(() => {
            btn.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              "<span>복사</span>";
            btn.classList.remove(
              "bg-green-800",
              "border-green-600",
              "text-green-200",
            );
            btn.classList.add(
              "bg-gray-700",
              "border-gray-600",
              "text-gray-300",
            );
          }, 2000);
        });
      });

      // pre를 wrapper로 감싸고 버튼 추가
      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      wrapper.appendChild(btn);
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
