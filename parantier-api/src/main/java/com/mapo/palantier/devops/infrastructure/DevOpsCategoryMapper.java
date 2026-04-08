package com.mapo.palantier.devops.infrastructure;

import com.mapo.palantier.devops.domain.DevOpsCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface DevOpsCategoryMapper {
    List<DevOpsCategory> findAll();
    Optional<DevOpsCategory> findById(Long id);
    void insert(DevOpsCategory category);
    void update(DevOpsCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
