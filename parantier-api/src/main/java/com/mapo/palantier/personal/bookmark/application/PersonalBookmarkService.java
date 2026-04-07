package com.mapo.palantier.personal.bookmark.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ForbiddenException;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.personal.bookmark.domain.PersonalBookmark;
import com.mapo.palantier.personal.bookmark.domain.PersonalBookmarkRepository;
import com.mapo.palantier.personal.bookmark.presentation.dto.PersonalBookmarkRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalBookmarkService {

    private final PersonalBookmarkRepository personalBookmarkRepository;

    public List<PersonalBookmark> getMyBookmarks(Long userId) {
        return personalBookmarkRepository.findByUserId(userId);
    }

    @Transactional
    public Long createBookmark(PersonalBookmarkRequest dto, Long userId) {
        PersonalBookmark bookmark = PersonalBookmark.builder()
            .userId(userId)
            .title(dto.getTitle() != null ? dto.getTitle() : "제목 없음")
            .url(dto.getUrl())
            .description(dto.getDescription())
            .category(dto.getCategory())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .build();
        personalBookmarkRepository.insert(bookmark);
        return bookmark.getId();
    }

    @Transactional
    public void updateBookmark(Long id, PersonalBookmarkRequest dto, Long userId) {
        PersonalBookmark existing = personalBookmarkRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.BOOKMARK_NOT_FOUND)
            );
        if (!existing.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_UPDATE);
        }
        PersonalBookmark bookmark = PersonalBookmark.builder()
            .id(existing.getId())
            .userId(existing.getUserId())
            .title(
                dto.getTitle() != null ? dto.getTitle() : existing.getTitle()
            )
            .url(dto.getUrl() != null ? dto.getUrl() : existing.getUrl())
            .description(dto.getDescription())
            .category(dto.getCategory())
            .sortOrder(
                dto.getSortOrder() != null
                    ? dto.getSortOrder()
                    : existing.getSortOrder()
            )
            .build();
        personalBookmarkRepository.update(bookmark);
    }

    @Transactional
    public void deleteBookmark(Long id, Long userId) {
        PersonalBookmark bookmark = personalBookmarkRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.BOOKMARK_NOT_FOUND)
            );
        if (!bookmark.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_DELETE);
        }
        personalBookmarkRepository.softDelete(id);
    }
}
