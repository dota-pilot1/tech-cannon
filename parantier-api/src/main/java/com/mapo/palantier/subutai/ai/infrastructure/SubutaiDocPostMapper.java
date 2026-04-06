package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiDocPost;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiDocPostMapper {
    List<SubutaiDocPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<SubutaiDocPost> findById(@Param("id") Long id);
    void insert(SubutaiDocPost post);
    void update(@Param("id") Long id, @Param("title") String title);
    void delete(@Param("id") Long id);
}
