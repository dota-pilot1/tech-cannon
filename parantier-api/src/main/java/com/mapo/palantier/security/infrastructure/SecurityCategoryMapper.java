package com.mapo.palantier.security.infrastructure;

import com.mapo.palantier.security.domain.SecurityCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SecurityCategoryMapper {
    List<SecurityCategory> findAll();
    Optional<SecurityCategory> findById(Long id);
    void insert(SecurityCategory category);
    void update(SecurityCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
