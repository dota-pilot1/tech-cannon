package com.mapo.palantier.sql.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.mapo.palantier.sql.dto.*;
import com.mapo.palantier.sql.service.SqlPracticeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "SQL Practice", description = "SQL 연습 API")
@RestController
@RequestMapping("/api/sql")
@RequiredArgsConstructor
public class SqlPracticeController {

    private final SqlPracticeService sqlPracticeService;

    @Operation(summary = "SQL 쿼리 실행")
    @PostMapping("/execute")
    public ResponseEntity<SqlExecuteResponse> execute(@RequestBody SqlExecuteRequest request) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            return ResponseEntity.badRequest().body(
                SqlExecuteResponse.builder()
                    .success(false)
                    .message("쿼리를 입력해주세요.")
                    .build()
            );
        }
        return ResponseEntity.ok(sqlPracticeService.execute(request.getQuery().trim()));
    }

    @Operation(summary = "테이블 목록 조회")
    @GetMapping("/tables")
    public ResponseEntity<List<TableInfo>> getTables() {
        return ResponseEntity.ok(sqlPracticeService.getTables());
    }

    @Operation(summary = "특정 테이블 정보 조회")
    @GetMapping("/tables/{tableName}")
    public ResponseEntity<TableInfo> getTable(@PathVariable String tableName) {
        TableInfo info = sqlPracticeService.getTable(tableName);
        if (info == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(info);
    }
}
