package com.mapo.palantier.subutai.folder;

import com.mapo.palantier.subutai.dto.SubutaiFolderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiFolderService {
    private final SubutaiFolderMapper subutaiFolderMapper;

    public List<SubutaiFolder> getAllFolders() {
        return subutaiFolderMapper.findAll();
    }

    public SubutaiFolder getFolderById(Long id) {
        return subutaiFolderMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long createFolder(SubutaiFolderDto dto, Long currentUserId) {
        SubutaiFolder folder = new SubutaiFolder();
        folder.setParentId(dto.getParentId());
        folder.setName(dto.getName());
        folder.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        folder.setCreatedBy(currentUserId);

        subutaiFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, SubutaiFolderDto dto) {
        SubutaiFolder folder = getFolderById(id);
        folder.setName(dto.getName());
        if (dto.getParentId() != null) {
            folder.setParentId(dto.getParentId());
        }
        if (dto.getSortOrder() != null) {
            folder.setSortOrder(dto.getSortOrder());
        }

        subutaiFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        subutaiFolderMapper.softDelete(id);
    }
}
