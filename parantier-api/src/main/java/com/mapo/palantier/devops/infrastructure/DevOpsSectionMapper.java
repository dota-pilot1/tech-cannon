package com.mapo.palantier.devops.infrastructure;

import com.mapo.palantier.devops.domain.DevOpsSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DevOpsSectionMapper {
    List<DevOpsSection> findByCategoryId(Long categoryId);
    Optional<DevOpsSection> findById(Long id);
    void insert(DevOpsSection section);
    void update(DevOpsSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
