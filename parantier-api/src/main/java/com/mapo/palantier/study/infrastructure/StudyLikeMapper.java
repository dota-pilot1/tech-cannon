package com.mapo.palantier.study.infrastructure;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface StudyLikeMapper {
    boolean existsByPostAndUser(
        @Param("postId") Long postId,
        @Param("userId") Long userId
    );
    void insert(@Param("postId") Long postId, @Param("userId") Long userId);
    void delete(@Param("postId") Long postId, @Param("userId") Long userId);
    long countByPost(@Param("postId") Long postId);
}
