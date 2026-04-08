package com.mapo.palantier.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // ── 인증 관련 (401) ──────────────────────────────────────────────────────
    AUTHENTICATION_FAILED(
        "AUTHENTICATION_FAILED",
        "인증에 실패했습니다",
        HttpStatus.UNAUTHORIZED
    ),
    INVALID_CREDENTIALS(
        "INVALID_CREDENTIALS",
        "이메일 또는 비밀번호가 일치하지 않습니다",
        HttpStatus.UNAUTHORIZED
    ),
    INVALID_TOKEN(
        "INVALID_TOKEN",
        "유효하지 않은 토큰입니다",
        HttpStatus.UNAUTHORIZED
    ),
    EXPIRED_TOKEN(
        "EXPIRED_TOKEN",
        "만료된 토큰입니다",
        HttpStatus.UNAUTHORIZED
    ),
    INVALID_TOKEN_TYPE(
        "INVALID_TOKEN_TYPE",
        "잘못된 토큰 타입입니다",
        HttpStatus.UNAUTHORIZED
    ),
    REFRESH_TOKEN_NOT_FOUND(
        "REFRESH_TOKEN_NOT_FOUND",
        "리프레시 토큰을 찾을 수 없습니다",
        HttpStatus.UNAUTHORIZED
    ),

    // ── 권한 관련 (403) ──────────────────────────────────────────────────────
    ACCOUNT_INACTIVE(
        "ACCOUNT_INACTIVE",
        "비활성화된 계정입니다",
        HttpStatus.FORBIDDEN
    ),
    ACCESS_DENIED(
        "ACCESS_DENIED",
        "접근 권한이 없습니다",
        HttpStatus.FORBIDDEN
    ),
    FORBIDDEN_UPDATE(
        "FORBIDDEN_UPDATE",
        "수정 권한이 없습니다",
        HttpStatus.FORBIDDEN
    ),
    FORBIDDEN_DELETE(
        "FORBIDDEN_DELETE",
        "삭제 권한이 없습니다",
        HttpStatus.FORBIDDEN
    ),

    // ── 리소스 관련 (404) ────────────────────────────────────────────────────
    // user
    USER_NOT_FOUND(
        "USER_NOT_FOUND",
        "사용자를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // task
    TASK_POST_NOT_FOUND(
        "TASK_POST_NOT_FOUND",
        "게시글을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    TASK_FOLDER_NOT_FOUND(
        "TASK_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    TASK_COMMENT_NOT_FOUND(
        "TASK_COMMENT_NOT_FOUND",
        "댓글을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // wiki
    WIKI_POST_NOT_FOUND(
        "WIKI_POST_NOT_FOUND",
        "문서를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    WIKI_FOLDER_NOT_FOUND(
        "WIKI_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // apidoc
    APIDOC_CATEGORY_NOT_FOUND(
        "APIDOC_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    APIDOC_SECTION_NOT_FOUND(
        "APIDOC_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // architecture
    ARCHITECTURE_CATEGORY_NOT_FOUND(
        "ARCHITECTURE_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    ARCHITECTURE_SECTION_NOT_FOUND(
        "ARCHITECTURE_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // authority / role
    AUTHORITY_NOT_FOUND(
        "AUTHORITY_NOT_FOUND",
        "권한을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    AUTHORITY_CATEGORY_NOT_FOUND(
        "AUTHORITY_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    ROLE_NOT_FOUND(
        "ROLE_NOT_FOUND",
        "역할을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // chat
    CHAT_ROOM_NOT_FOUND(
        "CHAT_ROOM_NOT_FOUND",
        "채팅방을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // core
    CORE_CATEGORY_NOT_FOUND(
        "CORE_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    CORE_SECTION_NOT_FOUND(
        "CORE_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // security
    SECURITY_CATEGORY_NOT_FOUND(
        "SECURITY_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    SECURITY_SECTION_NOT_FOUND(
        "SECURITY_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // devops
    DEVOPS_CATEGORY_NOT_FOUND(
        "DEVOPS_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    DEVOPS_SECTION_NOT_FOUND(
        "DEVOPS_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // springai
    SPRINGAI_CATEGORY_NOT_FOUND(
        "SPRINGAI_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    SPRINGAI_SECTION_NOT_FOUND(
        "SPRINGAI_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // db
    DB_FOLDER_NOT_FOUND(
        "DB_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    DB_POST_NOT_FOUND(
        "DB_POST_NOT_FOUND",
        "문서를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // devlog
    DEVLOG_NOT_FOUND(
        "DEVLOG_NOT_FOUND",
        "개발 일지를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // faq
    FAQ_CATEGORY_NOT_FOUND(
        "FAQ_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    FAQ_SECTION_NOT_FOUND(
        "FAQ_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // figma
    FIGMA_CATEGORY_NOT_FOUND(
        "FIGMA_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    FIGMA_LINK_NOT_FOUND(
        "FIGMA_LINK_NOT_FOUND",
        "링크를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // frontend
    FRONTEND_CATEGORY_NOT_FOUND(
        "FRONTEND_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    FRONTEND_SECTION_NOT_FOUND(
        "FRONTEND_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // hackathon
    HACKATHON_CATEGORY_NOT_FOUND(
        "HACKATHON_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    HACKATHON_SECTION_NOT_FOUND(
        "HACKATHON_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    HACKATHON_TEAM_NOT_FOUND(
        "HACKATHON_TEAM_NOT_FOUND",
        "팀을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // memo
    MEMO_NOT_FOUND(
        "MEMO_NOT_FOUND",
        "메모를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // personal bookmark
    BOOKMARK_NOT_FOUND(
        "BOOKMARK_NOT_FOUND",
        "즐겨찾기를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // pilot
    PILOT_FOLDER_NOT_FOUND(
        "PILOT_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    PILOT_POST_NOT_FOUND(
        "PILOT_POST_NOT_FOUND",
        "게시글을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // prompt
    PROMPT_NOT_FOUND(
        "PROMPT_NOT_FOUND",
        "프롬프트를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    PROMPT_FOLDER_NOT_FOUND(
        "PROMPT_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // prototype
    PROTO_FOLDER_NOT_FOUND(
        "PROTO_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    PROTO_POST_NOT_FOUND(
        "PROTO_POST_NOT_FOUND",
        "문서를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // study
    STUDY_POST_NOT_FOUND(
        "STUDY_POST_NOT_FOUND",
        "게시글을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // subutai
    SUBUTAI_FOLDER_NOT_FOUND(
        "SUBUTAI_FOLDER_NOT_FOUND",
        "폴더를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    SUBUTAI_POST_NOT_FOUND(
        "SUBUTAI_POST_NOT_FOUND",
        "게시글을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    SUBUTAI_DOC_NOT_FOUND(
        "SUBUTAI_DOC_NOT_FOUND",
        "문서를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    SUBUTAI_FAQ_CATEGORY_NOT_FOUND(
        "SUBUTAI_FAQ_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    SUBUTAI_FAQ_SECTION_NOT_FOUND(
        "SUBUTAI_FAQ_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // table preset
    TABLE_PRESET_NOT_FOUND(
        "TABLE_PRESET_NOT_FOUND",
        "프리셋을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // challenge
    CHALLENGE_CATEGORY_NOT_FOUND(
        "CHALLENGE_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    CHALLENGE_SECTION_NOT_FOUND(
        "CHALLENGE_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    CHALLENGE_SUBMISSION_NOT_FOUND(
        "CHALLENGE_SUBMISSION_NOT_FOUND",
        "제출을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    // textbook
    TEXTBOOK_CATEGORY_NOT_FOUND(
        "TEXTBOOK_CATEGORY_NOT_FOUND",
        "카테고리를 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),
    TEXTBOOK_SECTION_NOT_FOUND(
        "TEXTBOOK_SECTION_NOT_FOUND",
        "섹션을 찾을 수 없습니다",
        HttpStatus.NOT_FOUND
    ),

    // ── 중복 관련 (409) ──────────────────────────────────────────────────────
    DUPLICATE_EMAIL(
        "DUPLICATE_EMAIL",
        "이미 사용 중인 이메일입니다",
        HttpStatus.CONFLICT
    ),
    DUPLICATE_AUTHORITY(
        "DUPLICATE_AUTHORITY",
        "이미 보유한 권한입니다",
        HttpStatus.CONFLICT
    ),
    DUPLICATE_ROLE(
        "DUPLICATE_ROLE",
        "이미 존재하는 역할입니다",
        HttpStatus.CONFLICT
    ),
    DUPLICATE_CATEGORY(
        "DUPLICATE_CATEGORY",
        "이미 존재하는 카테고리 이름입니다",
        HttpStatus.CONFLICT
    ),

    // ── 서버 에러 (500) ──────────────────────────────────────────────────────
    INTERNAL_SERVER_ERROR(
        "INTERNAL_SERVER_ERROR",
        "서버 내부 오류가 발생했습니다",
        HttpStatus.INTERNAL_SERVER_ERROR
    );

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
