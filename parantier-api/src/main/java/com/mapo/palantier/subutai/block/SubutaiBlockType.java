package com.mapo.palantier.subutai.block;

public enum SubutaiBlockType {
    NOTE,   // 마크다운 텍스트
    MMD,    // Mermaid 다이어그램
    FIGMA,  // Figma 임베드 URL
    FILE,   // 파일 첨부 (JSON)
    DBTABLE, // DB 테이블 정의 (JSON)
    GITHUB  // GitHub 링크
}
