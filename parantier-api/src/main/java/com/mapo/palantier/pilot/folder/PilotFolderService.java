package com.mapo.palantier.pilot.folder;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.pilot.dto.PilotFolderDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PilotFolderService {

    private final PilotFolderMapper pilotFolderMapper;

    public List<PilotFolder> getAllFolders() {
        return pilotFolderMapper.findAll();
    }

    public PilotFolder getFolderById(Long id) {
        return pilotFolderMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.PILOT_FOLDER_NOT_FOUND)
            );
    }

    @Transactional
    public Long createFolder(PilotFolderDto dto, Long currentUserId) {
        PilotFolder folder = PilotFolder.builder()
            .parentId(dto.getParentId())
            .name(dto.getName())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .createdBy(currentUserId)
            .build();
        pilotFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, PilotFolderDto dto) {
        PilotFolder existing = getFolderById(id);
        PilotFolder updated = PilotFolder.builder()
            .id(existing.getId())
            .parentId(
                dto.getParentId() != null
                    ? dto.getParentId()
                    : existing.getParentId()
            )
            .name(dto.getName())
            .sortOrder(
                dto.getSortOrder() != null
                    ? dto.getSortOrder()
                    : existing.getSortOrder()
            )
            .createdBy(existing.getCreatedBy())
            .createdAt(existing.getCreatedAt())
            .build();
        pilotFolderMapper.update(updated);
    }

    @Transactional
    public void deleteFolder(Long id) {
        pilotFolderMapper.softDelete(id);
    }
}
