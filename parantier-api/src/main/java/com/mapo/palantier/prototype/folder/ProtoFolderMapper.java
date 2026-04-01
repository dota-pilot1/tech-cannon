package com.mapo.palantier.prototype.folder;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ProtoFolderMapper {
    List<ProtoFolder> findAll();
    Optional<ProtoFolder> findById(@Param("id") Long id);
    void insert(ProtoFolder folder);
    void update(ProtoFolder folder);
    void softDelete(@Param("id") Long id);
}
