package com.mapo.palantier.issue.presentation;

import com.mapo.palantier.issue.application.IssueService;
import com.mapo.palantier.user.application.AuthService;
import com.mapo.palantier.issue.domain.Issue;
import com.mapo.palantier.issue.domain.IssueImage;
import com.mapo.palantier.issue.domain.IssueAssignee;
import com.mapo.palantier.issue.domain.IssueChecklist;
import com.mapo.palantier.issue.domain.IssueMindmap;
import com.mapo.palantier.issue.domain.IssueTaskLink;
import com.mapo.palantier.issue.domain.IssueDbTable;
import com.mapo.palantier.issue.infrastructure.IssueImageMapper;
import com.mapo.palantier.issue.infrastructure.IssueAssigneeMapper;
import com.mapo.palantier.issue.infrastructure.IssueChecklistMapper;
import com.mapo.palantier.issue.infrastructure.IssueMindmapMapper;
import com.mapo.palantier.issue.infrastructure.IssueTaskLinkMapper;
import com.mapo.palantier.issue.infrastructure.IssueDbTableMapper;
import com.mapo.palantier.issue.presentation.dto.CreateIssueRequest;
import com.mapo.palantier.issue.presentation.dto.IssueResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/issues")
public class IssueController {

    private final IssueService issueService;
    private final AuthService authService;
    private final IssueImageMapper issueImageMapper;
    private final IssueAssigneeMapper issueAssigneeMapper;
    private final IssueChecklistMapper issueChecklistMapper;
    private final IssueMindmapMapper issueMindmapMapper;
    private final IssueTaskLinkMapper issueTaskLinkMapper;
    private final IssueDbTableMapper issueDbTableMapper;

    public IssueController(IssueService issueService, AuthService authService,
                          IssueImageMapper issueImageMapper,
                          IssueAssigneeMapper issueAssigneeMapper, IssueChecklistMapper issueChecklistMapper,
                          IssueMindmapMapper issueMindmapMapper, IssueTaskLinkMapper issueTaskLinkMapper,
                          IssueDbTableMapper issueDbTableMapper) {
        this.issueService = issueService;
        this.authService = authService;
        this.issueImageMapper = issueImageMapper;
        this.issueAssigneeMapper = issueAssigneeMapper;
        this.issueChecklistMapper = issueChecklistMapper;
        this.issueMindmapMapper = issueMindmapMapper;
        this.issueTaskLinkMapper = issueTaskLinkMapper;
        this.issueDbTableMapper = issueDbTableMapper;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getIssues(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) Long authorId,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "created") String sortBy,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer limit
    ) {
        List<Issue> issues = issueService.getAllIssues(
                status, category, priority, assigneeId, authorId, folderId, keyword, sortBy, page, limit
        );

        int total = issueService.getTotalCount(
                status, category, priority, assigneeId, authorId, folderId, keyword
        );

        List<IssueResponse> issueResponses = issues.stream()
                .map(IssueResponse::from)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("items", issueResponses);
        response.put("total", total);
        response.put("page", page);
        response.put("limit", limit);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IssueResponse> getIssue(@PathVariable Long id) {
        Issue issue = issueService.getIssueById(id);
        if (issue == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(IssueResponse.from(issue));
    }

    @PostMapping
    public ResponseEntity<IssueResponse> createIssue(
            @RequestBody CreateIssueRequest request,
            Authentication authentication
    ) {
        // 현재 로그인한 사용자를 author로 설정
        String email = authentication.getName();
        Long authorId = authService.getUserByEmail(email).getId();

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setContent(request.getContent());
        issue.setCategory(request.getCategory());
        issue.setStatus(request.getStatus() != null ? request.getStatus() : com.mapo.palantier.issue.domain.IssueStatus.OPEN);
        issue.setPriority(request.getPriority() != null ? request.getPriority() : com.mapo.palantier.issue.domain.IssuePriority.MEDIUM);
        issue.setAuthorId(authorId);
        issue.setAssigneeId(request.getAssigneeId());
        issue.setOrganizationId(1L); // TODO: 사용자의 organization_id로 설정
        issue.setFolderId(request.getFolderId());

        Issue created = issueService.createIssue(issue);
        return ResponseEntity.ok(IssueResponse.from(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IssueResponse> updateIssue(
            @PathVariable Long id,
            @RequestBody CreateIssueRequest request
    ) {
        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setContent(request.getContent());
        issue.setCategory(request.getCategory());
        issue.setStatus(request.getStatus());
        issue.setPriority(request.getPriority());
        issue.setAssigneeId(request.getAssigneeId());
        issue.setFolderId(request.getFolderId());

        Issue updated = issueService.updateIssue(id, issue);
        return ResponseEntity.ok(IssueResponse.from(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String status = request.get("status");
        issueService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/assignee")
    public ResponseEntity<Void> updateAssignee(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request
    ) {
        Long assigneeId = request.get("assigneeId");
        issueService.updateAssignee(id, assigneeId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/priority")
    public ResponseEntity<Void> updatePriority(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String priority = request.get("priority");
        issueService.updatePriority(id, priority);
        return ResponseEntity.ok().build();
    }

    // Image endpoints
    @GetMapping("/{issueId}/images")
    public ResponseEntity<List<IssueImage>> getIssueImages(@PathVariable Long issueId) {
        List<IssueImage> images = issueImageMapper.findByIssueId(issueId);
        return ResponseEntity.ok(images);
    }

    @PostMapping("/{issueId}/images")
    public ResponseEntity<IssueImage> addIssueImage(
            @PathVariable Long issueId,
            @RequestBody AddImageRequest request
    ) {
        IssueImage image = IssueImage.builder()
                .issueId(issueId)
                .url(request.url())
                .filename(request.filename())
                .fileType(request.fileType() != null ? request.fileType() : "image")
                .build();
        issueImageMapper.insert(image);
        return ResponseEntity.ok(image);
    }

    @DeleteMapping("/{issueId}/images/{imageId}")
    public ResponseEntity<Void> deleteIssueImage(
            @PathVariable Long issueId,
            @PathVariable Long imageId
    ) {
        issueImageMapper.deleteById(imageId);
        return ResponseEntity.noContent().build();
    }

    public record AddImageRequest(String url, String filename, String fileType) {}

    // Assignee endpoints
    @GetMapping("/{issueId}/assignees")
    public ResponseEntity<List<IssueAssignee>> getIssueAssignees(@PathVariable Long issueId) {
        List<IssueAssignee> assignees = issueAssigneeMapper.findByIssueId(issueId);
        return ResponseEntity.ok(assignees);
    }

    @PostMapping("/{issueId}/assignees")
    public ResponseEntity<Void> addAssignee(
            @PathVariable Long issueId,
            @RequestBody Map<String, Long> request
    ) {
        Long userId = request.get("userId");
        issueAssigneeMapper.insert(issueId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/assignees/{userId}")
    public ResponseEntity<Void> removeAssignee(
            @PathVariable Long issueId,
            @PathVariable Long userId
    ) {
        issueAssigneeMapper.delete(issueId, userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{issueId}/assignees")
    public ResponseEntity<Void> updateAssignees(
            @PathVariable Long issueId,
            @RequestBody UpdateAssigneesRequest request
    ) {
        // 기존 담당자 모두 제거
        issueAssigneeMapper.deleteByIssueId(issueId);

        // 새 담당자 일괄 추가
        if (request.userIds() != null && !request.userIds().isEmpty()) {
            issueAssigneeMapper.insertBatch(issueId, request.userIds());
        }

        return ResponseEntity.ok().build();
    }

    public record UpdateAssigneesRequest(List<Long> userIds) {}

    // ===== 체크리스트 API =====

    @GetMapping("/{issueId}/checklists")
    public ResponseEntity<List<IssueChecklist>> getChecklists(@PathVariable Long issueId) {
        List<IssueChecklist> checklists = issueChecklistMapper.findByIssueId(issueId);
        return ResponseEntity.ok(checklists);
    }

    @PostMapping("/{issueId}/checklists")
    public ResponseEntity<IssueChecklist> createChecklist(
            @PathVariable Long issueId,
            @RequestBody CreateChecklistRequest request
    ) {
        IssueChecklist checklist = IssueChecklist.builder()
                .issueId(issueId)
                .content(request.content())
                .checked(false)
                .orderNum(request.orderNum() != null ? request.orderNum() : 0)
                .build();

        issueChecklistMapper.insert(checklist);
        return ResponseEntity.ok(checklist);
    }

    @PutMapping("/{issueId}/checklists/{checklistId}")
    public ResponseEntity<Void> updateChecklist(
            @PathVariable Long issueId,
            @PathVariable Long checklistId,
            @RequestBody UpdateChecklistRequest request
    ) {
        IssueChecklist checklist = IssueChecklist.builder()
                .id(checklistId)
                .content(request.content())
                .checked(request.checked())
                .orderNum(request.orderNum())
                .build();

        issueChecklistMapper.update(checklist);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{issueId}/checklists/{checklistId}/toggle")
    public ResponseEntity<Void> toggleChecklist(
            @PathVariable Long issueId,
            @PathVariable Long checklistId
    ) {
        issueChecklistMapper.toggleChecked(checklistId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/checklists/{checklistId}")
    public ResponseEntity<Void> deleteChecklist(
            @PathVariable Long issueId,
            @PathVariable Long checklistId
    ) {
        issueChecklistMapper.delete(checklistId);
        return ResponseEntity.ok().build();
    }

    public record CreateChecklistRequest(String content, Integer orderNum) {}
    public record UpdateChecklistRequest(String content, Boolean checked, Integer orderNum) {}

    // Mindmap endpoints
    @GetMapping("/{issueId}/mindmaps")
    public ResponseEntity<List<IssueMindmap>> getMindmaps(@PathVariable Long issueId) {
        List<IssueMindmap> mindmaps = issueMindmapMapper.findByIssueId(issueId);
        return ResponseEntity.ok(mindmaps);
    }

    @PostMapping("/{issueId}/mindmaps")
    public ResponseEntity<IssueMindmap> createMindmap(
            @PathVariable Long issueId,
            @RequestBody CreateMindmapRequest request
    ) {
        IssueMindmap mindmap = IssueMindmap.builder()
                .issueId(issueId)
                .title(request.title())
                .content(request.content())
                .orderNum(request.orderNum() != null ? request.orderNum() : 0)
                .build();
        issueMindmapMapper.insert(mindmap);
        return ResponseEntity.ok(mindmap);
    }

    @PutMapping("/{issueId}/mindmaps/{mindmapId}")
    public ResponseEntity<Void> updateMindmap(
            @PathVariable Long issueId,
            @PathVariable Long mindmapId,
            @RequestBody UpdateMindmapRequest request
    ) {
        IssueMindmap mindmap = IssueMindmap.builder()
                .id(mindmapId)
                .title(request.title())
                .content(request.content())
                .orderNum(request.orderNum())
                .build();
        issueMindmapMapper.update(mindmap);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/mindmaps/{mindmapId}")
    public ResponseEntity<Void> deleteMindmap(
            @PathVariable Long issueId,
            @PathVariable Long mindmapId
    ) {
        issueMindmapMapper.delete(mindmapId);
        return ResponseEntity.ok().build();
    }

    public record CreateMindmapRequest(String title, String content, Integer orderNum) {}
    public record UpdateMindmapRequest(String title, String content, Integer orderNum) {}

    // Task Link endpoints
    @GetMapping("/{issueId}/tasks")
    public ResponseEntity<List<Map<String, Object>>> getLinkedTasks(@PathVariable Long issueId) {
        List<Map<String, Object>> tasks = issueTaskLinkMapper.findTasksByIssueId(issueId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{issueId}/tasks")
    public ResponseEntity<IssueTaskLink> linkTask(
            @PathVariable Long issueId,
            @RequestBody LinkTaskRequest request
    ) {
        IssueTaskLink link = IssueTaskLink.builder()
                .issueId(issueId)
                .taskPostId(request.taskPostId())
                .orderNum(request.orderNum() != null ? request.orderNum() : 0)
                .build();
        issueTaskLinkMapper.insert(link);
        return ResponseEntity.ok(link);
    }

    @DeleteMapping("/{issueId}/tasks/{linkId}")
    public ResponseEntity<Void> unlinkTask(
            @PathVariable Long issueId,
            @PathVariable Long linkId
    ) {
        issueTaskLinkMapper.delete(linkId);
        return ResponseEntity.ok().build();
    }

    public record LinkTaskRequest(Long taskPostId, Integer orderNum) {}

    // DB Table endpoints
    @GetMapping("/{issueId}/dbtables")
    public ResponseEntity<List<IssueDbTable>> getDbTables(@PathVariable Long issueId) {
        List<IssueDbTable> dbTables = issueDbTableMapper.findByIssueId(issueId);
        return ResponseEntity.ok(dbTables);
    }

    @PostMapping("/{issueId}/dbtables")
    public ResponseEntity<IssueDbTable> createDbTable(
            @PathVariable Long issueId,
            @RequestBody CreateDbTableRequest request
    ) {
        IssueDbTable dbTable = IssueDbTable.builder()
                .issueId(issueId)
                .tableName(request.tableName())
                .tableInfo(request.tableInfo())
                .orderNum(request.orderNum() != null ? request.orderNum() : 0)
                .build();
        issueDbTableMapper.insert(dbTable);
        return ResponseEntity.ok(dbTable);
    }

    @PutMapping("/{issueId}/dbtables/{dbTableId}")
    public ResponseEntity<Void> updateDbTable(
            @PathVariable Long issueId,
            @PathVariable Long dbTableId,
            @RequestBody UpdateDbTableRequest request
    ) {
        IssueDbTable dbTable = IssueDbTable.builder()
                .id(dbTableId)
                .tableName(request.tableName())
                .tableInfo(request.tableInfo())
                .orderNum(request.orderNum())
                .build();
        issueDbTableMapper.update(dbTable);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{issueId}/dbtables/{dbTableId}")
    public ResponseEntity<Void> deleteDbTable(
            @PathVariable Long issueId,
            @PathVariable Long dbTableId
    ) {
        issueDbTableMapper.delete(dbTableId);
        return ResponseEntity.ok().build();
    }

    public record CreateDbTableRequest(String tableName, String tableInfo, Integer orderNum) {}
    public record UpdateDbTableRequest(String tableName, String tableInfo, Integer orderNum) {}
}
