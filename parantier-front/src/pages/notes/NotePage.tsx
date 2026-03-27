interface NotePageProps {
  category: string
  title: string
}

export function NotePage({ category, title }: NotePageProps) {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">{category} 관련 노트를 작성하고 관리할 수 있습니다.</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">노트 기능이 곧 추가될 예정입니다.</p>
        </div>
      </div>
    </div>
  )
}
