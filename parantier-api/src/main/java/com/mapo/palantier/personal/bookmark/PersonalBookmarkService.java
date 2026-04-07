package com.mapo.palantier.personal.bookmark;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PersonalBookmarkService {

    private final PersonalBookmarkMapper personalBookmarkMapper;

    public List<PersonalBookmark> getMyBookmarks(Long userId) {
        return personalBookmarkMapper.findByUserId(userId);
    }

    @Transactional
    public Long createBookmark(PersonalBookmarkDto dto, Long userId) {
        PersonalBookmark bookmark = PersonalBookmark.builder()
            .userId(userId)
            .title(dto.getTitle() != null ? dto.getTitle() : "제목 없음")
            .url(dto.getUrl())
            .description(dto.getDescription())
            .category(dto.getCategory())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .build();
        personalBookmarkMapper.insert(bookmark);
        return bookmark.getId();
    }

    @Transactional
    public void updateBookmark(Long id, PersonalBookmarkDto dto, Long userId) {
        PersonalBookmark existing = personalBookmarkMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "즐겨찾기를 찾을 수 없습니다: " + id
                )
            );
        if (!existing.getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다");
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
        personalBookmarkMapper.update(bookmark);
    }

    @Transactional
    public void deleteBookmark(Long id, Long userId) {
        PersonalBookmark bookmark = personalBookmarkMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "즐겨찾기를 찾을 수 없습니다: " + id
                )
            );
        if (!bookmark.getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다");
        }
        personalBookmarkMapper.softDelete(id);
    }
}
