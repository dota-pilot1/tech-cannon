import { useState } from "react";
import { useStore } from "@tanstack/react-store";
import { apiEnvStore } from "@/features/apidoc/model/apiEnvStore";
import type { ApiDocBlock } from "@/features/apidoc/api/apiDocApi";
import type {
  ApiBlockContent,
  ApiResponse,
} from "@/features/apidoc/types/apiDoc.types";
import {
  defaultApiBlockContent,
  METHOD_COLORS,
  getStatusColor,
  resolveEnvVars,
} from "@/features/apidoc/types/apiDoc.types";
import { Save } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface ApiTesterPanelProps {
  sectionId: number;
  sectionTitle: string;
  blocks: ApiDocBlock[];
  isAdmin: boolean;
  onSave: (content: ApiBlockContent) => void;
}

function parseBlockContent(blocks: ApiDocBlock[]): ApiBlockContent {
  const block = blocks.find((b) => b.blockType === "API");
  if (!block) return defaultApiBlockContent();
  try {
    return JSON.parse(block.content) as ApiBlockContent;
  } catch {
    return defaultApiBlockContent();
  }
}

export function ApiTesterPanel({
  sectionId,
  sectionTitle,
  blocks,
  isAdmin,
  onSave,
}: ApiTesterPanelProps) {
  const { environments, activeEnvId } = useStore(apiEnvStore, (s) => s);
  const activeEnv = environments.find((e) => e.id === activeEnvId);
  const envVarsMap = Object.fromEntries(
    (activeEnv?.variables ?? []).map((v) => [v.key, v.value]),
  );

  // 부모에서 key={sectionId} 를 전달하므로 섹션이 바뀌면 컴포넌트가 재마운트됨.
  // 따라서 useState 초기값만으로 충분하고 별도 effect 동기화가 불필요.
  const [apiContent, setApiContent] = useState<ApiBlockContent>(() =>
    parseBlockContent(blocks),
  );

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 추후 구현에서 사용할 레퍼런스 보존 (lint 억제)
  void sectionId;
  void resolveEnvVars;
  void envVarsMap;
  void getStatusColor;
  void METHOD_COLORS;
  void response;
  void isLoading;
  void setResponse;
  void setIsLoading;
  void setApiContent;

  const handleSave = () => {
    setIsSaving(true);
    onSave(apiContent);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 상단 툴바 */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card shrink-0">
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {sectionTitle}
        </span>
        {isAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            저장
          </Button>
        )}
      </div>

      {/* 본문 - 추후 구현 */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-4xl mb-3">🔌</p>
          <p className="text-sm font-medium">API 테스터 패널</p>
          <p className="text-xs mt-1">
            섹션을 선택하면 API 테스트를 실행할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
