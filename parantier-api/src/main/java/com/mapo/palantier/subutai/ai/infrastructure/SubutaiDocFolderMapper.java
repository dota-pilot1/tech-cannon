package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiDocFolder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiDocFolderMapper {
    List<SubutaiDocFolder> findAll();
    Optional<SubutaiDocFolder> findById(@Param("id") Long id);
    void insert(SubutaiDocFolder folder);
    void update(@Param("id") Long id, @Param("name") String name);
    void delete(@Param("id") Long id);
}
