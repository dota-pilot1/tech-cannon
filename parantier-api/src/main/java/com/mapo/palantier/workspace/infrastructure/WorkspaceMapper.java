package com.mapo.palantier.workspace.infrastructure;

import com.mapo.palantier.workspace.domain.WorkspaceNode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WorkspaceMapper {
    // 조회
    List<WorkspaceNode> findAll();
    List<WorkspaceNode> findAllByUserId(@Param("userId") Long userId);
    List<WorkspaceNode> findTreeByUserId(@Param("userId") Long userId);
    List<WorkspaceNode> findChildNodes(@Param("parentId") Long parentId);
    Optional<WorkspaceNode> findById(@Param("id") Long id);
    List<WorkspaceNode> searchByName(@Param("query") String query, @Param("userId") Long userId);

    // CUD
    void insert(WorkspaceNode node);
    void update(WorkspaceNode node);
    void updatePosition(@Param("id") Long id, @Param("parentId") Long parentId, @Param("orderNum") Integer orderNum);
    void deleteById(@Param("id") Long id);

    // 순서 재정렬
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") Integer orderNum);
}
