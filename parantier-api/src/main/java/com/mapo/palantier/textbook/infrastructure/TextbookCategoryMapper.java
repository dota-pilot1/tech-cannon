package com.mapo.palantier.textbook.infrastructure;

import com.mapo.palantier.textbook.domain.TextbookCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface TextbookCategoryMapper {
    List<TextbookCategory> findAll();
    Optional<TextbookCategory> findById(Long id);
    void insert(TextbookCategory category);
    void update(TextbookCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
