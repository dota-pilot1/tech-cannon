import { useState } from "react";
import { Copy, Check } from "lucide-react";

const snippets = [
  {
    id: 1,
    title: "Git 브랜치 일괄 삭제",
    lang: "Shell",
    code: "git branch | grep -v 'main' | xargs git branch -D",
    tags: ["git", "브랜치"],
  },
  {
    id: 2,
    title: "로컬스토리지 초기화",
    lang: "JavaScript",
    code: "localStorage.clear()",
    tags: ["localStorage", "초기화"],
  },
  {
    id: 3,
    title: "Docker 컨테이너 전체 중지",
    lang: "Shell",
    code: "docker stop $(docker ps -aq)",
    tags: ["docker"],
  },
  {
    id: 4,
    title: "날짜 포맷 함수",
    lang: "TypeScript",
    code: "const fmt = (d: Date) => d.toISOString().slice(0,10)",
    tags: ["date", "utils"],
  },
];

const categories = ["전체", "JavaScript", "Shell"];

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={[
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0",
        copied
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      ].join(" ")}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          복사됨!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          복사
        </>
      )}
    </button>
  );
}

export function SnippetTab() {
  const [selectedCategory, setSelectedCategory] = useState("전체");

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">📝 코드 스니펫</h1>
        <p className="text-sm text-muted-foreground mt-1">
          자주 쓰는 코드 스니펫을 저장하고 공유하세요.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-2 mb-5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={[
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 스니펫 카드 목록 */}
      <ul className="space-y-3 mb-6">
        {snippets.map((snippet) => (
          <li
            key={snippet.id}
            className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            {/* 카드 상단: 제목 + 언어 배지 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-foreground">
                {snippet.title}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0">
                {snippet.lang}
              </span>
            </div>

            {/* 코드 블록 */}
            <div className="flex items-start gap-3 mb-3">
              <code className="flex-1 block bg-muted rounded-md p-2 text-xs font-mono text-foreground break-all">
                {snippet.code}
              </code>
              <CopyButton code={snippet.code} />
            </div>

            {/* 태그 */}
            <div className="flex flex-wrap gap-1.5">
              {snippet.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Coming Soon 배너 */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm">🚧</span>
          <span className="text-sm text-muted-foreground">
            스니펫 저장 및 공유 기능은 준비 중입니다.
          </span>
        </div>
        <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary shrink-0">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
