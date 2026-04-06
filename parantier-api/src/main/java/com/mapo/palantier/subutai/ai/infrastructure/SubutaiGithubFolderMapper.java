package com.mapo.palantier.subutai.ai.infrastructure;

import com.mapo.palantier.subutai.ai.domain.SubutaiGithubFolder;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SubutaiGithubFolderMapper {
    List<SubutaiGithubFolder> findAll();
    Optional<SubutaiGithubFolder> findById(@Param("id") Long id);
    void insert(SubutaiGithubFolder folder);
    void delete(@Param("id") Long id);
    void update(SubutaiGithubFolder folder);
}
