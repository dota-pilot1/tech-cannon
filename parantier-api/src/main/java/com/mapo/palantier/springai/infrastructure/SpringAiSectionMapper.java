package com.mapo.palantier.springai.infrastructure;

import com.mapo.palantier.springai.domain.SpringAiSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface SpringAiSectionMapper {
    List<SpringAiSection> findByCategoryId(Long categoryId);
    Optional<SpringAiSection> findById(Long id);
    void insert(SpringAiSection section);
    void update(SpringAiSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
