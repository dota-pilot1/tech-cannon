package com.mapo.palantier.prompt.folder;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PromptFolderMapper {
    List<PromptFolder> findAll();
    void insert(PromptFolder folder);
    void update(@Param("id") Long id, @Param("name") String name);
    void delete(@Param("id") Long id);
    void updateSortOrder(@Param("id") Long id, @Param("sortOrder") int sortOrder);
}
