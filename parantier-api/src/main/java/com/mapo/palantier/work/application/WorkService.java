package com.mapo.palantier.work.application;

import com.mapo.palantier.work.domain.Work;
import com.mapo.palantier.work.infrastructure.WorkMapper;
import com.mapo.palantier.work.presentation.dto.WorkReorderItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class WorkService {

    private final WorkMapper workMapper;

    public WorkService(WorkMapper workMapper) {
        this.workMapper = workMapper;
    }

    public List<Work> getAllWorks(
        String workType,
        String status,
        String priority,
        Long assigneeId,
        String keyword,
        String sortBy,
        Integer page,
        Integer limit,
        Boolean isArchived
    ) {
        Map<String, Object> params = new HashMap<>();
        params.put("workType", workType);
        params.put("status", status);
        params.put("priority", priority);
        params.put("assigneeId", assigneeId);
        params.put("keyword", keyword);
        params.put("sortBy", sortBy);
        params.put("isArchived", isArchived);

        if (page != null && limit != null) {
            params.put("offset", page * limit);
            params.put("limit", limit);
        }

        return workMapper.findAll(params);
    }

    public Work getWorkById(Long id) {
        return workMapper.findById(id);
    }

    public int getTotalCount(
        String workType,
        String status,
        String priority,
        Long assigneeId,
        String keyword,
        Boolean isArchived
    ) {
        Map<String, Object> params = new HashMap<>();
        params.put("workType", workType);
        params.put("status", status);
        params.put("priority", priority);
        params.put("assigneeId", assigneeId);
        params.put("keyword", keyword);
        params.put("isArchived", isArchived);

        return workMapper.count(params);
    }

    @Transactional
    public Work createWork(Work work) {
        workMapper.insert(work);
        return workMapper.findById(work.getId());
    }

    @Transactional
    public Work updateWork(Long id, Work work) {
        work.setId(id);
        workMapper.update(work);
        return workMapper.findById(id);
    }

    @Transactional
    public void deleteWork(Long id) {
        workMapper.delete(id);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        workMapper.updateStatus(id, status);
    }

    @Transactional
    public void updateAssignee(Long id, Long assigneeId) {
        workMapper.updateAssignee(id, assigneeId);
    }

    @Transactional
    public void updatePriority(Long id, String priority) {
        workMapper.updatePriority(id, priority);
    }

    @Transactional
    public void reorderWorks(List<WorkReorderItem> items) {
        for (WorkReorderItem item : items) {
            workMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    @Transactional
    public void archiveWorks(List<Long> ids) {
        workMapper.updateArchivedBatch(ids, true);
    }

    @Transactional
    public void restoreWorks(List<Long> ids) {
        workMapper.updateArchivedBatch(ids, false);
    }
}
