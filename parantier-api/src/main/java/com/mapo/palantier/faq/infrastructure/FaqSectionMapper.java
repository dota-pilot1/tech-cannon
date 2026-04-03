package com.mapo.palantier.faq.infrastructure;

import com.mapo.palantier.faq.domain.FaqSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FaqSectionMapper {
    List<FaqSection> findByCategoryId(Long categoryId);
    Optional<FaqSection> findById(Long id);
    void insert(FaqSection section);
    void update(FaqSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
