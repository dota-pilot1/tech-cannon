package com.mapo.palantier.skillcore.infrastructure;

import com.mapo.palantier.skillcore.domain.SkillCoreCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface SkillCoreCategoryMapper {
    List<SkillCoreCategory> findAll();
    Optional<SkillCoreCategory> findById(Long id);
    void insert(SkillCoreCategory category);
    void update(SkillCoreCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
