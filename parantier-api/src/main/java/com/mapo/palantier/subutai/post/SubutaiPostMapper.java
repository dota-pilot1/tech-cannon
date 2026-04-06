package com.mapo.palantier.subutai.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiPostMapper {
    List<SubutaiPost> findAll();
    List<SubutaiPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<SubutaiPost> findById(@Param("id") Long id);
    Optional<SubutaiPost> findByIdWithBlocks(@Param("id") Long id);

    void insert(SubutaiPost post);
    void update(SubutaiPost post);
    void softDelete(@Param("id") Long id);
}
