package com.mapo.palantier.workspace.infrastructure;

import com.mapo.palantier.workspace.domain.WorkspaceNode;
import com.mapo.palantier.workspace.domain.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class WorkspaceRepositoryImpl implements WorkspaceRepository {
    private final WorkspaceMapper workspaceMapper;

    @Override
    public List<WorkspaceNode> findAll() {
        return workspaceMapper.findAll();
    }

    @Override
    public List<WorkspaceNode> findAllByUserId(Long userId) {
        return workspaceMapper.findAllByUserId(userId);
    }

    @Override
    public List<WorkspaceNode> findTreeByUserId(Long userId) {
        return workspaceMapper.findTreeByUserId(userId);
    }

    @Override
    public List<WorkspaceNode> findChildNodes(Long parentId) {
        return workspaceMapper.findChildNodes(parentId);
    }

    @Override
    public Optional<WorkspaceNode> findById(Long id) {
        return workspaceMapper.findById(id);
    }

    @Override
    public List<WorkspaceNode> searchByName(String query, Long userId) {
        return workspaceMapper.searchByName(query, userId);
    }

    @Override
    public void save(WorkspaceNode node) {
        workspaceMapper.insert(node);
    }

    @Override
    public void update(WorkspaceNode node) {
        workspaceMapper.update(node);
    }

    @Override
    public void updatePosition(Long id, Long parentId, Integer orderNum) {
        workspaceMapper.updatePosition(id, parentId, orderNum);
    }

    @Override
    public void deleteById(Long id) {
        workspaceMapper.deleteById(id);
    }

    @Override
    public void reorderNodes(Long parentId, List<Long> nodeIds) {
        for (int i = 0; i < nodeIds.size(); i++) {
            workspaceMapper.updateOrderNum(nodeIds.get(i), i);
        }
    }
}
