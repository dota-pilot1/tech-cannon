package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiDocSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SubutaiDocSectionMapper {
    List<SubutaiDocSection> findByPostId(@Param("postId") Long postId);
    void insert(SubutaiDocSection section);
    void update(SubutaiDocSection section);
    void delete(@Param("id") Long id);
    void deleteByPostId(@Param("postId") Long postId);
}
