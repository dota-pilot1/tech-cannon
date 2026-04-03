package com.mapo.palantier.faq.infrastructure;

import com.mapo.palantier.faq.domain.FaqCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface FaqCategoryMapper {
    List<FaqCategory> findAll();
    Optional<FaqCategory> findById(Long id);
    void insert(FaqCategory category);
    void update(FaqCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
