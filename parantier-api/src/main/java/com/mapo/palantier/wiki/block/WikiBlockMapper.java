package com.mapo.palantier.wiki.block;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface WikiBlockMapper {
    List<WikiBlock> findByPostId(@Param("postId") Long postId);
    void insert(WikiBlock block);
    void deleteByPostId(@Param("postId") Long postId);
}
