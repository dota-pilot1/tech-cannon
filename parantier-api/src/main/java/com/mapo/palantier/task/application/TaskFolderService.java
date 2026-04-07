package com.mapo.palantier.task.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.task.domain.TaskFolder;
import com.mapo.palantier.task.domain.TaskFolderRepository;
import com.mapo.palantier.task.presentation.dto.TaskFolderRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskFolderService {

    private final TaskFolderRepository taskFolderRepository;

    public List<TaskFolder> getAllFolders() {
        return taskFolderRepository.findAll();
    }

    public TaskFolder getFolderById(Long id) {
        return taskFolderRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.TASK_FOLDER_NOT_FOUND)
            );
    }

    @Transactional
    public Long createFolder(TaskFolderRequest request, Long currentUserId) {
        TaskFolder folder = TaskFolder.create(
            request.getParentId(),
            request.getName(),
            request.getSortOrder(),
            currentUserId
        );
        taskFolderRepository.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, TaskFolderRequest request) {
        TaskFolder existing = getFolderById(id);
        TaskFolder updated = existing.withUpdated(
            request.getName(),
            request.getParentId(),
            request.getSortOrder()
        );
        taskFolderRepository.update(updated);
    }

    @Transactional
    public void deleteFolder(Long id) {
        taskFolderRepository.softDelete(id);
    }
}
