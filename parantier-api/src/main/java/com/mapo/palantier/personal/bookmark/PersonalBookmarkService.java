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
        PersonalBookmark bookmark = new PersonalBookmark();
        bookmark.setUserId(userId);
        bookmark.setTitle(dto.getTitle() != null ? dto.getTitle() : "제목 없음");
        bookmark.setUrl(dto.getUrl());
        bookmark.setDescription(dto.getDescription());
        bookmark.setCategory(dto.getCategory());
        bookmark.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        personalBookmarkMapper.insert(bookmark);
        return bookmark.getId();
    }

    @Transactional
    public void updateBookmark(Long id, PersonalBookmarkDto dto, Long userId) {
        PersonalBookmark bookmark = personalBookmarkMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("즐겨찾기를 찾을 수 없습니다: " + id));
        if (!bookmark.getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다");
        }
        bookmark.setTitle(dto.getTitle() != null ? dto.getTitle() : bookmark.getTitle());
        bookmark.setUrl(dto.getUrl() != null ? dto.getUrl() : bookmark.getUrl());
        bookmark.setDescription(dto.getDescription());
        bookmark.setCategory(dto.getCategory());
        if (dto.getSortOrder() != null) {
            bookmark.setSortOrder(dto.getSortOrder());
        }
        personalBookmarkMapper.update(bookmark);
    }

    @Transactional
    public void deleteBookmark(Long id, Long userId) {
        PersonalBookmark bookmark = personalBookmarkMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("즐겨찾기를 찾을 수 없습니다: " + id));
        if (!bookmark.getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다");
        }
        personalBookmarkMapper.softDelete(id);
    }
}
