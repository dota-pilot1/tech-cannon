package com.mapo.palantier.workspace.application;

import com.mapo.palantier.workspace.domain.WorkspaceNode;
import com.mapo.palantier.workspace.domain.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;

    /**
     * 사용자의 모든 노드 조회 (플랫)
     */
    public List<WorkspaceNode> getAllNodes(Long userId) {
        return workspaceRepository.findAllByUserId(userId);
    }

    /**
     * 사용자의 트리 구조 조회
     */
    public List<WorkspaceNode> getNodeTree(Long userId) {
        List<WorkspaceNode> allNodes = workspaceRepository.findTreeByUserId(userId);
        return buildTree(allNodes);
    }

    /**
     * 특정 노드의 자식 조회
     */
    public List<WorkspaceNode> getChildNodes(Long parentId) {
        return workspaceRepository.findChildNodes(parentId);
    }

    /**
     * 노드 상세 조회
     */
    public WorkspaceNode getNodeById(Long id) {
        return workspaceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkspaceNode not found: " + id));
    }

    /**
     * 노드 검색
     */
    public List<WorkspaceNode> searchNodes(String query, Long userId) {
        return workspaceRepository.searchByName(query, userId);
    }

    /**
     * 노드 생성
     */
    @Transactional
    public WorkspaceNode createNode(WorkspaceNode node) {
        // order_num 자동 설정 (마지막 순서 + 1)
        if (node.getOrderNum() == null) {
            List<WorkspaceNode> siblings = workspaceRepository.findChildNodes(node.getParentId());
            int maxOrder = siblings.stream()
                    .mapToInt(WorkspaceNode::getOrderNum)
                    .max()
                    .orElse(-1);
            node = WorkspaceNode.builder()
                    .name(node.getName())
                    .description(node.getDescription())
                    .nodeType(node.getNodeType())
                    .status(node.getStatus())
                    .priority(node.getPriority())
                    .parentId(node.getParentId())
                    .orderNum(maxOrder + 1)
                    .createdBy(node.getCreatedBy())
                    .assignedTo(node.getAssignedTo())
                    .dueDate(node.getDueDate())
                    .isActive(true)
                    .build();
        }
        workspaceRepository.save(node);
        return node;
    }

    /**
     * 노드 수정
     */
    @Transactional
    public WorkspaceNode updateNode(WorkspaceNode node) {
        workspaceRepository.update(node);
        return node;
    }

    /**
     * 노드 이동 (드래그앤드롭)
     */
    @Transactional
    public void moveNode(Long id, Long newParentId, Integer newOrderNum) {
        workspaceRepository.updatePosition(id, newParentId, newOrderNum);
    }

    /**
     * 노드 순서 재정렬
     */
    @Transactional
    public void reorderNodes(Long parentId, List<Long> nodeIds) {
        workspaceRepository.reorderNodes(parentId, nodeIds);
    }

    /**
     * 노드 삭제
     */
    @Transactional
    public void deleteNode(Long id) {
        workspaceRepository.deleteById(id);
    }

    /**
     * 플랫 리스트를 트리 구조로 변환
     */
    private List<WorkspaceNode> buildTree(List<WorkspaceNode> allNodes) {
        Map<Long, WorkspaceNode> nodeMap = new HashMap<>();
        List<WorkspaceNode> rootNodes = new ArrayList<>();

        // 1단계: 모든 노드를 Map에 저장
        for (WorkspaceNode node : allNodes) {
            nodeMap.put(node.getId(), node);
        }

        // 2단계: 부모-자식 관계 설정
        for (WorkspaceNode node : allNodes) {
            if (node.getParentId() == null) {
                rootNodes.add(node);
            } else {
                WorkspaceNode parent = nodeMap.get(node.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent = WorkspaceNode.builder()
                                .id(parent.getId())
                                .name(parent.getName())
                                .description(parent.getDescription())
                                .nodeType(parent.getNodeType())
                                .status(parent.getStatus())
                                .priority(parent.getPriority())
                                .parentId(parent.getParentId())
                                .orderNum(parent.getOrderNum())
                                .createdBy(parent.getCreatedBy())
                                .assignedTo(parent.getAssignedTo())
                                .dueDate(parent.getDueDate())
                                .createdAt(parent.getCreatedAt())
                                .updatedAt(parent.getUpdatedAt())
                                .isActive(parent.getIsActive())
                                .createdByUsername(parent.getCreatedByUsername())
                                .assignedToUsername(parent.getAssignedToUsername())
                                .children(new ArrayList<>())
                                .build();
                        nodeMap.put(parent.getId(), parent);
                    }
                    parent.getChildren().add(node);
                }
            }
        }

        // 3단계: 각 레벨에서 order_num으로 정렬
        sortChildren(rootNodes);
        return rootNodes;
    }

    /**
     * 자식 노드 정렬 (재귀)
     */
    private void sortChildren(List<WorkspaceNode> nodes) {
        if (nodes == null || nodes.isEmpty()) {
            return;
        }

        nodes.sort(Comparator.comparing(WorkspaceNode::getOrderNum));

        for (WorkspaceNode node : nodes) {
            if (node.getChildren() != null) {
                sortChildren(node.getChildren());
            }
        }
    }
}
