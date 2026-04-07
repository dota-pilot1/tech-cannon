package com.mapo.palantier.wiki.domain;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Tags {

    private final List<String> values;

    private Tags(List<String> values) {
        this.values = values.stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
    }

    // DB 조회 시 CSV 문자열로부터 생성
    public static Tags from(String csv) {
        if (csv == null || csv.isBlank()) return new Tags(List.of());
        return new Tags(Arrays.asList(csv.split(",")));
    }

    // Request DTO의 List<String>으로부터 생성
    public static Tags from(List<String> list) {
        return new Tags(list != null ? list : List.of());
    }

    // DB 저장용 CSV 변환
    public String toCsv() {
        return String.join(",", values);
    }

    // 응답용 List 반환
    public List<String> toList() {
        return Collections.unmodifiableList(values);
    }

    public boolean isEmpty() {
        return values.isEmpty();
    }

    @Override
    public String toString() {
        return toCsv();
    }
}
