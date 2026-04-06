package com.mapo.palantier.subutai.block;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubutaiBlockMapper {
    List<SubutaiBlock> findByPostId(@Param("postId") Long postId);

    void insert(SubutaiBlock block);
    void deleteByPostId(@Param("postId") Long postId);
}
