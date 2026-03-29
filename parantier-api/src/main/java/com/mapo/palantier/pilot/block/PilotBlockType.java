package com.mapo.palantier.pilot.block;

public enum PilotBlockType {
    NOTE,       // 마크다운 텍스트
    MMD,        // Mermaid 다이어그램
    FIGMA,      // Figma 임베드 URL
    FILE,       // 파일 첨부 (JSON)
    DBTABLE     // DB 테이블 정의 (JSON)
}
