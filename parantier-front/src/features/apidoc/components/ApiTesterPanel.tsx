import { useState, useEffect } from "react";
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

interface ApiTesterPanelProps {
  sectionId: number;
  blocks: ApiDocBlock[];
  isAdmin: boolean;
  onSave: (content: ApiBlockContent) => void;
  onRegisterSave?: (fn: () => void) => void;
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
  blocks,
  isAdmin,
  onSave,
  onRegisterSave,
}: ApiTesterPanelProps) {
  const { environments, activeEnvId } = useStore(apiEnvStore, (s) => s);
  const activeEnv = environments.find((e) => e.id === activeEnvId);
  const envVarsMap = Object.fromEntries(
    (activeEnv?.variables ?? []).map((v) => [v.key, v.value]),
  );

  // 부모에서 key={sectionId} 를 전달하므로 섹션이 바뀌면 재마운트됨
  const [apiContent, setApiContent] = useState<ApiBlockContent>(() =>
    parseBlockContent(blocks),
  );

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 부모가 저장 버튼을 눌렀을 때 현재 apiContent를 저장하도록 fn 등록
  useEffect(() => {
    if (onRegisterSave) {
      onRegisterSave(() => {
        onSave(apiContent);
      });
    }
  }, [apiContent, onSave, onRegisterSave]);

  // 추후 구현에서 사용 (lint 억제)
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
  void isAdmin;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 본문 - 추후 구현 */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-4xl mb-3">🔌</p>
          <p className="text-sm font-medium">API 테스터 패널</p>
          <p className="text-xs mt-1">
            곧 URL 입력 / 헤더 설정 / 바디 입력 / 실행 / 응답 확인 기능이
            추가됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
