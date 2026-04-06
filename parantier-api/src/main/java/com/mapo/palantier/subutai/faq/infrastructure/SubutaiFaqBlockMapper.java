package com.mapo.palantier.subutai.faq.infrastructure;

import com.mapo.palantier.subutai.faq.domain.SubutaiFaqBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SubutaiFaqBlockMapper {
    List<SubutaiFaqBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(SubutaiFaqBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
