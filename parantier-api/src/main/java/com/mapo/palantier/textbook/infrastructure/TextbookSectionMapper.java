package com.mapo.palantier.textbook.infrastructure;

import com.mapo.palantier.textbook.domain.TextbookSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TextbookSectionMapper {
    List<TextbookSection> findByCategoryId(Long categoryId);
    Optional<TextbookSection> findById(Long id);
    void insert(TextbookSection section);
    void update(TextbookSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
