package com.mapo.palantier.wiki.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface WikiPostMapper {
    List<WikiPost> findAll();
    List<WikiPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<WikiPost> findById(@Param("id") Long id);
    Optional<WikiPost> findByIdWithBlocks(@Param("id") Long id);
    void insert(WikiPost post);
    void update(WikiPost post);
    void softDelete(@Param("id") Long id);
}
