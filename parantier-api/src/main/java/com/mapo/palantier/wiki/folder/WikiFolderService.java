package com.mapo.palantier.wiki.folder;

import com.mapo.palantier.wiki.dto.WikiFolderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WikiFolderService {
    private final WikiFolderMapper wikifolderMapper;

    public List<WikiFolder> getAllFolders() {
        return wikifolderMapper.findAll();
    }

    public WikiFolder getFolderById(Long id) {
        return wikifolderMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long createFolder(WikiFolderDto dto, Long currentUserId) {
        WikiFolder folder = new WikiFolder();
        folder.setParentId(dto.getParentId());
        folder.setName(dto.getName());
        folder.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        folder.setCreatedBy(currentUserId);
        wikifolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, WikiFolderDto dto) {
        WikiFolder folder = getFolderById(id);
        folder.setName(dto.getName());
        if (dto.getParentId() != null) folder.setParentId(dto.getParentId());
        if (dto.getSortOrder() != null) folder.setSortOrder(dto.getSortOrder());
        wikifolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        wikifolderMapper.softDelete(id);
    }
}
