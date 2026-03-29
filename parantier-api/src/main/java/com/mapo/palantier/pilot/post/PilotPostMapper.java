package com.mapo.palantier.pilot.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PilotPostMapper {
    List<PilotPost> findAll();
    List<PilotPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<PilotPost> findById(@Param("id") Long id);
    Optional<PilotPost> findByIdWithBlocks(@Param("id") Long id);

    void insert(PilotPost post);
    void update(PilotPost post);
    void softDelete(@Param("id") Long id);
}
