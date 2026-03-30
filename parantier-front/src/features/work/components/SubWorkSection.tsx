import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Pencil,
  ImagePlus,
  X,
} from "lucide-react";
import {
  useSubWorks,
  useCreateSubWork,
  useToggleSubWork,
  useDeleteSubWork,
  useUpdateSubWork,
} from "../hooks/useSubWorks";
import { workImageApi } from "@/entities/work/api/workImageApi";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { SubWork } from "@/entities/work/types/subWork";

interface SubWorkSectionProps {
  workId: number;
}

export function SubWorkSection({ workId }: SubWorkSectionProps) {
  const { data: subWorks = [] } = useSubWorks(workId);
  const createMutation = useCreateSubWork(workId);
  const toggleMutation = useToggleSubWork(workId);
  const deleteMutation = useDeleteSubWork(workId);

  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImagePreview, setNewImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolved = subWorks.filter((s) => s.isResolved).length;
  const total = subWorks.length;

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { presignedUrl, publicUrl } = await workImageApi.getPresignedUrl(
        file.name,
        file.type || "image/*",
      );
      await workImageApi.uploadToS3(presignedUrl, file);
      setNewImageUrl(publicUrl);
      setNewImagePreview(URL.createObjectURL(file));
    } catch {
      // silent
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = () => {
    if (!newDescription.trim() && !newImageUrl) return;
    createMutation.mutate(
      {
        title: "",
        content: newDescription.trim() || undefined,
        imageUrl: newImageUrl || undefined,
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          setNewDescription("");
          setNewImageUrl("");
          setNewImagePreview("");
        },
      },
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {total > 0 && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {resolved}/{total} 완료
            </span>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          추가
        </Button>
      </div>

      {/* 진행률 바 */}
      {total > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5 mb-3">
          <div
            className="bg-primary h-1.5 rounded-full transition-all"
            style={{ width: `${(resolved / total) * 100}%` }}
          />
        </div>
      )}

      {/* 부가 업무 목록 */}
      <div className="space-y-2">
        {subWorks.map((sub) => (
          <SubWorkItem
            key={sub.id}
            sub={sub}
            workId={workId}
            isExpanded={expandedIds.has(sub.id)}
            onToggleExpand={() => toggleExpand(sub.id)}
            onToggleResolved={() => toggleMutation.mutate(sub.id)}
            onDelete={() => deleteMutation.mutate(sub.id)}
          />
        ))}
      </div>

      {/* 새 부가 업무 입력 폼 */}
      {isAdding && (
        <div className="mt-3 border rounded-lg bg-muted/30 overflow-hidden">
          <div className="flex gap-3 p-3">
            {/* 왼쪽: 정사각형 이미지 업로드 */}
            <div
              className="relative shrink-0 w-24 h-24 rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors overflow-hidden"
              onClick={() => !newImagePreview && fileInputRef.current?.click()}
            >
              {newImagePreview ? (
                <>
                  <img
                    src={newImagePreview}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewImageUrl("");
                      setNewImagePreview("");
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : isUploading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-[10px] text-center leading-tight">
                    이미지
                    <br />
                    업로드
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            {/* 오른쪽: 설명 + 버튼 */}
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                autoFocus
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="설명을 입력하세요..."
                rows={3}
                className="flex-1 w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewDescription("");
                    setNewImageUrl("");
                    setNewImagePreview("");
                  }}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={
                    (!newDescription.trim() && !newImageUrl) ||
                    createMutation.isPending ||
                    isUploading
                  }
                >
                  추가
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {total === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground text-center py-4">
          부가 업무가 없습니다. 추가 버튼으로 등록하세요.
        </p>
      )}
    </div>
  );
}

function SubWorkItem({
  sub,
  workId,
  isExpanded,
  onToggleExpand,
  onToggleResolved,
  onDelete,
}: {
  sub: SubWork;
  workId: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleResolved: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(sub.content || "");
  const [editImageUrl, setEditImageUrl] = useState(sub.imageUrl || "");
  const [editImagePreview, setEditImagePreview] = useState(sub.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateSubWork(workId, sub.id);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { presignedUrl, publicUrl } = await workImageApi.getPresignedUrl(
        file.name,
        file.type || "image/*",
      );
      await workImageApi.uploadToS3(presignedUrl, file);
      setEditImageUrl(publicUrl);
      setEditImagePreview(URL.createObjectURL(file));
    } catch {
      // silent
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = () => {
    updateMutation.mutate(
      {
        title: "",
        content: editDescription || undefined,
        imageUrl: editImageUrl || undefined,
        isResolved: sub.isResolved,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  return (
    <div
      className={cn(
        "border rounded-lg transition-colors overflow-hidden",
        sub.isResolved ? "bg-muted/30 border-muted" : "bg-card",
      )}
    >
      {/* 카드 행: 정사각형 이미지 + 설명 */}
      <div className="flex gap-3 p-3">
        {/* 왼쪽: 정사각형 이미지 썸네일 */}
        <div
          className="shrink-0 w-16 h-16 rounded-lg border bg-muted/40 overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={sub.imageUrl ? onToggleExpand : undefined}
        >
          {sub.imageUrl ? (
            <img
              src={sub.imageUrl}
              alt="첨부 이미지"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <ImagePlus className="w-5 h-5 text-muted-foreground/40" />
          )}
        </div>

        {/* 오른쪽: 설명 + 액션 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start gap-1">
            <button onClick={onToggleResolved} className="shrink-0 mt-0.5">
              {sub.isResolved ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <p
              className={cn(
                "flex-1 text-sm leading-snug",
                sub.isResolved
                  ? "line-through text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {sub.content || (
                <span className="text-muted-foreground/50 italic">
                  설명 없음
                </span>
              )}
            </p>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isExpanded) onToggleExpand();
                }}
                className="p-1 hover:bg-muted rounded"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button onClick={onDelete} className="p-1 hover:bg-muted rounded">
                <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 pl-5">
            {sub.authorName} ·{" "}
            {new Date(
              sub.createdAt.endsWith("Z") ? sub.createdAt : sub.createdAt + "Z",
            ).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {/* 펼쳐진 뷰 - 이미지 크게 보기 */}
      {isExpanded && !isEditing && sub.imageUrl && (
        <div className="border-t">
          <img
            src={sub.imageUrl}
            alt="첨부 이미지"
            className="w-full max-h-64 object-contain bg-muted/30"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
      )}

      {/* 편집 뷰 */}
      {isEditing && (
        <div className="border-t p-3">
          <div className="flex gap-3">
            {/* 왼쪽: 정사각형 이미지 편집 */}
            <div
              className="relative shrink-0 w-24 h-24 rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors overflow-hidden"
              onClick={() => !editImagePreview && fileInputRef.current?.click()}
            >
              {editImagePreview ? (
                <>
                  <img
                    src={editImagePreview}
                    alt="미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditImageUrl("");
                      setEditImagePreview("");
                    }}
                    className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : isUploading ? (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-[10px] text-center leading-tight">
                    이미지
                    <br />
                    변경
                  </span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </div>

            {/* 오른쪽: 설명 편집 + 버튼 */}
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                autoFocus
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="flex-1 w-full text-sm bg-background border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="설명"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={updateMutation.isPending || isUploading}
                >
                  저장
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
