package com.mapo.palantier.prototype.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ProtoPostMapper {
    List<ProtoPost> findAll();
    List<ProtoPost> findByFolderId(@Param("folderId") Long folderId);
    Optional<ProtoPost> findById(@Param("id") Long id);
    Optional<ProtoPost> findByIdWithBlocks(@Param("id") Long id);
    void insert(ProtoPost post);
    void update(ProtoPost post);
    void softDelete(@Param("id") Long id);
}
