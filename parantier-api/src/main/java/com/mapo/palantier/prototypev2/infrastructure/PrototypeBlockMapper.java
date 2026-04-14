package com.mapo.palantier.prototypev2.infrastructure;

import com.mapo.palantier.prototypev2.domain.PrototypeBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface PrototypeBlockMapper {
    List<PrototypeBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(PrototypeBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
