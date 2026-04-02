package com.mapo.palantier.db.folder;

import com.mapo.palantier.db.dto.DbFolderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DbFolderService {
    private final DbFolderMapper dbFolderMapper;

    public List<DbFolder> getAllFolders() {
        return dbFolderMapper.findAll();
    }

    public DbFolder getFolderById(Long id) {
        return dbFolderMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long createFolder(DbFolderDto dto, Long currentUserId) {
        DbFolder folder = new DbFolder();
        folder.setParentId(dto.getParentId());
        folder.setName(dto.getName());
        folder.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        folder.setCreatedBy(currentUserId);
        dbFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, DbFolderDto dto) {
        DbFolder folder = getFolderById(id);
        folder.setName(dto.getName());
        if (dto.getParentId() != null) folder.setParentId(dto.getParentId());
        if (dto.getSortOrder() != null) folder.setSortOrder(dto.getSortOrder());
        dbFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        dbFolderMapper.softDelete(id);
    }
}
