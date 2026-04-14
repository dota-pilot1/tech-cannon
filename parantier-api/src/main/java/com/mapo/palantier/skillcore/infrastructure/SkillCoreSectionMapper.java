package com.mapo.palantier.skillcore.infrastructure;

import com.mapo.palantier.skillcore.domain.SkillCoreSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface SkillCoreSectionMapper {
    List<SkillCoreSection> findByCategoryId(Long categoryId);
    Optional<SkillCoreSection> findById(Long id);
    void insert(SkillCoreSection section);
    void update(SkillCoreSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
