import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  FileText,
  Plus,
  Pencil,
  Trash2,
  FileSearch,
} from "lucide-react";

// ─── 더미 데이터 ─────────────────────────────────────────────
const DUMMY_TREE = [
  {
    id: "cat-1",
    label: "Spring Boot",
    docs: [
      {
        id: "doc-1",
        title: "Spring Security 설정 가이드",
        content: `# Spring Security 설정 가이드

Spring Security는 Spring 기반 애플리케이션의 인증(Authentication)과 인가(Authorization)를 담당하는 강력한 보안 프레임워크입니다.

## 의존성 추가

build.gradle에 다음 의존성을 추가합니다.

  implementation 'org.springframework.boot:spring-boot-starter-security'

## SecurityConfig 작성

SecurityFilterChain 빈을 등록하여 보안 정책을 정의합니다. 공개 경로와 인증 필요 경로를 명확히 구분하고, CSRF 설정, 세션 정책, JWT 필터 등록 등을 순서에 맞게 구성합니다.

## JWT 필터 등록

OncePerRequestFilter를 상속받아 JwtAuthenticationFilter를 구현한 뒤, UsernamePasswordAuthenticationFilter 앞에 추가합니다.

## 주의사항

- passwordEncoder는 반드시 BCryptPasswordEncoder를 사용하세요.
- @EnableMethodSecurity를 선언해야 @PreAuthorize가 동작합니다.
- CORS 설정은 Spring Security 레벨에서 처리해야 합니다.`,
      },
      {
        id: "doc-2",
        title: "JPA 엔티티 설계 패턴",
        content: `# JPA 엔티티 설계 패턴

JPA 엔티티는 데이터베이스 테이블과 매핑되는 도메인 객체입니다. 올바른 설계는 유지보수성과 성능 모두에 영향을 미칩니다.

## 기본 애노테이션 구조

  @Entity
  @Table(name = "users")
  @Getter
  @NoArgsConstructor(access = AccessLevel.PROTECTED)
  @Builder
  public class User { ... }

## 생성자 전략

- 기본 생성자는 protected로 막아 외부에서 new User()를 방지합니다.
- @Builder 패턴으로 명시적인 객체 생성을 유도합니다.

## BaseEntity 활용

createdAt, updatedAt 등 공통 필드는 @MappedSuperclass로 분리하여 모든 엔티티에서 상속받습니다.

## 연관관계 설정

- 양방향 연관관계는 꼭 필요한 경우에만 설정합니다.
- 연관관계 편의 메서드를 엔티티 내부에 작성합니다.
- FetchType은 기본적으로 LAZY를 사용합니다.`,
      },
      {
        id: "doc-3",
        title: "REST API 응답 구조",
        content: `# REST API 응답 구조

일관된 API 응답 구조는 클라이언트 개발 생산성과 유지보수성을 크게 향상시킵니다.

## 공통 응답 래퍼

성공/실패 여부, 상태 코드, 메시지, 데이터를 포함하는 ApiResponse<T> 제네릭 클래스를 정의합니다.

## HTTP 상태 코드 활용

- 200 OK : 조회 성공
- 201 Created : 생성 성공
- 204 No Content : 삭제 성공
- 400 Bad Request : 유효성 검증 실패
- 401 Unauthorized : 인증 실패
- 403 Forbidden : 권한 없음
- 404 Not Found : 리소스 없음

## 예외 처리

@RestControllerAdvice와 @ExceptionHandler를 사용하여 전역 예외 처리기를 구성합니다. 커스텀 예외 클래스 계층을 만들어 비즈니스 예외와 시스템 예외를 분리하세요.`,
      },
    ],
  },
  {
    id: "cat-2",
    label: "React",
    docs: [
      {
        id: "doc-4",
        title: "컴포넌트 설계 원칙",
        content: `# 컴포넌트 설계 원칙

좋은 React 컴포넌트는 단일 책임 원칙을 따르고, 재사용 가능하며, 테스트하기 쉬워야 합니다.

## 단일 책임 원칙

하나의 컴포넌트는 하나의 역할만 담당합니다. UI 렌더링과 비즈니스 로직은 Custom Hook으로 분리합니다.

## 합성 패턴 활용

props drilling 없이 컴포넌트를 조합하려면 Context API 또는 children prop을 활용합니다.

## Props 타입 정의

TypeScript interface로 Props 타입을 명확히 정의합니다. 선택적 props에는 기본값을 제공하세요.

## 메모이제이션

- React.memo : 동일한 props 시 리렌더 방지
- useMemo : 비용이 큰 연산 캐싱
- useCallback : 이벤트 핸들러 안정화

무분별한 메모이제이션은 오히려 성능을 저하시킬 수 있으므로, 실제 성능 문제가 발생할 때 적용하세요.`,
      },
      {
        id: "doc-5",
        title: "TanStack Query 사용법",
        content: `# TanStack Query 사용법

TanStack Query(구 React Query)는 서버 상태 관리를 위한 강력한 라이브러리입니다.

## 기본 설정

QueryClient와 QueryClientProvider를 앱 최상단에 설정합니다.

## useQuery

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', postId],
    queryFn: () => fetchPost(postId),
    staleTime: 1000 * 60 * 5, // 5분
  });

## useMutation

데이터 생성·수정·삭제에 useMutation을 사용합니다. onSuccess 콜백에서 queryClient.invalidateQueries()를 호출하여 관련 캐시를 갱신합니다.

## 캐시 전략

- staleTime : 데이터가 신선하다고 간주되는 시간
- gcTime : 캐시에서 제거되기까지의 시간
- refetchOnWindowFocus : 탭 복귀 시 재요청 여부`,
      },
    ],
  },
];
// ─────────────────────────────────────────────────────────────

type Doc = {
  id: string;
  title: string;
  content: string;
};

export default function SubutaiDocuPage() {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["cat-1", "cat-2"]),
  );
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const selectedDoc: Doc | null =
    DUMMY_TREE.flatMap((cat) => cat.docs).find(
      (doc) => doc.id === selectedDocId,
    ) ?? null;

  return (
    <div
      className="flex bg-background text-foreground"
      style={{ height: "calc(100vh - 64px)" }}
    >
      {/* ── 좌측: 문서 트리 ──────────────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-border flex flex-col overflow-hidden">
        {/* 트리 헤더 */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-sm font-semibold">문서 관리</span>
          <button
            className="flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors"
            onClick={() => alert("더미 기능: 새 문서 추가")}
          >
            <Plus className="w-3.5 h-3.5" />
            추가
          </button>
        </div>

        {/* 카테고리 + 문서 트리 */}
        <div className="flex-1 overflow-y-auto py-2">
          {DUMMY_TREE.map((cat) => {
            const isOpen = expandedCats.has(cat.id);
            return (
              <div key={cat.id} className="mb-1">
                {/* 카테고리 헤더 */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors text-left"
                >
                  {isOpen ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    </>
                  )}
                  <span className="truncate">{cat.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground font-mono shrink-0">
                    {cat.docs.length}
                  </span>
                </button>

                {/* 문서 목록 */}
                {isOpen && (
                  <div className="ml-7 border-l border-border pl-2 space-y-0.5">
                    {cat.docs.map((doc) => {
                      const isSelected = doc.id === selectedDocId;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocId(doc.id)}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors text-left ${
                            isSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <FileText
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isSelected
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          />
                          <span className="truncate">{doc.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── 우측: 문서 뷰어 ──────────────────────────────────── */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            {/* 문서 뷰어 헤더 */}
            <div className="px-6 py-3 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <h1 className="text-base font-semibold truncate">
                  {selectedDoc.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={() => alert("더미 기능: 문서 수정")}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  수정
                </button>
                <button
                  onClick={() => alert("더미 기능: 문서 삭제")}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  삭제
                </button>
              </div>
            </div>

            {/* 문서 내용 */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <article className="max-w-3xl mx-auto">
                {selectedDoc.content.split("\n").map((line, idx) => {
                  if (line.startsWith("# ")) {
                    return (
                      <h1
                        key={idx}
                        className="text-2xl font-bold text-foreground mb-4 mt-0"
                      >
                        {line.replace("# ", "")}
                      </h1>
                    );
                  }
                  if (line.startsWith("## ")) {
                    return (
                      <h2
                        key={idx}
                        className="text-lg font-semibold text-foreground mt-8 mb-3 pb-1.5 border-b border-border"
                      >
                        {line.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (line.startsWith("- ")) {
                    return (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground leading-relaxed ml-4 mb-1 list-disc"
                      >
                        {line.replace("- ", "")}
                      </li>
                    );
                  }
                  if (line.match(/^\s{2}/)) {
                    return (
                      <pre
                        key={idx}
                        className="block bg-muted/50 border border-border rounded-md px-4 py-2 text-xs font-mono text-foreground my-2"
                      >
                        {line.trim()}
                      </pre>
                    );
                  }
                  if (line === "") {
                    return <div key={idx} className="h-2" />;
                  }
                  return (
                    <p
                      key={idx}
                      className="text-sm text-muted-foreground leading-relaxed mb-1"
                    >
                      {line}
                    </p>
                  );
                })}
              </article>
            </div>
          </>
        ) : (
          /* 미선택 빈 상태 */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center">
              <FileSearch className="w-8 h-8 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium mb-1">문서를 선택하세요</p>
              <p className="text-xs opacity-70">
                좌측 트리에서 열람할 문서를 클릭하세요
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
