package com.mapo.palantier.apidoc.infrastructure;

import com.mapo.palantier.apidoc.domain.ApiDocSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ApiDocSectionMapper {
    List<ApiDocSection> findByCategoryId(Long categoryId);
    Optional<ApiDocSection> findById(Long id);
    void insert(ApiDocSection section);
    void update(ApiDocSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
