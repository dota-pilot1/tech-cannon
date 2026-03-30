package com.mapo.palantier.work.presentation;

import com.mapo.palantier.work.application.WorkService;
import com.mapo.palantier.work.domain.SubWork;
import com.mapo.palantier.work.domain.Work;
import com.mapo.palantier.work.domain.WorkChecklist;
import com.mapo.palantier.work.domain.WorkDbTable;
import com.mapo.palantier.work.domain.WorkFigma;
import com.mapo.palantier.work.domain.WorkImage;
import com.mapo.palantier.work.domain.WorkLinkedIssue;
import com.mapo.palantier.work.domain.WorkMindmap;
import com.mapo.palantier.work.infrastructure.SubWorkMapper;
import com.mapo.palantier.work.infrastructure.WorkChecklistMapper;
import com.mapo.palantier.work.infrastructure.WorkDbTableMapper;
import com.mapo.palantier.work.infrastructure.WorkFigmaMapper;
import com.mapo.palantier.work.infrastructure.WorkImageMapper;
import com.mapo.palantier.work.infrastructure.WorkLinkedIssueMapper;
import com.mapo.palantier.work.infrastructure.WorkMindmapMapper;
import com.mapo.palantier.work.presentation.dto.CreateWorkRequest;
import com.mapo.palantier.work.presentation.dto.WorkReorderItem;
import com.mapo.palantier.work.presentation.dto.WorkResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/works")
public class WorkController {

    private final WorkService workService;

    private final WorkImageMapper workImageMapper;
    private final WorkChecklistMapper workChecklistMapper;
    private final WorkMindmapMapper workMindmapMapper;
    private final WorkDbTableMapper workDbTableMapper;
    private final WorkLinkedIssueMapper workLinkedIssueMapper;
    private final WorkFigmaMapper workFigmaMapper;
    private final SubWorkMapper subWorkMapper;

    public WorkController(
        WorkService workService,
        WorkImageMapper workImageMapper,
        WorkChecklistMapper workChecklistMapper,
        WorkMindmapMapper workMindmapMapper,
        WorkDbTableMapper workDbTableMapper,
        WorkLinkedIssueMapper workLinkedIssueMapper,
        WorkFigmaMapper workFigmaMapper,
        SubWorkMapper subWorkMapper
    ) {
        this.workService = workService;
        this.workImageMapper = workImageMapper;
        this.workChecklistMapper = workChecklistMapper;
        this.workMindmapMapper = workMindmapMapper;
        this.workDbTableMapper = workDbTableMapper;
        this.workLinkedIssueMapper = workLinkedIssueMapper;
        this.workFigmaMapper = workFigmaMapper;
        this.subWorkMapper = subWorkMapper;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 업무 CRUD
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorks(
        @RequestParam(required = false) String workType,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) Long assigneeId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false, defaultValue = "order") String sortBy,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "50") Integer limit,
        @RequestParam(required = false) Boolean isArchived
    ) {
        List<Work> works = workService.getAllWorks(
            workType,
            status,
            priority,
            assigneeId,
            keyword,
            sortBy,
            page,
            limit,
            isArchived
        );

        int total = workService.getTotalCount(
            workType,
            status,
            priority,
            assigneeId,
            keyword,
            isArchived
        );

        List<WorkResponse> items = works
            .stream()
            .map(WorkResponse::from)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", total);
        response.put("page", page);
        response.put("limit", limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkResponse> getWork(@PathVariable Long id) {
        Work work = workService.getWorkById(id);
        if (work == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(WorkResponse.from(work));
    }

    @PostMapping
    public ResponseEntity<WorkResponse> createWork(
        @RequestBody CreateWorkRequest request,
        Authentication authentication
    ) {
        // principal은 JwtAuthenticationFilter에서 userId(Long)로 설정됨
        Long reporterId = Long.parseLong(authentication.getName().toString());

        Work work = new Work();
        work.setTitle(request.getTitle());
        work.setContent(request.getContent());
        work.setWorkType(
            request.getWorkType() != null ? request.getWorkType() : "COMMON"
        );
        work.setStatus(
            request.getStatus() != null ? request.getStatus() : "TODO"
        );
        work.setPriority(
            request.getPriority() != null ? request.getPriority() : "MEDIUM"
        );
        work.setReporterId(reporterId);
        work.setAssigneeId(request.getAssigneeId());
        work.setOrganizationId(1L); // TODO: 사용자의 organization_id로 설정
        work.setDueDate(parseDueDate(request.getDueDate()));

        Work created = workService.createWork(work);
        return ResponseEntity.ok(WorkResponse.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkResponse> updateWork(
        @PathVariable Long id,
        @RequestBody CreateWorkRequest request
    ) {
        Work work = new Work();
        work.setTitle(request.getTitle());
        work.setContent(request.getContent());
        work.setWorkType(request.getWorkType());
        work.setStatus(request.getStatus());
        work.setPriority(request.getPriority());
        work.setAssigneeId(request.getAssigneeId());
        work.setDueDate(parseDueDate(request.getDueDate()));

        Work updated = workService.updateWork(id, work);
        return ResponseEntity.ok(WorkResponse.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWork(@PathVariable Long id) {
        workService.deleteWork(id);
        return ResponseEntity.noContent().build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 순서 / 아카이브
    // ──────────────────────────────────────────────────────────────────────────

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderWorks(
        @RequestBody List<WorkReorderItem> items
    ) {
        workService.reorderWorks(items);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/archive")
    public ResponseEntity<Void> archiveWorks(@RequestBody List<Long> ids) {
        workService.archiveWorks(ids);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/restore")
    public ResponseEntity<Void> restoreWorks(@RequestBody List<Long> ids) {
        workService.restoreWorks(ids);
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 단일 필드 변경
    // ──────────────────────────────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        workService.updateStatus(id, request.get("status"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/assignee")
    public ResponseEntity<Void> updateAssignee(
        @PathVariable Long id,
        @RequestBody Map<String, Long> request
    ) {
        workService.updateAssignee(id, request.get("assigneeId"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<Void> updatePriority(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        workService.updatePriority(id, request.get("priority"));
        return ResponseEntity.ok().build();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 이미지
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{workId}/images")
    public ResponseEntity<List<WorkImage>> getWorkImages(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(workImageMapper.findByWorkId(workId));
    }

    @PostMapping("/{workId}/images")
    public ResponseEntity<WorkImage> addWorkImage(
        @PathVariable Long workId,
        @RequestBody AddImageRequest request
    ) {
        WorkImage image = WorkImage.builder()
            .workId(workId)
            .url(request.url())
            .filename(request.filename())
            .fileType(request.fileType() != null ? request.fileType() : "image")
            .build();
        workImageMapper.insert(image);
        return ResponseEntity.ok(image);
    }

    @DeleteMapping("/{workId}/images/{imageId}")
    public ResponseEntity<Void> deleteWorkImage(
        @PathVariable Long workId,
        @PathVariable Long imageId
    ) {
        workImageMapper.delete(imageId);
        return ResponseEntity.noContent().build();
    }

    public record AddImageRequest(
        String url,
        String filename,
        String fileType
    ) {}

    // ──────────────────────────────────────────────────────────────────────────
    // 체크리스트
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{workId}/checklists")
    public ResponseEntity<List<WorkChecklist>> getChecklists(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(workChecklistMapper.findByWorkId(workId));
    }

    @PostMapping("/{workId}/checklists")
    public ResponseEntity<WorkChecklist> createChecklist(
        @PathVariable Long workId,
        @RequestBody CreateChecklistRequest request
    ) {
        WorkChecklist checklist = WorkChecklist.builder()
            .workId(workId)
            .content(request.content())
            .isChecked(false)
            .imageUrl(request.imageUrl())
            .imageFilename(request.imageFilename())
            .orderNum(request.orderNum() != null ? request.orderNum() : 0)
            .build();
        workChecklistMapper.insert(checklist);
        return ResponseEntity.ok(checklist);
    }

    @PatchMapping("/{workId}/checklists/{checklistId}/toggle")
    public ResponseEntity<Void> toggleChecklist(
        @PathVariable Long workId,
        @PathVariable Long checklistId
    ) {
        workChecklistMapper.toggleChecked(checklistId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{workId}/checklists/{checklistId}")
    public ResponseEntity<Void> updateChecklist(
        @PathVariable Long workId,
        @PathVariable Long checklistId,
        @RequestBody UpdateChecklistRequest request
    ) {
        WorkChecklist checklist = WorkChecklist.builder()
            .id(checklistId)
            .content(request.content())
            .isChecked(request.isChecked())
            .imageUrl(request.imageUrl())
            .imageFilename(request.imageFilename())
            .orderNum(request.orderNum())
            .build();
        workChecklistMapper.update(checklist);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workId}/checklists/{checklistId}")
    public ResponseEntity<Void> deleteChecklist(
        @PathVariable Long workId,
        @PathVariable Long checklistId
    ) {
        workChecklistMapper.delete(checklistId);
        return ResponseEntity.noContent().build();
    }

    public record CreateChecklistRequest(
        String content,
        String imageUrl,
        String imageFilename,
        Integer orderNum
    ) {}

    public record UpdateChecklistRequest(
        String content,
        Boolean isChecked,
        String imageUrl,
        String imageFilename,
        Integer orderNum
    ) {}

    // ──────────────────────────────────────────────────────────────────────────
    // 마인드맵
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{workId}/mindmaps")
    public ResponseEntity<List<WorkMindmap>> getMindmaps(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(workMindmapMapper.findByWorkId(workId));
    }

    @PostMapping("/{workId}/mindmaps")
    public ResponseEntity<WorkMindmap> createMindmap(
        @PathVariable Long workId,
        @RequestBody CreateMindmapRequest request
    ) {
        WorkMindmap mindmap = WorkMindmap.builder()
            .workId(workId)
            .title(request.title())
            .content(request.content() != null ? request.content() : "")
            .orderNum(request.orderNum() != null ? request.orderNum() : 0)
            .build();
        workMindmapMapper.insert(mindmap);
        return ResponseEntity.ok(mindmap);
    }

    @PutMapping("/{workId}/mindmaps/{mindmapId}")
    public ResponseEntity<Void> updateMindmap(
        @PathVariable Long workId,
        @PathVariable Long mindmapId,
        @RequestBody UpdateMindmapRequest request
    ) {
        WorkMindmap mindmap = WorkMindmap.builder()
            .id(mindmapId)
            .title(request.title())
            .content(request.content())
            .orderNum(request.orderNum())
            .build();
        workMindmapMapper.update(mindmap);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workId}/mindmaps/{mindmapId}")
    public ResponseEntity<Void> deleteMindmap(
        @PathVariable Long workId,
        @PathVariable Long mindmapId
    ) {
        workMindmapMapper.delete(mindmapId);
        return ResponseEntity.noContent().build();
    }

    public record CreateMindmapRequest(
        String title,
        String content,
        Integer orderNum
    ) {}

    public record UpdateMindmapRequest(
        String title,
        String content,
        Integer orderNum
    ) {}

    // ──────────────────────────────────────────────────────────────────────────
    // DB 테이블
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{workId}/db-tables")
    public ResponseEntity<List<WorkDbTable>> getDbTables(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(workDbTableMapper.findByWorkId(workId));
    }

    @PostMapping("/{workId}/db-tables")
    public ResponseEntity<WorkDbTable> createDbTable(
        @PathVariable Long workId,
        @RequestBody CreateDbTableRequest request
    ) {
        WorkDbTable dbTable = WorkDbTable.builder()
            .workId(workId)
            .tableName(request.tableName())
            .tableInfo(request.tableInfo() != null ? request.tableInfo() : "{}")
            .orderNum(request.orderNum() != null ? request.orderNum() : 0)
            .build();
        workDbTableMapper.insert(dbTable);
        return ResponseEntity.ok(dbTable);
    }

    @PutMapping("/{workId}/db-tables/{dbTableId}")
    public ResponseEntity<Void> updateDbTable(
        @PathVariable Long workId,
        @PathVariable Long dbTableId,
        @RequestBody UpdateDbTableRequest request
    ) {
        WorkDbTable dbTable = WorkDbTable.builder()
            .id(dbTableId)
            .tableName(request.tableName())
            .tableInfo(request.tableInfo())
            .orderNum(request.orderNum())
            .build();
        workDbTableMapper.update(dbTable);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workId}/db-tables/{dbTableId}")
    public ResponseEntity<Void> deleteDbTable(
        @PathVariable Long workId,
        @PathVariable Long dbTableId
    ) {
        workDbTableMapper.delete(dbTableId);
        return ResponseEntity.noContent().build();
    }

    public record CreateDbTableRequest(
        String tableName,
        String tableInfo,
        Integer orderNum
    ) {}

    public record UpdateDbTableRequest(
        String tableName,
        String tableInfo,
        Integer orderNum
    ) {}

    // ──────────────────────────────────────────────────────────────────────────
    // 피그마 링크
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{workId}/figmas")
    public ResponseEntity<List<WorkFigma>> getFigmas(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(workFigmaMapper.findByWorkId(workId));
    }

    @PostMapping("/{workId}/figmas")
    public ResponseEntity<WorkFigma> createFigma(
        @PathVariable Long workId,
        @RequestBody CreateFigmaRequest request
    ) {
        WorkFigma figma = WorkFigma.builder()
            .workId(workId)
            .title(request.title())
            .url(request.url())
            .description(request.description())
            .orderNum(request.orderNum() != null ? request.orderNum() : 0)
            .build();
        workFigmaMapper.insert(figma);
        return ResponseEntity.ok(figma);
    }

    @PutMapping("/{workId}/figmas/{figmaId}")
    public ResponseEntity<Void> updateFigma(
        @PathVariable Long workId,
        @PathVariable Long figmaId,
        @RequestBody UpdateFigmaRequest request
    ) {
        WorkFigma figma = WorkFigma.builder()
            .id(figmaId)
            .title(request.title())
            .url(request.url())
            .description(request.description())
            .orderNum(request.orderNum())
            .build();
        workFigmaMapper.update(figma);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workId}/figmas/{figmaId}")
    public ResponseEntity<Void> deleteFigma(
        @PathVariable Long workId,
        @PathVariable Long figmaId
    ) {
        workFigmaMapper.delete(figmaId);
        return ResponseEntity.noContent().build();
    }

    public record CreateFigmaRequest(
        String title,
        String url,
        String description,
        Integer orderNum
    ) {}

    public record UpdateFigmaRequest(
        String title,
        String url,
        String description,
        Integer orderNum
    ) {}

    // ──────────────────────────────────────────────────────────────────────────
    // 연결된 이슈
    // ──────────────────────────────────────────────────────────────────────────

    @GetMapping("/{workId}/linked-issues")
    public ResponseEntity<List<WorkLinkedIssue>> getLinkedIssues(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(workLinkedIssueMapper.findByWorkId(workId));
    }

    @PostMapping("/{workId}/linked-issues")
    public ResponseEntity<Map<String, Object>> linkIssue(
        @PathVariable Long workId,
        @RequestBody Map<String, Long> request
    ) {
        Long issueId = request.get("issueId");

        if (workLinkedIssueMapper.existsByWorkIdAndIssueId(workId, issueId)) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "이미 연결된 이슈입니다.");
            return ResponseEntity.badRequest().body(error);
        }

        workLinkedIssueMapper.insert(workId, issueId);

        List<WorkLinkedIssue> linked = workLinkedIssueMapper.findByWorkId(
            workId
        );
        WorkLinkedIssue created = linked
            .stream()
            .filter(l -> l.getIssueId().equals(issueId))
            .findFirst()
            .orElse(null);

        Map<String, Object> result = new HashMap<>();
        result.put("data", created);
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{workId}/linked-issues/{linkId}")
    public ResponseEntity<Void> unlinkIssue(
        @PathVariable Long workId,
        @PathVariable Long linkId
    ) {
        workLinkedIssueMapper.delete(linkId);
        return ResponseEntity.noContent().build();
    }

    // ── SubWork endpoints ──────────────────────────────────────────────────────

    @GetMapping("/{workId}/sub-works")
    public ResponseEntity<List<SubWork>> getSubWorks(
        @PathVariable Long workId
    ) {
        return ResponseEntity.ok(subWorkMapper.findByParentWorkId(workId));
    }

    @PostMapping("/{workId}/sub-works")
    public ResponseEntity<SubWork> createSubWork(
        @PathVariable Long workId,
        @RequestBody CreateSubWorkRequest request,
        Authentication authentication
    ) {
        Long authorId = Long.parseLong(authentication.getName());
        SubWork subWork = new SubWork();
        subWork.setParentWorkId(workId);
        subWork.setTitle(request.title() != null ? request.title() : "");
        subWork.setContent(request.content());
        subWork.setImageUrl(request.imageUrl());
        subWork.setIsResolved(false);
        subWork.setAuthorId(authorId);
        subWorkMapper.insert(subWork);
        return ResponseEntity.ok(subWorkMapper.findById(subWork.getId()));
    }

    @PutMapping("/{workId}/sub-works/{subWorkId}")
    public ResponseEntity<SubWork> updateSubWork(
        @PathVariable Long workId,
        @PathVariable Long subWorkId,
        @RequestBody CreateSubWorkRequest request
    ) {
        SubWork subWork = new SubWork();
        subWork.setId(subWorkId);
        subWork.setTitle(request.title() != null ? request.title() : "");
        subWork.setContent(request.content());
        subWork.setImageUrl(request.imageUrl());
        subWork.setIsResolved(
            request.isResolved() != null ? request.isResolved() : false
        );
        subWorkMapper.update(subWork);
        return ResponseEntity.ok(subWorkMapper.findById(subWorkId));
    }

    @PatchMapping("/{workId}/sub-works/{subWorkId}/toggle")
    public ResponseEntity<Void> toggleSubWork(
        @PathVariable Long workId,
        @PathVariable Long subWorkId
    ) {
        subWorkMapper.toggleResolved(subWorkId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{workId}/sub-works/{subWorkId}")
    public ResponseEntity<Void> deleteSubWork(
        @PathVariable Long workId,
        @PathVariable Long subWorkId
    ) {
        subWorkMapper.delete(subWorkId);
        return ResponseEntity.noContent().build();
    }

    public record CreateSubWorkRequest(
        String title,
        String content,
        String imageUrl,
        Boolean isResolved
    ) {}

    // ──────────────────────────────────────────────────────────────────────────
    // 유틸리티
    // ──────────────────────────────────────────────────────────────────────────

    private String parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) {
            return null;
        }
        return dueDate;
    }
}
