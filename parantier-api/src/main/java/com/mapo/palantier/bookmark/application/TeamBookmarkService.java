package com.mapo.palantier.bookmark.application;

import com.mapo.palantier.bookmark.domain.TeamBookmark;
import com.mapo.palantier.bookmark.domain.TeamBookmarkWithUser;
import com.mapo.palantier.bookmark.infrastructure.TeamBookmarkMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TeamBookmarkService {

    private final TeamBookmarkMapper teamBookmarkMapper;

    public TeamBookmarkService(TeamBookmarkMapper teamBookmarkMapper) {
        this.teamBookmarkMapper = teamBookmarkMapper;
    }

    /**
     * 전체 즐겨찾기 목록 조회 (작성자 정보 포함, 최신순 정렬)
     */
    public List<TeamBookmarkWithUser> getAll() {
        return teamBookmarkMapper.findAll();
    }

    /**
     * 즐겨찾기 생성
     */
    @Transactional
    public TeamBookmark create(Long userId, String title, String url, String description, String category) {
        TeamBookmark bookmark = new TeamBookmark();
        bookmark.setTitle(title);
        bookmark.setUrl(url);
        bookmark.setDescription(description);
        bookmark.setCategory(category);
        bookmark.setCreatedBy(userId);

        teamBookmarkMapper.insert(bookmark);
        return bookmark;
    }

    /**
     * 즐겨찾기 삭제 (본인만 삭제 가능)
     */
    @Transactional
    public void delete(Long id, Long userId) {
        teamBookmarkMapper.delete(id, userId);
    }
}
