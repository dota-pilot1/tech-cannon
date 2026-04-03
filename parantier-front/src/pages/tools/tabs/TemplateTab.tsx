export function TemplateTab() {
  const templates = [
    {
      icon: "📄",
      title: "일일 스탠드업 양식",
      desc: "어제/오늘/블로커 형식의 데일리 스탠드업 회의록 템플릿",
      tags: ["회의", "스탠드업"],
    },
    {
      icon: "🐛",
      title: "버그 리포트 양식",
      desc: "재현 방법, 기대 동작, 실제 동작을 정리하는 버그 리포트 템플릿",
      tags: ["버그", "이슈"],
    },
    {
      icon: "📋",
      title: "PR 설명 양식",
      desc: "변경 사항, 테스트 방법, 스크린샷을 포함한 PR 설명 템플릿",
      tags: ["PR", "코드리뷰"],
    },
  ];

  return (
    <div className="p-6 flex flex-col h-full">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">🗂️ 템플릿</h1>
        <p className="text-sm text-muted-foreground mt-1">
          반복 사용하는 문서/코드 템플릿을 관리하세요.
        </p>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {templates.map((tpl) => (
          <div
            key={tpl.title}
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors"
          >
            {/* 아이콘 + 제목 */}
            <div>
              <span className="text-2xl">{tpl.icon}</span>
              <h3 className="mt-2 text-sm font-semibold text-foreground leading-snug">
                {tpl.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {tpl.desc}
              </p>
            </div>

            {/* 태그 + 버튼 */}
            <div className="mt-4">
              <div className="flex flex-wrap gap-1 mb-3">
                {tpl.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button className="w-full text-xs font-medium py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                사용하기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon 배너 */}
      <div className="mt-5 flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
        <span className="text-sm text-muted-foreground">🚧 템플릿 기능은 현재 준비 중입니다.</span>
        <span className="ml-auto text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium shrink-0">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
