package com.mapo.palantier.db.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DbPostMapper {
    List<DbPost> findAll();
    List<DbPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<DbPost> findById(@Param("id") Long id);
    Optional<DbPost> findByIdWithBlocks(@Param("id") Long id);
    void insert(DbPost post);
    void update(DbPost post);
    void softDelete(@Param("id") Long id);
}
