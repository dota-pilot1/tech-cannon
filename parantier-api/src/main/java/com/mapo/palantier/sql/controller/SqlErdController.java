package com.mapo.palantier.sql.controller;

import com.mapo.palantier.sql.domain.SqlErd;
import com.mapo.palantier.sql.dto.ErdGenerateRequest;
import com.mapo.palantier.sql.dto.ErdGenerateResponse;
import com.mapo.palantier.sql.infrastructure.SqlErdMapper;
import com.mapo.palantier.sql.service.ErdGenerateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SQL ERD", description = "SQL ERD 관리 API")
@RestController
@RequestMapping("/api/sql/erds")
@RequiredArgsConstructor
public class SqlErdController {

    private final SqlErdMapper sqlErdMapper;
    private final ErdGenerateService erdGenerateService;

    record CreateErdRequest(
        String title,
        String content,
        String description,
        Integer orderNum
    ) {}

    record UpdateErdRequest(
        String title,
        String content,
        String description,
        Integer orderNum
    ) {}

    @Operation(
        summary = "ERD 전체 목록 조회",
        description = "order_num ASC, created_at DESC 순으로 정렬"
    )
    @GetMapping
    public ResponseEntity<List<SqlErd>> findAll() {
        return ResponseEntity.ok(sqlErdMapper.findAll());
    }

    @Operation(summary = "ERD 생성")
    @PostMapping
    public ResponseEntity<SqlErd> create(
        @RequestBody CreateErdRequest request
    ) {
        SqlErd erd = SqlErd.builder()
            .title(request.title())
            .content(request.content())
            .description(request.description())
            .orderNum(request.orderNum() != null ? request.orderNum() : 0)
            .build();
        sqlErdMapper.insert(erd);
        return ResponseEntity.ok(erd);
    }

    @Operation(summary = "ERD 수정")
    @PutMapping("/{id}")
    public ResponseEntity<SqlErd> update(
        @PathVariable Long id,
        @RequestBody UpdateErdRequest request
    ) {
        SqlErd erd = SqlErd.builder()
            .id(id)
            .title(request.title())
            .content(request.content())
            .description(request.description())
            .orderNum(request.orderNum() != null ? request.orderNum() : 0)
            .build();
        sqlErdMapper.update(erd);
        return ResponseEntity.ok(erd);
    }

    @Operation(summary = "ERD 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sqlErdMapper.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "AI로 ERD mmd 자동 생성")
    @PostMapping("/generate")
    public ResponseEntity<ErdGenerateResponse> generate(
        @RequestBody ErdGenerateRequest request
    ) {
        ErdGenerateResponse response = erdGenerateService.generate(request);
        return ResponseEntity.ok(response);
    }
}
