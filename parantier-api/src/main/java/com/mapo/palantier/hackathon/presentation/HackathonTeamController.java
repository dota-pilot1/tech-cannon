package com.mapo.palantier.hackathon.presentation;

import com.mapo.palantier.hackathon.application.HackathonTeamService;
import com.mapo.palantier.hackathon.domain.HackathonTeamFaq;
import com.mapo.palantier.hackathon.domain.HackathonTeamIssue;
import com.mapo.palantier.hackathon.domain.HackathonTeamLink;
import com.mapo.palantier.hackathon.domain.HackathonTeamTask;
import com.mapo.palantier.hackathon.dto.AddMemberRequest;
import com.mapo.palantier.hackathon.dto.CreateFaqRequest;
import com.mapo.palantier.hackathon.dto.CreateIssueRequest;
import com.mapo.palantier.hackathon.dto.CreateLinkRequest;
import com.mapo.palantier.hackathon.dto.CreateTaskRequest;
import com.mapo.palantier.hackathon.dto.UpdateFaqRequest;
import com.mapo.palantier.hackathon.dto.UpdateIssueRequest;
import com.mapo.palantier.hackathon.dto.UpdateTaskRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hackathon")
public class HackathonTeamController {

    private final HackathonTeamService hackathonTeamService;

    public HackathonTeamController(HackathonTeamService hackathonTeamService) {
        this.hackathonTeamService = hackathonTeamService;
    }

    // -----------------------------------------------------------------------
    // Members
    // -----------------------------------------------------------------------

    /**
     * POST /api/hackathon/teams/{teamId}/members
     * 팀 멤버 추가 (ADMIN 전용)
     */
    @PostMapping("/teams/{teamId}/members")
    public ResponseEntity<?> addMember(
        @PathVariable Long teamId,
        @RequestBody AddMemberRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).build();
        }
        hackathonTeamService.addMember(teamId, req.getUserId());
        return ResponseEntity.ok(Map.of("message", "멤버가 추가되었습니다."));
    }

    /**
     * DELETE /api/hackathon/teams/{teamId}/members/{userId}
     * 팀 멤버 제거 (ADMIN 전용)
     */
    @DeleteMapping("/teams/{teamId}/members/{userId}")
    public ResponseEntity<?> removeMember(
        @PathVariable Long teamId,
        @PathVariable Long userId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            return ResponseEntity.status(403).build();
        }
        hackathonTeamService.removeMember(teamId, userId);
        return ResponseEntity.ok(Map.of("message", "멤버가 제거되었습니다."));
    }

    // -----------------------------------------------------------------------
    // Links
    // -----------------------------------------------------------------------

    /**
     * GET /api/hackathon/teams/{teamId}/links
     */
    @GetMapping("/teams/{teamId}/links")
    public ResponseEntity<List<HackathonTeamLink>> getLinks(
        @PathVariable Long teamId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonTeamService.getLinks(teamId));
    }

    /**
     * POST /api/hackathon/teams/{teamId}/links
     */
    @PostMapping("/teams/{teamId}/links")
    public ResponseEntity<?> addLink(
        @PathVariable Long teamId,
        @RequestBody CreateLinkRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        Long userId = extractUserId(authentication);
        Long id = hackathonTeamService.addLink(teamId, userId, req);
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * DELETE /api/hackathon/teams/{teamId}/links/{linkId}
     */
    @DeleteMapping("/teams/{teamId}/links/{linkId}")
    public ResponseEntity<?> deleteLink(
        @PathVariable Long teamId,
        @PathVariable Long linkId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonTeamService.deleteLink(linkId);
        return ResponseEntity.ok(Map.of("message", "링크가 삭제되었습니다."));
    }

    // -----------------------------------------------------------------------
    // Tasks
    // -----------------------------------------------------------------------

    /**
     * GET /api/hackathon/teams/{teamId}/tasks
     */
    @GetMapping("/teams/{teamId}/tasks")
    public ResponseEntity<List<HackathonTeamTask>> getTasks(
        @PathVariable Long teamId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonTeamService.getTasks(teamId));
    }

    /**
     * POST /api/hackathon/teams/{teamId}/tasks
     */
    @PostMapping("/teams/{teamId}/tasks")
    public ResponseEntity<?> createTask(
        @PathVariable Long teamId,
        @RequestBody CreateTaskRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        Long userId = extractUserId(authentication);
        Long id = hackathonTeamService.createTask(teamId, userId, req);
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * PUT /api/hackathon/teams/{teamId}/tasks/{taskId}
     */
    @PutMapping("/teams/{teamId}/tasks/{taskId}")
    public ResponseEntity<?> updateTask(
        @PathVariable Long teamId,
        @PathVariable Long taskId,
        @RequestBody UpdateTaskRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonTeamService.updateTask(taskId, req);
        return ResponseEntity.ok(Map.of("message", "태스크가 수정되었습니다."));
    }

    /**
     * DELETE /api/hackathon/teams/{teamId}/tasks/{taskId}
     */
    @DeleteMapping("/teams/{teamId}/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(
        @PathVariable Long teamId,
        @PathVariable Long taskId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonTeamService.deleteTask(taskId);
        return ResponseEntity.ok(Map.of("message", "태스크가 삭제되었습니다."));
    }

    // -----------------------------------------------------------------------
    // Issues
    // -----------------------------------------------------------------------

    /**
     * GET /api/hackathon/teams/{teamId}/issues
     */
    @GetMapping("/teams/{teamId}/issues")
    public ResponseEntity<List<HackathonTeamIssue>> getIssues(
        @PathVariable Long teamId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonTeamService.getIssues(teamId));
    }

    /**
     * POST /api/hackathon/teams/{teamId}/issues
     */
    @PostMapping("/teams/{teamId}/issues")
    public ResponseEntity<?> createIssue(
        @PathVariable Long teamId,
        @RequestBody CreateIssueRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        Long userId = extractUserId(authentication);
        Long id = hackathonTeamService.createIssue(teamId, userId, req);
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * PUT /api/hackathon/teams/{teamId}/issues/{issueId}
     */
    @PutMapping("/teams/{teamId}/issues/{issueId}")
    public ResponseEntity<?> updateIssue(
        @PathVariable Long teamId,
        @PathVariable Long issueId,
        @RequestBody UpdateIssueRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonTeamService.updateIssue(issueId, req);
        return ResponseEntity.ok(Map.of("message", "이슈가 수정되었습니다."));
    }

    // -----------------------------------------------------------------------
    // FAQs
    // -----------------------------------------------------------------------

    /**
     * GET /api/hackathon/teams/{teamId}/faq
     */
    @GetMapping("/teams/{teamId}/faq")
    public ResponseEntity<List<HackathonTeamFaq>> getFaqs(
        @PathVariable Long teamId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(hackathonTeamService.getFaqs(teamId));
    }

    /**
     * POST /api/hackathon/teams/{teamId}/faq
     */
    @PostMapping("/teams/{teamId}/faq")
    public ResponseEntity<?> createFaq(
        @PathVariable Long teamId,
        @RequestBody CreateFaqRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        Long userId = extractUserId(authentication);
        Long id = hackathonTeamService.createFaq(teamId, userId, req);
        return ResponseEntity.ok(Map.of("id", id));
    }

    /**
     * PUT /api/hackathon/teams/{teamId}/faq/{faqId}
     */
    @PutMapping("/teams/{teamId}/faq/{faqId}")
    public ResponseEntity<?> updateFaq(
        @PathVariable Long teamId,
        @PathVariable Long faqId,
        @RequestBody UpdateFaqRequest req,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonTeamService.updateFaq(faqId, req);
        return ResponseEntity.ok(Map.of("message", "FAQ가 수정되었습니다."));
    }

    /**
     * DELETE /api/hackathon/teams/{teamId}/faq/{faqId}
     */
    @DeleteMapping("/teams/{teamId}/faq/{faqId}")
    public ResponseEntity<?> deleteFaq(
        @PathVariable Long teamId,
        @PathVariable Long faqId,
        Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        hackathonTeamService.deleteFaq(faqId);
        return ResponseEntity.ok(Map.of("message", "FAQ가 삭제되었습니다."));
    }

    // -----------------------------------------------------------------------
    // Helper
    // -----------------------------------------------------------------------

    private Long extractUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.mapo.palantier.user.domain.User) {
            return ((com.mapo.palantier.user.domain.User) principal).getId();
        }
        return null;
    }
}
