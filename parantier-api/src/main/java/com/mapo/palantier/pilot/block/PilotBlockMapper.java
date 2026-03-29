package com.mapo.palantier.pilot.block;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PilotBlockMapper {
    List<PilotBlock> findByPostId(@Param("postId") Long postId);

    void insert(PilotBlock block);
    void deleteByPostId(@Param("postId") Long postId);
}
