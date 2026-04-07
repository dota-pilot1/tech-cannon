package com.mapo.palantier.wiki.domain;

import com.mapo.palantier.wiki.presentation.dto.WikiPostDetail;
import com.mapo.palantier.wiki.presentation.dto.WikiPostSummary;
import java.util.List;
import java.util.Optional;

public interface WikiPostRepository {
    List<WikiPostSummary> findAll();
    List<WikiPostSummary> findByFolderId(Long folderId);
    Optional<WikiPostSummary> findById(Long id);
    Optional<WikiPostDetail> findByIdWithBlocks(Long id);
    void insert(WikiPost post);
    void update(WikiPost post);
    void softDelete(Long id);
}
