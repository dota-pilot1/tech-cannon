package com.mapo.palantier.tablepreset;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserTablePresetMapper {
    List<UserTablePreset> findByUserId(@Param("userId") Long userId);
    UserTablePreset findById(@Param("id") Long id);
    UserTablePreset findDefaultByUserId(@Param("userId") Long userId);
    void insert(UserTablePreset preset);
    void update(UserTablePreset preset);
    void delete(@Param("id") Long id);
    void clearDefaultForUser(@Param("userId") Long userId);
}
