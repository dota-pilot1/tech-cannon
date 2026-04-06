package com.mapo.palantier.subutai.faq.infrastructure;

import com.mapo.palantier.subutai.faq.domain.SubutaiFaqCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiFaqCategoryMapper {
    List<SubutaiFaqCategory> findAll();
    Optional<SubutaiFaqCategory> findById(Long id);
    void insert(SubutaiFaqCategory category);
    void update(SubutaiFaqCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
