package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiDocTag;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SubutaiDocTagMapper {
    List<SubutaiDocTag> findByPostId(@Param("postId") Long postId);
    List<SubutaiDocTag> findAll();
    void insert(SubutaiDocTag tag);
    void deleteByPostId(@Param("postId") Long postId);
}
