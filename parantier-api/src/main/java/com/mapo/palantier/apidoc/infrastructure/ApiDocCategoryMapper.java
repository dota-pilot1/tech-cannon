package com.mapo.palantier.apidoc.infrastructure;

import com.mapo.palantier.apidoc.domain.ApiDocCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface ApiDocCategoryMapper {
    List<ApiDocCategory> findAll();
    Optional<ApiDocCategory> findById(Long id);
    void insert(ApiDocCategory category);
    void update(ApiDocCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
