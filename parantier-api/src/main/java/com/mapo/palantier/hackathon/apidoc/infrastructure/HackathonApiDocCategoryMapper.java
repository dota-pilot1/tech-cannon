package com.mapo.palantier.hackathon.apidoc.infrastructure;

import com.mapo.palantier.apidoc.domain.ApiDocCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Optional;

@Mapper
public interface HackathonApiDocCategoryMapper {
    List<ApiDocCategory> findByTeamId(@Param("teamId") Long teamId);
    Optional<ApiDocCategory> findByIdForTeam(@Param("id") Long id);
    void insertForTeam(@Param("category") ApiDocCategory category, @Param("teamId") Long teamId);
    void update(ApiDocCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
