package com.mapo.palantier.wiki.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.wiki.domain.WikiFolder;
import com.mapo.palantier.wiki.domain.WikiFolderRepository;
import com.mapo.palantier.wiki.presentation.dto.WikiFolderRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WikiFolderService {

    private final WikiFolderRepository wikiFolderRepository;

    public List<WikiFolder> getAllFolders() {
        return wikiFolderRepository.findAll();
    }

    public WikiFolder getFolderById(Long id) {
        return wikiFolderRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.WIKI_FOLDER_NOT_FOUND)
            );
    }

    @Transactional
    public Long createFolder(WikiFolderRequest request, Long currentUserId) {
        WikiFolder folder = WikiFolder.create(
            request.getParentId(),
            request.getName(),
            request.getSortOrder(),
            currentUserId
        );
        wikiFolderRepository.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, WikiFolderRequest request) {
        WikiFolder existing = getFolderById(id);
        WikiFolder updated = existing.withUpdated(
            request.getName(),
            request.getParentId(),
            request.getSortOrder()
        );
        wikiFolderRepository.update(updated);
    }

    @Transactional
    public void deleteFolder(Long id) {
        wikiFolderRepository.softDelete(id);
    }
}
