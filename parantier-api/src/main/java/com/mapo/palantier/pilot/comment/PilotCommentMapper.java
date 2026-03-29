package com.mapo.palantier.pilot.comment;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotCommentMapper {
    List<PilotComment> findByPostId(@Param("postId") Long postId);

    void insert(PilotComment comment);
    void softDelete(@Param("id") Long id);
}
