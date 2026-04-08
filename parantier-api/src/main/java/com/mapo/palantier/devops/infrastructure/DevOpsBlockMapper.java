package com.mapo.palantier.devops.infrastructure;

import com.mapo.palantier.devops.domain.DevOpsBlock;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface DevOpsBlockMapper {
    List<DevOpsBlock> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(DevOpsBlock block);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
