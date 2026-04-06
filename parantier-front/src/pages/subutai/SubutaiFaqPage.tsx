import { useState } from "react";
import { Search, ChevronDown, ChevronUp, Tag, Inbox } from "lucide-react";

// ─── 더미 데이터 ─────────────────────────────────────────────
const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "spring", label: "Spring Boot" },
  { id: "react", label: "React" },
  { id: "infra", label: "인프라" },
  { id: "db", label: "데이터베이스" },
];

const FAQ_ITEMS = [
  {
    id: "faq-1",
    categoryId: "spring",
    categoryLabel: "Spring Boot",
    question:
      "Spring Boot에서 application.yml과 application.properties 중 어느 것을 사용해야 하나요?",
    answer:
      "두 형식 모두 사용 가능하지만, 계층적 구조를 표현할 때 application.yml이 더 가독성이 좋습니다. 특히 여러 환경(dev, prod)을 --- 구분자로 하나의 파일에 관리할 수 있어 yml을 권장합니다. 단, 팀 컨벤션이 있다면 그에 따르세요.",
  },
  {
    id: "faq-2",
    categoryId: "spring",
    categoryLabel: "Spring Boot",
    question: "@Transactional(readOnly = true)는 언제 사용하나요?",
    answer:
      "조회(SELECT) 전용 메서드에 사용합니다. readOnly = true를 설정하면 JPA의 변경 감지(Dirty Checking) 스냅샷을 생성하지 않아 메모리와 성능이 개선됩니다. 또한 일부 DB 드라이버는 읽기 전용 트랜잭션을 읽기 복제본으로 라우팅하는 최적화도 적용합니다. 서비스 클래스 레벨에 @Transactional(readOnly = true)를 선언하고, 쓰기 메서드에만 @Transactional을 별도로 붙이는 패턴이 일반적입니다.",
  },
  {
    id: "faq-3",
    categoryId: "react",
    categoryLabel: "React",
    question: "useEffect의 의존성 배열을 빈 배열로 두면 어떻게 동작하나요?",
    answer:
      "의존성 배열이 빈 배열([])이면 컴포넌트가 마운트될 때 한 번만 실행됩니다. 클래스 컴포넌트의 componentDidMount와 동일한 동작입니다. 반환하는 클린업 함수는 컴포넌트가 언마운트될 때 실행됩니다. 의존성을 생략하면 매 렌더마다 실행되므로 주의하세요.",
  },
  {
    id: "faq-4",
    categoryId: "infra",
    categoryLabel: "인프라",
    question:
      "Docker 컨테이너가 재시작 후 데이터가 사라지는 이유는 무엇인가요?",
    answer:
      "컨테이너는 기본적으로 stateless(무상태)입니다. 컨테이너 내부에 저장된 데이터는 컨테이너 레이어에만 존재하므로 컨테이너가 삭제·재생성되면 함께 사라집니다. 데이터를 영속화하려면 Docker Volume 또는 Bind Mount를 사용해야 합니다. docker-compose.yml에서 volumes 키로 호스트 경로를 컨테이너에 마운트하면 컨테이너가 교체되어도 데이터가 유지됩니다.",
  },
  {
    id: "faq-5",
    categoryId: "db",
    categoryLabel: "데이터베이스",
    question: "인덱스를 너무 많이 만들면 어떤 문제가 생기나요?",
    answer:
      "인덱스는 읽기 성능을 향상시키지만 쓰기(INSERT, UPDATE, DELETE) 성능을 저하시킵니다. 데이터 변경 시 해당 컬럼의 인덱스도 함께 갱신해야 하기 때문입니다. 또한 인덱스 자체가 디스크 공간을 차지합니다. 자주 조회되는 컬럼, WHERE·JOIN·ORDER BY에 사용되는 컬럼 위주로 선별적으로 생성하고, 불필요한 인덱스는 정기적으로 정리하는 것이 좋습니다.",
  },
];
// ─────────────────────────────────────────────────────────────

const CATEGORY_BADGE_COLOR: Record<string, string> = {
  spring:
    "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  react: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  infra:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
  db: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
};

export default function SubutaiFaqPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Set<string>>(new Set());

  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchCategory =
      selectedCategoryId === "all" || item.categoryId === selectedCategoryId;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      !query ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  return (
    <div
      className="flex bg-background text-foreground"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* ── 좌측: 카테고리 사이드바 ──────────────────────────── */}
      <aside className="w-52 shrink-0 border-r border-border flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <span className="text-sm font-semibold">카테고리</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === selectedCategoryId;
            const count =
              cat.id === "all"
                ? FAQ_ITEMS.length
                : FAQ_ITEMS.filter((f) => f.categoryId === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors text-left ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-xs font-mono px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── 우측: FAQ 목록 ───────────────────────────────────── */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* 검색창 헤더 */}
        <div className="px-5 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="질문 또는 답변 검색..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-muted/40 border border-border rounded-lg outline-none focus:border-primary/50 focus:bg-background transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* FAQ 아코디언 목록 */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {filteredFaqs.length === 0 ? (
            /* 빈 상태 */
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Inbox className="w-10 h-10 opacity-40" />
              <p className="text-sm font-medium">해당하는 FAQ가 없습니다</p>
              <p className="text-xs opacity-70">
                검색어 또는 카테고리를 변경해 보세요
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqIds.has(faq.id);
              const badgeClass =
                CATEGORY_BADGE_COLOR[faq.categoryId] ??
                "bg-muted text-muted-foreground border-border";

              return (
                <div
                  key={faq.id}
                  className="border border-border rounded-xl overflow-hidden bg-card transition-shadow hover:shadow-sm"
                >
                  {/* 질문 (클릭 시 펼침) */}
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      {/* 카테고리 뱃지 */}
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium mb-2 ${badgeClass}`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {faq.categoryLabel}
                      </span>
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {faq.question}
                      </p>
                    </div>
                    <div className="shrink-0 mt-0.5 text-muted-foreground">
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* 답변 (펼쳐지는 영역) */}
                  {isOpen && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="border-t border-border pt-4">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 하단 결과 수 표시 */}
        <div className="px-5 py-2 border-t border-border shrink-0 bg-background">
          <p className="text-xs text-muted-foreground">
            총{" "}
            <span className="font-semibold text-foreground">
              {filteredFaqs.length}
            </span>
            개의 FAQ
            {searchQuery && <span> — &quot;{searchQuery}&quot; 검색 결과</span>}
          </p>
        </div>
      </section>
    </div>
  );
}
