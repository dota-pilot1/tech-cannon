import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  useWorks,
  useCreateWork,
  useUpdateWorkStatus,
} from "@/features/work/hooks/useWorks";
import { WorkKanbanView } from "@/features/work/components/WorkKanbanView";
import { WorkDetailDialog } from "@/features/work/components/WorkDetailDialog";
import { useAllUsers } from "@/features/user/hooks/useAllUsers";
import type {
  WorkStatus,
  WorkPriority,
  WorkType,
} from "@/entities/work/types/work";
import { toast } from "sonner";

// ─── 상수 ────────────────────────────────────────────────────────────────

const WORK_TYPE_LABELS: Record<string, string> = {
  APACHE: "🚁 아파치", DRONE: "🛸 드론", SNIPER: "🎯 저격총",
  HAMMER: "🔨 망치", ROCKET: "🚀 로켓", MISSILE: "💥 미사일",
  CANNON: "💣 캐논", SPEAR: "🔫 작살", SHIP: "⛵ 배", BOOK: "📚 책",
};



const PRIORITY_LABELS: Record<WorkPriority, string> = {
  LOW: "낮음", MEDIUM: "보통", HIGH: "높음", CRITICAL: "긴급",
};

const PRIORITY_COLORS: Record<WorkPriority, string> = {
  CRITICAL: "bg-red-200 text-red-800", HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-yellow-100 text-yellow-700", LOW: "bg-gray-100 text-gray-600",
};

// ─── Page Component ──────────────────────────────────────────────────────

export function WorkKanbanPage() {
  const navigate = useNavigate();

  // 필터
  const [filterWorkType, setFilterWorkType] = useState<string>("ALL");
  const [filterPriority, setFilterPriority] = useState<string>("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");

  // 상세 다이얼로그
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 새 업무
  const [isNewWorkOpen, setIsNewWorkOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formWorkType, setFormWorkType] = useState<WorkType>("APACHE");
  const [formPriority, setFormPriority] = useState<WorkPriority>("MEDIUM");
  const [formAssigneeId, setFormAssigneeId] = useState<number | null>(null);

  // API
  const { data: worksData } = useWorks({
    workType: filterWorkType === "ALL" ? undefined : (filterWorkType as WorkType),
    keyword: searchKeyword || undefined,
    sortBy: "created",
    isArchived: false,
  });

  const { mutate: createWork } = useCreateWork();
  const { mutate: updateStatus } = useUpdateWorkStatus();
  const { data: usersData } = useAllUsers();
  const users = usersData || [];

  const works = useMemo(() => {
    let allWorks = worksData?.items || [];
    if (filterPriority !== "ALL") {
      allWorks = allWorks.filter((w) => w.priority === filterPriority);
    }
    return allWorks;
  }, [worksData, filterPriority]);

  // 상태별 카운트
  const totalCount = worksData?.items?.length || 0;

  const handleNew = () => {
    setFormTitle(""); setFormContent(""); setFormWorkType("APACHE");
    setFormPriority("MEDIUM"); setFormAssigneeId(null);
    setIsNewWorkOpen(true);
  };

  const handleCreateWork = () => {
    if (!formTitle.trim()) { toast.error("제목을 입력하세요"); return; }
    createWork(
      { title: formTitle, content: formContent, workType: formWorkType, status: "TODO" as WorkStatus, priority: formPriority, assigneeId: formAssigneeId, dueDate: null },
      { onSuccess: () => { setIsNewWorkOpen(false); toast.success("업무가 생성되었습니다"); } },
    );
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* ── 헤더 ── */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold mr-1">업무 관리</h1>
          {/* 뷰 토글 */}
          <div className="flex items-center bg-muted rounded-lg p-0.5 mr-1 text-xs">
            <button onClick={() => navigate({ to: "/work" })} className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground font-medium transition-colors">
              목록
            </button>
            <button onClick={() => navigate({ to: "/work/card" })} className="px-2.5 py-1 rounded-md text-muted-foreground hover:text-foreground font-medium transition-colors">
              카드
            </button>
            <button className="px-2.5 py-1 rounded-md bg-foreground text-background font-semibold transition-colors">
              칸반
            </button>
          </div>

          {/* 전체 카운트 */}
          <span className="text-sm text-muted-foreground">전체 {totalCount}</span>

          <div className="w-px h-5 bg-border" />

          {/* 유형 필터 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                유형
                {filterWorkType !== "ALL" && <span className="ml-0.5 font-bold text-primary">· {WORK_TYPE_LABELS[filterWorkType]}</span>}
                <ChevronDown className="w-3 h-3 ml-0.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuItem onClick={() => setFilterWorkType("ALL")} className={filterWorkType === "ALL" ? "font-bold text-primary" : ""}>전체</DropdownMenuItem>
              {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((type) => (
                <DropdownMenuItem key={type} onClick={() => setFilterWorkType(type)} className={filterWorkType === type ? "font-bold text-primary" : ""}>
                  {WORK_TYPE_LABELS[type]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 우선순위 필터 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                우선순위
                {filterPriority !== "ALL" && <span className={cn("ml-0.5 font-bold", PRIORITY_COLORS[filterPriority as WorkPriority])}>· {PRIORITY_LABELS[filterPriority as WorkPriority]}</span>}
                <ChevronDown className="w-3 h-3 ml-0.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36">
              <DropdownMenuItem onClick={() => setFilterPriority("ALL")} className={filterPriority === "ALL" ? "font-bold text-primary" : ""}>전체</DropdownMenuItem>
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as WorkPriority[]).map((p) => (
                <DropdownMenuItem key={p} onClick={() => setFilterPriority(p)} className={cn(filterPriority === p ? "font-bold" : "", PRIORITY_COLORS[p])}>
                  {PRIORITY_LABELS[p]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-5 bg-border" />

          {/* 검색 */}
          <div className="relative group">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input type="text" placeholder="제목 검색..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-input rounded-md text-sm h-9 w-48 focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all bg-background/50 hover:bg-background" />
          </div>

          <div className="flex-1" />

          <Button onClick={handleNew} size="sm" className="bg-[#0f172a] hover:bg-[#1e293b]">
            <Plus className="w-4 h-4 mr-1" />새 업무
          </Button>
        </div>
      </div>

      {/* ── 칸반 뷰 ── */}
      <div className="flex-1 overflow-hidden">
        <WorkKanbanView
          works={works}
          onWorkClick={(workId) => { setSelectedWorkId(workId); setIsDetailOpen(true); }}
          onStatusChange={(workId, newStatus) => { updateStatus({ id: workId, status: newStatus }); }}
        />
      </div>

      {/* ── 새 업무 Dialog ── */}
      <Dialog open={isNewWorkOpen} onOpenChange={setIsNewWorkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>새 업무 작성</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium mb-1.5">제목 <span className="text-destructive">*</span></label>
              <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-ring" placeholder="업무 제목을 입력하세요" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">유형</label>
                <Select value={formWorkType} onValueChange={(v) => setFormWorkType(v as WorkType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((t) => (<SelectItem key={t} value={t}>{WORK_TYPE_LABELS[t]}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">우선순위</label>
                <Select value={formPriority} onValueChange={(v) => setFormPriority(v as WorkPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as WorkPriority[]).map((p) => (<SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">담당자</label>
              <Select value={formAssigneeId?.toString() || "__none__"} onValueChange={(v) => setFormAssigneeId(v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">미지정</SelectItem>
                  {users.map((u) => (<SelectItem key={u.id} value={u.id.toString()}>{u.username}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewWorkOpen(false)}>취소</Button>
            <Button onClick={handleCreateWork}>생성</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WorkDetailDialog
        workId={selectedWorkId}
        open={isDetailOpen}
        onOpenChange={(open) => { setIsDetailOpen(open); if (!open) setSelectedWorkId(null); }}
      />
    </div>
  );
}
