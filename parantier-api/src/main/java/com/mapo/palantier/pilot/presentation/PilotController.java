package com.mapo.palantier.pilot.presentation;

import com.mapo.palantier.pilot.application.PilotService;
import com.mapo.palantier.pilot.domain.Pilot;
import com.mapo.palantier.pilot.domain.PilotChecklist;
import com.mapo.palantier.pilot.domain.PilotDbTable;
import com.mapo.palantier.pilot.domain.PilotFigma;
import com.mapo.palantier.pilot.domain.PilotImage;
import com.mapo.palantier.pilot.domain.PilotMindmap;
import com.mapo.palantier.pilot.infrastructure.PilotChecklistMapper;
import com.mapo.palantier.pilot.infrastructure.PilotDbTableMapper;
import com.mapo.palantier.pilot.infrastructure.PilotFigmaMapper;
import com.mapo.palantier.pilot.infrastructure.PilotImageMapper;
import com.mapo.palantier.pilot.infrastructure.PilotMindmapMapper;
import com.mapo.palantier.pilot.presentation.dto.CreatePilotRequest;
import com.mapo.palantier.pilot.presentation.dto.PilotReorderItem;
import com.mapo.palantier.pilot.presentation.dto.PilotResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pilots")
public class PilotController {

    private final PilotService pilotService;
    private final PilotImageMapper pilotImageMapper;
    private final PilotChecklistMapper pilotChecklistMapper;
    private final PilotMindmapMapper pilotMindmapMapper;
    private final PilotDbTableMapper pilotDbTableMapper;
    private final PilotFigmaMapper pilotFigmaMapper;

    public PilotController(
        PilotService pilotService,
        PilotImageMapper pilotImageMapper,
        PilotChecklistMapper pilotChecklistMapper,
        PilotMindmapMapper pilotMindmapMapper,
        PilotDbTableMapper pilotDbTableMapper,
        PilotFigmaMapper pilotFigmaMapper
    ) {
        this.pilotService = pilotService;
        this.pilotImageMapper = pilotImageMapper;
        this.pilotChecklistMapper = pilotChecklistMapper;
        this.pilotMindmapMapper = pilotMindmapMapper;
        this.pilotDbTableMapper = pilotDbTableMapper;
        this.pilotFigmaMapper = pilotFigmaMapper;
    }

    // ── 파일럿 CRUD ───────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPilots(
        @RequestParam(required = false) String topic,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String priority,
        @RequestParam(required = false) Long assigneeId,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false, defaultValue = "order") String sortBy,
        @RequestParam(required = false, defaultValue = "0") Integer page,
        @RequestParam(required = false, defaultValue = "50") Integer limit,
        @RequestParam(required = false) Boolean isArchived
    ) {
        List<Pilot> pilots = pilotService.getAllPilots(
            topic, status, priority, assigneeId, keyword, sortBy, page, limit, isArchived
        );
        int total = pilotService.getTotalCount(
            topic, status, priority, assigneeId, keyword, isArchived
        );
        List<PilotResponse> items = pilots.stream()
            .map(PilotResponse::from)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("total", total);
        response.put("page", page);
        response.put("limit", limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PilotResponse> getPilot(@PathVariable Long id) {
        Pilot pilot = pilotService.getPilotById(id);
        if (pilot == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(PilotResponse.from(pilot));
    }

    @PostMapping
    public ResponseEntity<PilotResponse> createPilot(
        @RequestBody CreatePilotRequest request,
        Authentication authentication
    ) {
        Long reporterId = Long.parseLong(authentication.getName());
        Pilot pilot = new Pilot();
        pilot.setTitle(request.getTitle());
        pilot.setContent(request.getContent() != null ? request.getContent() : "");
        pilot.setTopic(request.getTopic() != null ? request.getTopic() : "");
        pilot.setStatus(request.getStatus() != null ? request.getStatus() : "TODO");
        pilot.setPriority(request.getPriority() != null ? request.getPriority() : "MEDIUM");
        pilot.setReporterId(reporterId);
        pilot.setAssigneeId(request.getAssigneeId());
        pilot.setDueDate(parseDueDate(request.getDueDate()));
        Pilot created = pilotService.createPilot(pilot);
        return ResponseEntity.ok(PilotResponse.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PilotResponse> updatePilot(
        @PathVariable Long id,
        @RequestBody CreatePilotRequest request
    ) {
        Pilot pilot = new Pilot();
        pilot.setTitle(request.getTitle());
        pilot.setContent(request.getContent() != null ? request.getContent() : "");
        pilot.setTopic(request.getTopic() != null ? request.getTopic() : "");
        pilot.setStatus(request.getStatus());
        pilot.setPriority(request.getPriority());
        pilot.setAssigneeId(request.getAssigneeId());
        pilot.setDueDate(parseDueDate(request.getDueDate()));
        Pilot updated = pilotService.updatePilot(id, pilot);
        return ResponseEntity.ok(PilotResponse.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePilot(@PathVariable Long id) {
        pilotService.deletePilot(id);
        return ResponseEntity.noContent().build();
    }

    // ── 순서 / 아카이브 ───────────────────────────────────────────────────────

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderPilots(@RequestBody List<PilotReorderItem> items) {
        for (PilotReorderItem item : items) {
            pilotService.updateOrderNum(item.getId(), item.getOrderNum());
        }
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/archive")
    public ResponseEntity<Void> archivePilots(@RequestBody List<Long> ids) {
        pilotService.archivePilots(ids);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/restore")
    public ResponseEntity<Void> restorePilots(@RequestBody List<Long> ids) {
        pilotService.restorePilots(ids);
        return ResponseEntity.ok().build();
    }

    // ── 단일 필드 변경 ────────────────────────────────────────────────────────

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        pilotService.updateStatus(id, request.get("status"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/assignee")
    public ResponseEntity<Void> updateAssignee(
        @PathVariable Long id,
        @RequestBody Map<String, Long> request
    ) {
        pilotService.updateAssignee(id, request.get("assigneeId"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<Void> updatePriority(
        @PathVariable Long id,
        @RequestBody Map<String, String> request
    ) {
        pilotService.updatePriority(id, request.get("priority"));
        return ResponseEntity.ok().build();
    }

    // ── 이미지 ────────────────────────────────────────────────────────────────

    @GetMapping("/{pilotId}/images")
    public ResponseEntity<List<PilotImage>> getPilotImages(@PathVariable Long pilotId) {
        return ResponseEntity.ok(pilotImageMapper.findByPilotId(pilotId));
    }

    @PostMapping("/{pilotId}/images")
    public ResponseEntity<PilotImage> addPilotImage(
        @PathVariable Long pilotId,
        @RequestBody AddImageRequest request
    ) {
        PilotImage image = new PilotImage();
        image.setPilotId(pilotId);
        image.setUrl(request.url());
        image.setFilename(request.filename());
        image.setFileType(request.fileType());
        pilotImageMapper.insert(image);
        return ResponseEntity.ok(image);
    }

    @DeleteMapping("/{pilotId}/images/{imageId}")
    public ResponseEntity<Void> deletePilotImage(
        @PathVariable Long pilotId,
        @PathVariable Long imageId
    ) {
        pilotImageMapper.delete(imageId);
        return ResponseEntity.ok().build();
    }

    public record AddImageRequest(String url, String filename, String fileType) {}

    // ── 체크리스트 ────────────────────────────────────────────────────────────

    @GetMapping("/{pilotId}/checklists")
    public ResponseEntity<List<PilotChecklist>> getChecklists(@PathVariable Long pilotId) {
        return ResponseEntity.ok(pilotChecklistMapper.findByPilotId(pilotId));
    }

    @PostMapping("/{pilotId}/checklists")
    public ResponseEntity<PilotChecklist> createChecklist(
        @PathVariable Long pilotId,
        @RequestBody CreateChecklistRequest request
    ) {
        PilotChecklist checklist = new PilotChecklist();
        checklist.setPilotId(pilotId);
        checklist.setContent(request.content());
        checklist.setOrderNum(request.orderNum() != null ? request.orderNum() : 0);
        pilotChecklistMapper.insert(checklist);
        return ResponseEntity.ok(checklist);
    }

    @PatchMapping("/{pilotId}/checklists/{checklistId}/toggle")
    public ResponseEntity<Void> toggleChecklist(
        @PathVariable Long pilotId,
        @PathVariable Long checklistId
    ) {
        pilotChecklistMapper.toggleChecked(checklistId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{pilotId}/checklists/{checklistId}")
    public ResponseEntity<Void> updateChecklist(
        @PathVariable Long pilotId,
        @PathVariable Long checklistId,
        @RequestBody UpdateChecklistRequest request
    ) {
        PilotChecklist checklist = new PilotChecklist();
        checklist.setId(checklistId);
        checklist.setContent(request.content());
        checklist.setIsChecked(request.isChecked());
        checklist.setOrderNum(request.orderNum());
        pilotChecklistMapper.update(checklist);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pilotId}/checklists/{checklistId}")
    public ResponseEntity<Void> deleteChecklist(
        @PathVariable Long pilotId,
        @PathVariable Long checklistId
    ) {
        pilotChecklistMapper.delete(checklistId);
        return ResponseEntity.ok().build();
    }

    public record CreateChecklistRequest(String content, String imageUrl, String imageFilename, Integer orderNum) {}
    public record UpdateChecklistRequest(String content, Boolean isChecked, String imageUrl, String imageFilename, Integer orderNum) {}

    // ── 마인드맵 ──────────────────────────────────────────────────────────────

    @GetMapping("/{pilotId}/mindmaps")
    public ResponseEntity<List<PilotMindmap>> getMindmaps(@PathVariable Long pilotId) {
        return ResponseEntity.ok(pilotMindmapMapper.findByPilotId(pilotId));
    }

    @PostMapping("/{pilotId}/mindmaps")
    public ResponseEntity<PilotMindmap> createMindmap(
        @PathVariable Long pilotId,
        @RequestBody CreateMindmapRequest request
    ) {
        PilotMindmap mindmap = new PilotMindmap();
        mindmap.setPilotId(pilotId);
        mindmap.setTitle(request.title());
        mindmap.setContent(request.content());
        mindmap.setOrderNum(request.orderNum() != null ? request.orderNum() : 0);
        pilotMindmapMapper.insert(mindmap);
        return ResponseEntity.ok(mindmap);
    }

    @PutMapping("/{pilotId}/mindmaps/{mindmapId}")
    public ResponseEntity<Void> updateMindmap(
        @PathVariable Long pilotId,
        @PathVariable Long mindmapId,
        @RequestBody UpdateMindmapRequest request
    ) {
        PilotMindmap mindmap = new PilotMindmap();
        mindmap.setId(mindmapId);
        mindmap.setTitle(request.title());
        mindmap.setContent(request.content());
        mindmap.setOrderNum(request.orderNum());
        pilotMindmapMapper.update(mindmap);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pilotId}/mindmaps/{mindmapId}")
    public ResponseEntity<Void> deleteMindmap(
        @PathVariable Long pilotId,
        @PathVariable Long mindmapId
    ) {
        pilotMindmapMapper.delete(mindmapId);
        return ResponseEntity.ok().build();
    }

    public record CreateMindmapRequest(String title, String content, Integer orderNum) {}
    public record UpdateMindmapRequest(String title, String content, Integer orderNum) {}

    // ── DB 테이블 ─────────────────────────────────────────────────────────────

    @GetMapping("/{pilotId}/dbtables")
    public ResponseEntity<List<PilotDbTable>> getDbTables(@PathVariable Long pilotId) {
        return ResponseEntity.ok(pilotDbTableMapper.findByPilotId(pilotId));
    }

    @PostMapping("/{pilotId}/dbtables")
    public ResponseEntity<PilotDbTable> createDbTable(
        @PathVariable Long pilotId,
        @RequestBody CreateDbTableRequest request
    ) {
        PilotDbTable dbTable = new PilotDbTable();
        dbTable.setPilotId(pilotId);
        dbTable.setTableName(request.tableName());
        dbTable.setTableInfo(request.tableInfo());
        dbTable.setOrderNum(request.orderNum() != null ? request.orderNum() : 0);
        pilotDbTableMapper.insert(dbTable);
        return ResponseEntity.ok(dbTable);
    }

    @PutMapping("/{pilotId}/dbtables/{dbTableId}")
    public ResponseEntity<Void> updateDbTable(
        @PathVariable Long pilotId,
        @PathVariable Long dbTableId,
        @RequestBody UpdateDbTableRequest request
    ) {
        PilotDbTable dbTable = new PilotDbTable();
        dbTable.setId(dbTableId);
        dbTable.setTableName(request.tableName());
        dbTable.setTableInfo(request.tableInfo());
        dbTable.setOrderNum(request.orderNum());
        pilotDbTableMapper.update(dbTable);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pilotId}/dbtables/{dbTableId}")
    public ResponseEntity<Void> deleteDbTable(
        @PathVariable Long pilotId,
        @PathVariable Long dbTableId
    ) {
        pilotDbTableMapper.delete(dbTableId);
        return ResponseEntity.ok().build();
    }

    public record CreateDbTableRequest(String tableName, String tableInfo, Integer orderNum) {}
    public record UpdateDbTableRequest(String tableName, String tableInfo, Integer orderNum) {}

    // ── 피그마 ────────────────────────────────────────────────────────────────

    @GetMapping("/{pilotId}/figmas")
    public ResponseEntity<List<PilotFigma>> getFigmas(@PathVariable Long pilotId) {
        return ResponseEntity.ok(pilotFigmaMapper.findByPilotId(pilotId));
    }

    @PostMapping("/{pilotId}/figmas")
    public ResponseEntity<PilotFigma> createFigma(
        @PathVariable Long pilotId,
        @RequestBody CreateFigmaRequest request
    ) {
        PilotFigma figma = new PilotFigma();
        figma.setPilotId(pilotId);
        figma.setTitle(request.title());
        figma.setUrl(request.url());
        figma.setDescription(request.description());
        figma.setOrderNum(request.orderNum() != null ? request.orderNum() : 0);
        pilotFigmaMapper.insert(figma);
        return ResponseEntity.ok(figma);
    }

    @PutMapping("/{pilotId}/figmas/{figmaId}")
    public ResponseEntity<Void> updateFigma(
        @PathVariable Long pilotId,
        @PathVariable Long figmaId,
        @RequestBody UpdateFigmaRequest request
    ) {
        PilotFigma figma = new PilotFigma();
        figma.setId(figmaId);
        figma.setTitle(request.title());
        figma.setUrl(request.url());
        figma.setDescription(request.description());
        figma.setOrderNum(request.orderNum());
        pilotFigmaMapper.update(figma);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{pilotId}/figmas/{figmaId}")
    public ResponseEntity<Void> deleteFigma(
        @PathVariable Long pilotId,
        @PathVariable Long figmaId
    ) {
        pilotFigmaMapper.delete(figmaId);
        return ResponseEntity.ok().build();
    }

    public record CreateFigmaRequest(String title, String url, String description, Integer orderNum) {}
    public record UpdateFigmaRequest(String title, String url, String description, Integer orderNum) {}

    // ── 유틸 ──────────────────────────────────────────────────────────────────

    private String parseDueDate(String dueDate) {
        if (dueDate == null || dueDate.isBlank()) return null;
        return dueDate;
    }
}
