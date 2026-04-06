package com.mapo.palantier.subutai.faq.infrastructure;

import com.mapo.palantier.subutai.faq.domain.SubutaiFaqSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface SubutaiFaqSectionMapper {
    List<SubutaiFaqSection> findByCategoryId(Long categoryId);
    Optional<SubutaiFaqSection> findById(Long id);
    void insert(SubutaiFaqSection section);
    void update(SubutaiFaqSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
