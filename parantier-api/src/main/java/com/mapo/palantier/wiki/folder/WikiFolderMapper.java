package com.mapo.palantier.wiki.folder;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface WikiFolderMapper {
    List<WikiFolder> findAll();
    Optional<WikiFolder> findById(@Param("id") Long id);
    void insert(WikiFolder folder);
    void update(WikiFolder folder);
    void softDelete(@Param("id") Long id);
}
