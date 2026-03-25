package com.palantier.domain.task.folder;

import com.palantier.domain.task.dto.TaskFolderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskFolderService {
    private final TaskFolderMapper taskFolderMapper;

    public List<TaskFolder> getAllFolders() {
        return taskFolderMapper.findAll();
    }

    public TaskFolder getFolderById(Long id) {
        return taskFolderMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long createFolder(TaskFolderDto dto, Long currentUserId) {
        TaskFolder folder = new TaskFolder();
        folder.setParentId(dto.getParentId());
        folder.setName(dto.getName());
        folder.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        folder.setCreatedBy(currentUserId);

        taskFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, TaskFolderDto dto) {
        TaskFolder folder = getFolderById(id);
        folder.setName(dto.getName());
        if (dto.getParentId() != null) {
            folder.setParentId(dto.getParentId());
        }
        if (dto.getSortOrder() != null) {
            folder.setSortOrder(dto.getSortOrder());
        }

        taskFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        taskFolderMapper.softDelete(id);
    }
}
