package com.mapo.palantier.prompt.post;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PromptMapper {
    List<Prompt> findAll();
    List<Prompt> findByFolderId(@Param("folderId") Long folderId);
    Optional<Prompt> findById(@Param("id") Long id);
    void insert(Prompt prompt);
    void update(Prompt prompt);
    void softDelete(@Param("id") Long id);
}
