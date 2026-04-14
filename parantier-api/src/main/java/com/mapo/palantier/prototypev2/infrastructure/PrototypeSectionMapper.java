package com.mapo.palantier.prototypev2.infrastructure;

import com.mapo.palantier.prototypev2.domain.PrototypeSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface PrototypeSectionMapper {
    List<PrototypeSection> findByCategoryId(Long categoryId);
    Optional<PrototypeSection> findById(Long id);
    void insert(PrototypeSection section);
    void update(PrototypeSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
