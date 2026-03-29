package com.mapo.palantier.pilot.application;

import com.mapo.palantier.pilot.domain.Pilot;
import com.mapo.palantier.pilot.infrastructure.PilotMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PilotService {

    private final PilotMapper pilotMapper;

    public PilotService(PilotMapper pilotMapper) {
        this.pilotMapper = pilotMapper;
    }

    public List<Pilot> getAllPilots(
        String topic,
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
        params.put("topic", topic);
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

        return pilotMapper.findAll(params);
    }

    public Pilot getPilotById(Long id) {
        return pilotMapper.findById(id);
    }

    public int getTotalCount(
        String topic,
        String status,
        String priority,
        Long assigneeId,
        String keyword,
        Boolean isArchived
    ) {
        Map<String, Object> params = new HashMap<>();
        params.put("topic", topic);
        params.put("status", status);
        params.put("priority", priority);
        params.put("assigneeId", assigneeId);
        params.put("keyword", keyword);
        params.put("isArchived", isArchived);

        return pilotMapper.count(params);
    }

    @Transactional
    public Pilot createPilot(Pilot pilot) {
        pilotMapper.insert(pilot);
        return pilotMapper.findById(pilot.getId());
    }

    @Transactional
    public Pilot updatePilot(Long id, Pilot pilot) {
        pilot.setId(id);
        pilotMapper.update(pilot);
        return pilotMapper.findById(id);
    }

    @Transactional
    public void deletePilot(Long id) {
        pilotMapper.delete(id);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        pilotMapper.updateStatus(id, status);
    }

    @Transactional
    public void updateAssignee(Long id, Long assigneeId) {
        pilotMapper.updateAssignee(id, assigneeId);
    }

    @Transactional
    public void updatePriority(Long id, String priority) {
        pilotMapper.updatePriority(id, priority);
    }

    @Transactional
    public void updateOrderNum(Long id, Integer orderNum) {
        pilotMapper.updateOrderNum(id, orderNum);
    }

    @Transactional
    public void reorderPilots(List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            pilotMapper.updateOrderNum(ids.get(i), i);
        }
    }

    @Transactional
    public void archivePilots(List<Long> ids) {
        pilotMapper.updateArchivedBatch(ids, true);
    }

    @Transactional
    public void restorePilots(List<Long> ids) {
        pilotMapper.updateArchivedBatch(ids, false);
    }
}
