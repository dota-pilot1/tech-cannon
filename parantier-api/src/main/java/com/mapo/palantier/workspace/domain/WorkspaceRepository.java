package com.mapo.palantier.workspace.domain;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository {
    // 조회
    List<WorkspaceNode> findAll();
    List<WorkspaceNode> findAllByUserId(Long userId);
    List<WorkspaceNode> findTreeByUserId(Long userId);
    List<WorkspaceNode> findChildNodes(Long parentId);
    Optional<WorkspaceNode> findById(Long id);
    List<WorkspaceNode> searchByName(String query, Long userId);

    // CUD
    void save(WorkspaceNode node);
    void update(WorkspaceNode node);
    void updatePosition(Long id, Long parentId, Integer orderNum);
    void deleteById(Long id);

    // 순서 재정렬
    void reorderNodes(Long parentId, List<Long> nodeIds);
}
