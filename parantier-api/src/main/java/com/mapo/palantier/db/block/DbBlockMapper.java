package com.mapo.palantier.db.block;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DbBlockMapper {
    List<DbBlock> findByPostId(@Param("postId") Long postId);
    void insert(DbBlock block);
    void deleteByPostId(@Param("postId") Long postId);
}
