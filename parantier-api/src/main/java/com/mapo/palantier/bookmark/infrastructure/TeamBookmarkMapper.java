package com.mapo.palantier.bookmark.infrastructure;

import com.mapo.palantier.bookmark.domain.TeamBookmark;
import com.mapo.palantier.bookmark.domain.TeamBookmarkWithUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TeamBookmarkMapper {

    /**
     * 전체 즐겨찾기 목록 조회 (작성자 정보 포함, 최신순 정렬)
     */
    List<TeamBookmarkWithUser> findAll();

    /**
     * 즐겨찾기 생성
     */
    void insert(TeamBookmark bookmark);

    /**
     * 즐겨찾기 삭제 (본인만 삭제 가능)
     */
    void delete(@Param("id") Long id, @Param("userId") Long userId);
}
