import { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Pencil,
  ImagePlus,
  X,
} from "lucide-react";
import {
  useSubIssues,
  useCreateSubIssue,
  useToggleSubIssue,
  useDeleteSubIssue,
  useUpdateSubIssue,
} from "../hooks/useSubIssues";
import { issueImageApi } from "@/entities/issue/api/issueImageApi";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { SubIssue } from "@/entities/issue/types/subIssue";

interface SubIssueSectionProps {
  issueId: number;
}

export function SubIssueSection({ issueId }: SubIssueSectionProps) {
  const { data: subIssues = [] } = useSubIssues(issueId);
  const createMutation = useCreateSubIssue(issueId);
  const toggleMutation = useToggleSubIssue(issueId);
  const deleteMutation = useDeleteSubIssue(issueId);

  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImagePreview, setNewImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolved = subIssues.filter((s) => s.isResolved).length;
  const total = subIssues.length;

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { presignedUrl, publicUrl } = await issueImageApi.getPresignedUrl(
        file.name,
        file.type || "image/*",
      );
      await issueImageApi.uploadToS3(presignedUrl, file);
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
              {resolved}/{total} 해결
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

      {/* 부가 이슈 목록 */}
      <div className="space-y-2">
        {subIssues.map((sub) => (
          <SubIssueItem
            key={sub.id}
            sub={sub}
            issueId={issueId}
            isExpanded={expandedIds.has(sub.id)}
            onToggleExpand={() => toggleExpand(sub.id)}
            onToggleResolved={() => toggleMutation.mutate(sub.id)}
            onDelete={() => deleteMutation.mutate(sub.id)}
          />
        ))}
      </div>

      {/* 새 부가 이슈 입력 폼 */}
      {isAdding && (
        <div className="mt-3 border rounded-lg bg-muted/30 overflow-hidden">
          {/* 이미지 업로드 영역 */}
          <div
            className="relative border-b bg-muted/50 min-h-[120px] flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => !newImagePreview && fileInputRef.current?.click()}
          >
            {newImagePreview ? (
              <div className="relative w-full">
                <img
                  src={newImagePreview}
                  alt="미리보기"
                  className="w-full max-h-48 object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewImageUrl("");
                    setNewImagePreview("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">업로드 중...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="w-8 h-8" />
                <span className="text-xs">클릭하여 이미지 업로드</span>
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

          {/* 설명 입력 */}
          <div className="p-3 space-y-3">
            <textarea
              autoFocus
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="설명을 입력하세요..."
              rows={2}
              className="w-full text-sm bg-background border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
      )}

      {total === 0 && !isAdding && (
        <p className="text-xs text-muted-foreground text-center py-4">
          부가 이슈가 없습니다. 추가 버튼으로 등록하세요.
        </p>
      )}
    </div>
  );
}

function SubIssueItem({
  sub,
  issueId,
  isExpanded,
  onToggleExpand,
  onToggleResolved,
  onDelete,
}: {
  sub: SubIssue;
  issueId: number;
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
  const updateMutation = useUpdateSubIssue(issueId, sub.id);

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const { presignedUrl, publicUrl } = await issueImageApi.getPresignedUrl(
        file.name,
        file.type || "image/*",
      );
      await issueImageApi.uploadToS3(presignedUrl, file);
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

  // 미리보기: 이미지 또는 설명 앞 30자
  const preview = sub.imageUrl
    ? "🖼️ 이미지 첨부됨"
    : sub.content
      ? sub.content.slice(0, 40) + (sub.content.length > 40 ? "..." : "")
      : "내용 없음";

  return (
    <div
      className={cn(
        "border rounded-lg transition-colors overflow-hidden",
        sub.isResolved ? "bg-muted/30 border-muted" : "bg-card",
      )}
    >
      {/* 헤더 행 */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={onToggleResolved} className="shrink-0">
          {sub.isResolved ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <Circle className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <span
          className={cn(
            "flex-1 text-sm truncate",
            sub.isResolved && "line-through text-muted-foreground",
          )}
        >
          {preview}
        </span>
        <div className="flex items-center gap-1 shrink-0">
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
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 펼쳐진 뷰 */}
      {isExpanded && !isEditing && (
        <div className="border-t">
          {sub.imageUrl && (
            <img
              src={sub.imageUrl}
              alt="첨부 이미지"
              className="w-full max-h-64 object-contain bg-muted/30"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          {sub.content && (
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {sub.content}
              </p>
            </div>
          )}
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground">
              {sub.authorName} ·{" "}
              {new Date(
                sub.createdAt.endsWith("Z")
                  ? sub.createdAt
                  : sub.createdAt + "Z",
              ).toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      )}

      {/* 편집 뷰 */}
      {isEditing && (
        <div className="border-t">
          {/* 이미지 업로드 */}
          <div
            className="relative border-b bg-muted/50 min-h-[100px] flex items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
            onClick={() => !editImagePreview && fileInputRef.current?.click()}
          >
            {editImagePreview ? (
              <div className="relative w-full">
                <img
                  src={editImagePreview}
                  alt="미리보기"
                  className="w-full max-h-48 object-contain"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditImageUrl("");
                    setEditImagePreview("");
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : isUploading ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">업로드 중...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="w-6 h-6" />
                <span className="text-xs">클릭하여 이미지 변경</span>
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

          {/* 설명 편집 */}
          <div className="p-3 space-y-2">
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={2}
              className="w-full text-sm bg-background border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
      )}
    </div>
  );
}
