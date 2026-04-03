package com.mapo.palantier.sql.controller;

import com.mapo.palantier.sql.dto.*;
import com.mapo.palantier.sql.service.SqlPracticeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SQL Practice", description = "SQL 연습 API")
@RestController
@RequestMapping("/api/sql")
@RequiredArgsConstructor
public class SqlPracticeController {

    private final SqlPracticeService sqlPracticeService;

    @Operation(summary = "SQL 쿼리 실행")
    @PostMapping("/execute")
    public ResponseEntity<SqlExecuteResponse> execute(
        @RequestBody SqlExecuteRequest request,
        @RequestParam(defaultValue = "1") int set
    ) {
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            return ResponseEntity.badRequest().body(
                SqlExecuteResponse.builder()
                    .success(false)
                    .message("쿼리를 입력해주세요.")
                    .build()
            );
        }
        return ResponseEntity.ok(
            sqlPracticeService.execute(request.getQuery().trim(), set)
        );
    }

    @Operation(summary = "테이블 목록 조회")
    @GetMapping("/tables")
    public ResponseEntity<List<TableInfo>> getTables(
        @RequestParam(defaultValue = "1") int set
    ) {
        return ResponseEntity.ok(sqlPracticeService.getTables(set));
    }

    @Operation(summary = "특정 테이블 정보 조회")
    @GetMapping("/tables/{tableName}")
    public ResponseEntity<TableInfo> getTable(
        @PathVariable String tableName,
        @RequestParam(defaultValue = "1") int set
    ) {
        TableInfo info = sqlPracticeService.getTable(tableName, set);
        if (info == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(info);
    }
}
