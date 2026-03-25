package com.mapo.palantier.workspace.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceNode {
    private Long id;
    private String name;
    private String description;
    private NodeType nodeType;
    private NodeStatus status;
    private NodePriority priority;
    private Long parentId;
    private Integer orderNum;
    private Long createdBy;
    private Long assignedTo;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isActive;

    // 트리 구조용 (조회 시에만 사용)
    @Builder.Default
    private List<WorkspaceNode> children = null;

    // 사용자 정보 (조회 시에만 사용)
    private String createdByUsername;
    private String assignedToUsername;
}
