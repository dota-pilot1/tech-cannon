package com.mapo.palantier.wiki.infrastructure;

import com.mapo.palantier.wiki.domain.WikiPost;
import com.mapo.palantier.wiki.presentation.dto.WikiPostDetail;
import com.mapo.palantier.wiki.presentation.dto.WikiPostSummary;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface WikiPostMapper {
    List<WikiPostSummary> findAll();
    List<WikiPostSummary> findByFolderId(@Param("folderId") Long folderId);
    Optional<WikiPostSummary> findById(@Param("id") Long id);
    Optional<WikiPostDetail> findByIdWithBlocks(@Param("id") Long id);

    void insert(WikiPost post);
    void update(WikiPost post);
    void softDelete(@Param("id") Long id);
}
