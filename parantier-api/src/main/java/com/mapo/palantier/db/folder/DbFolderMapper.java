package com.mapo.palantier.db.folder;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DbFolderMapper {
    List<DbFolder> findAll();
    Optional<DbFolder> findById(@Param("id") Long id);
    void insert(DbFolder folder);
    void update(DbFolder folder);
    void softDelete(@Param("id") Long id);
}
