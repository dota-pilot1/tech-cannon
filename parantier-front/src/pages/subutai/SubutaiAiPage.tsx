import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Send,
  Bot,
  User,
  RotateCcw,
  FileText,
  CheckSquare,
  Square,
} from "lucide-react";

// ─── 더미 데이터 ─────────────────────────────────────────────
const DUMMY_CATEGORIES = [
  {
    id: "cat-1",
    label: "Spring Boot",
    docs: [
      { id: "doc-1", title: "Spring Security 설정 가이드" },
      { id: "doc-2", title: "JPA 엔티티 설계 패턴" },
      { id: "doc-3", title: "REST API 응답 구조" },
    ],
  },
  {
    id: "cat-2",
    label: "React",
    docs: [
      { id: "doc-4", title: "컴포넌트 설계 원칙" },
      { id: "doc-5", title: "TanStack Query 사용법" },
    ],
  },
];

const DUMMY_MESSAGES = [
  {
    id: "msg-1",
    role: "user" as const,
    content: "Spring Security에서 JWT 인증을 어떻게 구현하나요?",
    timestamp: "14:23",
  },
  {
    id: "msg-2",
    role: "ai" as const,
    content:
      "JWT 인증 구현을 위해 먼저 `JwtAuthenticationFilter`를 작성합니다.\n\n1. `OncePerRequestFilter`를 상속받아 필터 클래스를 생성합니다.\n2. `doFilterInternal` 메서드에서 `Authorization` 헤더를 추출합니다.\n3. `Bearer ` 접두사를 제거한 뒤 토큰을 검증합니다.\n4. 검증 성공 시 `SecurityContextHolder`에 인증 정보를 설정합니다.\n\n선택하신 문서의 Spring Security 설정 가이드를 참고하면 더 자세한 예제를 확인하실 수 있습니다.",
    timestamp: "14:23",
  },
  {
    id: "msg-3",
    role: "user" as const,
    content: "JPA에서 N+1 문제는 어떻게 해결하나요?",
    timestamp: "14:25",
  },
  {
    id: "msg-4",
    role: "ai" as const,
    content:
      'N+1 문제는 주로 두 가지 방법으로 해결할 수 있습니다.\n\n**1. Fetch Join 사용**\nJPQL에서 `JOIN FETCH`를 사용하여 연관 엔티티를 한 번의 쿼리로 가져옵니다.\n\n**2. @EntityGraph 사용**\n`@EntityGraph(attributePaths = {"관계필드명"})`를 Repository 메서드에 선언합니다.\n\n컬렉션 페치 조인 시에는 `distinct`를 반드시 사용하고, 페이징과 함께 사용할 때는 `@BatchSize` 또는 `default_batch_fetch_size` 설정을 활용하세요.',
    timestamp: "14:25",
  },
];
// ─────────────────────────────────────────────────────────────

export default function SubutaiAiPage() {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["cat-1", "cat-2"]),
  );
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const toggleDoc = (docId: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  };

  const handleReset = () => setSelectedDocs(new Set());

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      role: "user" as const,
      content: text,
      timestamp: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMsg = {
        id: `msg-${Date.now()}-a`,
        role: "ai" as const,
        content:
          "선택된 문서를 기반으로 답변을 생성 중입니다. 현재 데모 모드로 실제 AI 응답은 제공되지 않습니다.",
        timestamp: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  };

  return (
    <div
      className="flex bg-background text-foreground"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* ── 좌측: 문서 패널 ────────────────────────────────── */}
      <aside className="w-1/3 min-w-60 max-w-xs border-r border-border flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">참고 문서</span>
          </div>
          {selectedDocs.size > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {selectedDocs.size}개 선택됨
            </span>
          )}
        </div>

        {/* 카테고리 목록 */}
        <div className="flex-1 overflow-y-auto py-2">
          {DUMMY_CATEGORIES.map((cat) => {
            const isOpen = expandedCats.has(cat.id);
            const selectedInCat = cat.docs.filter((d) =>
              selectedDocs.has(d.id),
            ).length;

            return (
              <div key={cat.id} className="mb-1">
                {/* 카테고리 헤더 */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted/60 transition-colors text-left"
                >
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1 truncate">{cat.label}</span>
                  {selectedInCat > 0 && (
                    <span className="text-xs text-primary font-semibold">
                      {selectedInCat}
                    </span>
                  )}
                </button>

                {/* 문서 목록 */}
                {isOpen && (
                  <div className="ml-6 border-l border-border pl-2">
                    {cat.docs.map((doc) => {
                      const isSelected = selectedDocs.has(doc.id);
                      return (
                        <button
                          key={doc.id}
                          onClick={() => toggleDoc(doc.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded-md transition-colors text-left mb-0.5 ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Square className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span className="truncate">{doc.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 초기화 버튼 */}
        <div className="px-4 py-3 border-t border-border shrink-0">
          <button
            onClick={handleReset}
            disabled={selectedDocs.size === 0}
            className="w-full flex items-center justify-center gap-2 text-xs py-2 rounded-md border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3 h-3" />
            선택 초기화
          </button>
        </div>
      </aside>

      {/* ── 우측: 챗봇 패널 ────────────────────────────────── */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* 챗봇 헤더 */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">Subutai AI</span>
            <span className="text-xs bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium border border-amber-500/20">
              Beta
            </span>
          </div>
          {selectedDocs.size > 0 && (
            <span className="ml-auto text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              문서 {selectedDocs.size}개 참조 중
            </span>
          )}
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {messages.map((msg) =>
            msg.role === "ai" ? (
              // AI 말풍선 (좌측)
              <div key={msg.id} className="flex items-start gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 ml-1 block">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ) : (
              // 사용자 말풍선 (우측)
              <div
                key={msg.id}
                className="flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse"
              >
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="items-end flex flex-col">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 mr-1 block">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ),
          )}

          {/* 로딩 인디케이터 */}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 하단 고정 입력창 */}
        <div className="px-5 py-4 border-t border-border shrink-0 bg-background">
          <div className="flex items-end gap-3 bg-card border border-border rounded-xl px-4 py-3 focus-within:border-primary/50 transition-colors">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="참고 문서를 기반으로 질문하세요..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed max-h-40"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-xs font-mono">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="px-1 py-0.5 rounded border border-border bg-muted text-xs font-mono">
              Enter
            </kbd>{" "}
            로 빠르게 전송
          </p>
        </div>
      </section>
    </div>
  );
}
