package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueMindmap;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueMindmapMapper {

    /**
     * 특정 이슈의 마인드맵 목록 조회
     */
    List<IssueMindmap> findByIssueId(@Param("issueId") Long issueId);

    /**
     * 마인드맵 항목 추가
     */
    void insert(IssueMindmap mindmap);

    /**
     * 마인드맵 항목 수정
     */
    void update(IssueMindmap mindmap);

    /**
     * 마인드맵 항목 삭제
     */
    void delete(@Param("id") Long id);

    /**
     * 이슈의 모든 마인드맵 삭제
     */
    void deleteByIssueId(@Param("issueId") Long issueId);
}
