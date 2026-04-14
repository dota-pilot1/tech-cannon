package com.mapo.palantier.prototypev2.infrastructure;

import com.mapo.palantier.prototypev2.domain.PrototypeCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PrototypeCategoryMapper {
    List<PrototypeCategory> findAll();
    Optional<PrototypeCategory> findById(Long id);
    void insert(PrototypeCategory category);
    void update(PrototypeCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
