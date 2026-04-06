package com.mapo.palantier.subutai.folder;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiFolderMapper {
    List<SubutaiFolder> findAll();
    Optional<SubutaiFolder> findById(@Param("id") Long id);

    void insert(SubutaiFolder folder);
    void update(SubutaiFolder folder);
    void softDelete(@Param("id") Long id);
}
