package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiGithubItem;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SubutaiGithubItemMapper {
    List<SubutaiGithubItem> findByFolderId(@Param("folderId") Long folderId);
    List<SubutaiGithubItem> findByIds(@Param("ids") List<Long> ids);
    Optional<SubutaiGithubItem> findById(@Param("id") Long id);
    void insert(SubutaiGithubItem item);
    void delete(@Param("id") Long id);
    void update(SubutaiGithubItem item);
}
