package com.mapo.palantier.subutai.folder;

import com.mapo.palantier.subutai.dto.SubutaiFolderDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiFolderService {

    private final SubutaiFolderMapper subutaiFolderMapper;

    public List<SubutaiFolder> getAllFolders() {
        return subutaiFolderMapper.findAll();
    }

    public SubutaiFolder getFolderById(Long id) {
        return subutaiFolderMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id)
            );
    }

    @Transactional
    public Long createFolder(SubutaiFolderDto dto, Long currentUserId) {
        SubutaiFolder folder = SubutaiFolder.builder()
            .parentId(dto.getParentId())
            .name(dto.getName())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .createdBy(currentUserId)
            .build();

        subutaiFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, SubutaiFolderDto dto) {
        SubutaiFolder existing = getFolderById(id);
        SubutaiFolder folder = SubutaiFolder.builder()
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

        subutaiFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        subutaiFolderMapper.softDelete(id);
    }
}
