package com.mapo.palantier.workspace.presentation;

import com.mapo.palantier.workspace.application.WorkspaceService;
import com.mapo.palantier.workspace.domain.WorkspaceNode;
import com.mapo.palantier.workspace.presentation.dto.CreateNodeRequest;
import com.mapo.palantier.workspace.presentation.dto.MoveNodeRequest;
import com.mapo.palantier.workspace.presentation.dto.ReorderNodesRequest;
import com.mapo.palantier.workspace.presentation.dto.UpdateNodeRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "업무 관리", description = "업무 관리 API")
@RestController
@RequestMapping("/api/workspace")
@RequiredArgsConstructor
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @Operation(summary = "노드 트리 조회", description = "사용자의 전체 노드 트리 조회")
    @GetMapping("/tree")
    public ResponseEntity<List<WorkspaceNode>> getNodeTree(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        List<WorkspaceNode> tree = workspaceService.getNodeTree(userId);
        return ResponseEntity.ok(tree);
    }

    @Operation(summary = "모든 노드 조회 (플랫)", description = "사용자의 모든 노드를 플랫 리스트로 조회")
    @GetMapping("/nodes")
    public ResponseEntity<List<WorkspaceNode>> getAllNodes(Authentication auth) {
        Long userId = getUserIdFromAuth(auth);
        List<WorkspaceNode> nodes = workspaceService.getAllNodes(userId);
        return ResponseEntity.ok(nodes);
    }

    @Operation(summary = "노드 상세 조회", description = "특정 노드의 상세 정보 조회")
    @GetMapping("/nodes/{id}")
    public ResponseEntity<WorkspaceNode> getNodeById(@PathVariable Long id) {
        WorkspaceNode node = workspaceService.getNodeById(id);
        return ResponseEntity.ok(node);
    }

    @Operation(summary = "자식 노드 조회", description = "특정 노드의 자식 노드들 조회")
    @GetMapping("/nodes/{id}/children")
    public ResponseEntity<List<WorkspaceNode>> getChildNodes(@PathVariable Long id) {
        List<WorkspaceNode> children = workspaceService.getChildNodes(id);
        return ResponseEntity.ok(children);
    }

    @Operation(summary = "노드 검색", description = "이름으로 노드 검색")
    @GetMapping("/nodes/search")
    public ResponseEntity<List<WorkspaceNode>> searchNodes(
            @RequestParam String q,
            Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);
        List<WorkspaceNode> results = workspaceService.searchNodes(q, userId);
        return ResponseEntity.ok(results);
    }

    @Operation(summary = "노드 생성", description = "새로운 노드 생성 (폴더/태스크/문서)")
    @PostMapping("/nodes")
    public ResponseEntity<WorkspaceNode> createNode(
            @RequestBody CreateNodeRequest request,
            Authentication auth
    ) {
        Long userId = getUserIdFromAuth(auth);

        WorkspaceNode node = WorkspaceNode.builder()
                .name(request.getName())
                .description(request.getDescription())
                .nodeType(request.getNodeType())
                .status(request.getStatus())
                .priority(request.getPriority())
                .parentId(request.getParentId())
                .orderNum(request.getOrderNum())
                .createdBy(userId)
                .assignedTo(request.getAssignedTo())
                .dueDate(request.getDueDate())
                .isActive(true)
                .build();

        WorkspaceNode created = workspaceService.createNode(node);
        return ResponseEntity.ok(created);
    }

    @Operation(summary = "노드 수정", description = "기존 노드 정보 수정")
    @PutMapping("/nodes/{id}")
    public ResponseEntity<WorkspaceNode> updateNode(
            @PathVariable Long id,
            @RequestBody UpdateNodeRequest request
    ) {
        WorkspaceNode node = workspaceService.getNodeById(id);

        WorkspaceNode updated = WorkspaceNode.builder()
                .id(id)
                .name(request.getName())
                .description(request.getDescription())
                .nodeType(request.getNodeType())
                .status(request.getStatus())
                .priority(request.getPriority())
                .parentId(request.getParentId())
                .orderNum(request.getOrderNum())
                .createdBy(node.getCreatedBy())
                .assignedTo(request.getAssignedTo())
                .dueDate(request.getDueDate())
                .isActive(request.getIsActive())
                .build();

        WorkspaceNode result = workspaceService.updateNode(updated);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "노드 이동", description = "노드를 다른 부모로 이동 (드래그앤드롭)")
    @PutMapping("/nodes/{id}/move")
    public ResponseEntity<Void> moveNode(
            @PathVariable Long id,
            @RequestBody MoveNodeRequest request
    ) {
        workspaceService.moveNode(id, request.getParentId(), request.getOrderNum());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "노드 순서 재정렬", description = "같은 레벨의 노드들 순서 재정렬")
    @PutMapping("/nodes/reorder")
    public ResponseEntity<Void> reorderNodes(@RequestBody ReorderNodesRequest request) {
        workspaceService.reorderNodes(request.getParentId(), request.getNodeIds());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "노드 삭제", description = "노드 삭제 (자식 노드도 함께 삭제)")
    @DeleteMapping("/nodes/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable Long id) {
        workspaceService.deleteNode(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Authentication에서 userId 추출
     */
    private Long getUserIdFromAuth(Authentication auth) {
        // TODO: 실제 구현에서는 JWT 토큰이나 UserDetails에서 userId를 추출해야 합니다
        // 임시로 1L 반환
        return 1L;
    }
}
