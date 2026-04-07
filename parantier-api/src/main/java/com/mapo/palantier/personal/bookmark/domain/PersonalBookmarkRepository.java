package com.mapo.palantier.personal.bookmark.domain;

import java.util.List;
import java.util.Optional;

public interface PersonalBookmarkRepository {
    List<PersonalBookmark> findByUserId(Long userId);
    Optional<PersonalBookmark> findById(Long id);
    void insert(PersonalBookmark bookmark);
    void update(PersonalBookmark bookmark);
    void softDelete(Long id);
}
