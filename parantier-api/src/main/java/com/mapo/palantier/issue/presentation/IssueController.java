package com.mapo.palantier.issue.presentation;

import com.mapo.palantier.issue.application.IssueService;
import com.mapo.palantier.issue.domain.Issue;
import com.mapo.palantier.issue.domain.IssueImage;
import com.mapo.palantier.issue.infrastructure.IssueImageMapper;
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
    private final IssueImageMapper issueImageMapper;

    public IssueController(IssueService issueService, IssueImageMapper issueImageMapper) {
        this.issueService = issueService;
        this.issueImageMapper = issueImageMapper;
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
        Long authorId = Long.parseLong(authentication.getName());

        Issue issue = new Issue();
        issue.setTitle(request.getTitle());
        issue.setContent(request.getContent());
        issue.setCategory(request.getCategory());
        issue.setStatus(request.getStatus() != null ? request.getStatus() : com.mapo.palantier.issue.domain.IssueStatus.OPEN);
        issue.setPriority(request.getPriority() != null ? request.getPriority() : com.mapo.palantier.issue.domain.IssuePriority.MEDIUM);
        issue.setAuthorId(authorId);
        issue.setAssigneeId(request.getAssigneeId());
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

    public record AddImageRequest(String url, String filename) {}
}
