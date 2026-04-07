package com.mapo.palantier.personal.bookmark.infrastructure;

import com.mapo.palantier.personal.bookmark.domain.PersonalBookmark;
import com.mapo.palantier.personal.bookmark.domain.PersonalBookmarkRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PersonalBookmarkRepositoryImpl implements PersonalBookmarkRepository {

    private final PersonalBookmarkMapper personalBookmarkMapper;

    @Override
    public List<PersonalBookmark> findByUserId(Long userId) {
        return personalBookmarkMapper.findByUserId(userId);
    }

    @Override
    public Optional<PersonalBookmark> findById(Long id) {
        return personalBookmarkMapper.findById(id);
    }

    @Override
    public void insert(PersonalBookmark bookmark) {
        personalBookmarkMapper.insert(bookmark);
    }

    @Override
    public void update(PersonalBookmark bookmark) {
        personalBookmarkMapper.update(bookmark);
    }

    @Override
    public void softDelete(Long id) {
        personalBookmarkMapper.softDelete(id);
    }
}
