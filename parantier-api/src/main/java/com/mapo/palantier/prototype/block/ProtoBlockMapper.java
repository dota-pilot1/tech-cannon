package com.mapo.palantier.prototype.block;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ProtoBlockMapper {
    List<ProtoBlock> findByPostId(@Param("postId") Long postId);
    void insert(ProtoBlock block);
    void deleteByPostId(@Param("postId") Long postId);
}
