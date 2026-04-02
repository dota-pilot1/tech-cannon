package com.mapo.palantier.devlog;

import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DevLogMapper {

    List<DevLog> findByUserId(@Param("userId") Long userId);

    Optional<DevLog> findById(@Param("id") Long id);

    void insert(DevLog devLog);

    void update(DevLog devLog);

    void softDelete(@Param("id") Long id);
}
