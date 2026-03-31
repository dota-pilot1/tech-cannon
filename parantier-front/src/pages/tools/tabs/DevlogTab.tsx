export function DevlogTab() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">📔 개발 일지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          오늘의 개발 내용을 기록하세요.
        </p>
      </div>
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 rounded-lg w-fit">
        <span className="text-sm text-muted-foreground">🚧 준비 중입니다.</span>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
