package com.mapo.palantier.wiki.domain;

import java.util.List;
import java.util.Optional;

public interface WikiFolderRepository {
    List<WikiFolder> findAll();
    Optional<WikiFolder> findById(Long id);
    void insert(WikiFolder folder);
    void update(WikiFolder folder);
    void softDelete(Long id);
}
