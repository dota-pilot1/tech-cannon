package com.mapo.palantier.security.infrastructure;

import com.mapo.palantier.security.domain.SecuritySection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SecuritySectionMapper {
    List<SecuritySection> findByCategoryId(Long categoryId);
    Optional<SecuritySection> findById(Long id);
    void insert(SecuritySection section);
    void update(SecuritySection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
