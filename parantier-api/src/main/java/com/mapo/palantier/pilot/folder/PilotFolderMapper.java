package com.mapo.palantier.pilot.folder;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface PilotFolderMapper {
    List<PilotFolder> findAll();
    Optional<PilotFolder> findById(@Param("id") Long id);

    void insert(PilotFolder folder);
    void update(PilotFolder folder);
    void softDelete(@Param("id") Long id);
}
