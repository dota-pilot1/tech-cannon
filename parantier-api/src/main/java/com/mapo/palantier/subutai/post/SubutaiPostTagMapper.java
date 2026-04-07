package com.mapo.palantier.subutai.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface SubutaiPostTagMapper {
    List<SubutaiPostTag> findByPostId(@Param("postId") Long postId);
    List<SubutaiPostTag> findAll();
    void insert(SubutaiPostTag tag);
    void deleteByPostId(@Param("postId") Long postId);
}
