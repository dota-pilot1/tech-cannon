package com.mapo.palantier.db.folder;

import com.mapo.palantier.db.dto.DbFolderDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DbFolderService {

    private final DbFolderMapper dbFolderMapper;

    public List<DbFolder> getAllFolders() {
        return dbFolderMapper.findAll();
    }

    public DbFolder getFolderById(Long id) {
        return dbFolderMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id)
            );
    }

    @Transactional
    public Long createFolder(DbFolderDto dto, Long currentUserId) {
        DbFolder folder = DbFolder.builder()
            .parentId(dto.getParentId())
            .name(dto.getName())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .createdBy(currentUserId)
            .build();
        dbFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, DbFolderDto dto) {
        DbFolder existing = getFolderById(id);
        DbFolder updated = DbFolder.builder()
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
        dbFolderMapper.update(updated);
    }

    @Transactional
    public void deleteFolder(Long id) {
        dbFolderMapper.softDelete(id);
    }
}
