package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiGithubItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiGithubItemMapper {
    List<SubutaiGithubItem> findByFolderId(@Param("folderId") Long folderId);
    List<SubutaiGithubItem> findByIds(@Param("ids") List<Long> ids);
    Optional<SubutaiGithubItem> findById(@Param("id") Long id);
    void insert(SubutaiGithubItem item);
    void delete(@Param("id") Long id);
}
