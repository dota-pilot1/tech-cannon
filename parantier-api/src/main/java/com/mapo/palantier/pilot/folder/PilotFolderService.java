package com.mapo.palantier.pilot.folder;

import com.mapo.palantier.pilot.dto.PilotFolderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PilotFolderService {
    private final PilotFolderMapper pilotFolderMapper;

    public List<PilotFolder> getAllFolders() {
        return pilotFolderMapper.findAll();
    }

    public PilotFolder getFolderById(Long id) {
        return pilotFolderMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long createFolder(PilotFolderDto dto, Long currentUserId) {
        PilotFolder folder = new PilotFolder();
        folder.setParentId(dto.getParentId());
        folder.setName(dto.getName());
        folder.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        folder.setCreatedBy(currentUserId);

        pilotFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, PilotFolderDto dto) {
        PilotFolder folder = getFolderById(id);
        folder.setName(dto.getName());
        if (dto.getParentId() != null) {
            folder.setParentId(dto.getParentId());
        }
        if (dto.getSortOrder() != null) {
            folder.setSortOrder(dto.getSortOrder());
        }

        pilotFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        pilotFolderMapper.softDelete(id);
    }
}
