package com.mapo.palantier.menu.domain;

public enum MenuType {
    HEADER,   // 헤더 1차 메뉴 (직접 페이지로 이동)
    CATEGORY, // 헤더 카테고리 메뉴 (사이드바 토글, 페이지 없음)
    PAGE      // 2차, 3차 페이지 메뉴
}
