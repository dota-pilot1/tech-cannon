package com.mapo.palantier.authority.infrastructure;

import com.mapo.palantier.authority.domain.OrganizationAuthority;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrganizationAuthorityMapper {

    List<OrganizationAuthority> findByOrganizationId(@Param("organizationId") Long organizationId);

    void insert(OrganizationAuthority orgAuthority);

    void delete(@Param("organizationId") Long organizationId, @Param("authorityId") Long authorityId);

    void deleteAll(@Param("organizationId") Long organizationId);

    /**
     * JWT 생성용: 조직 ID로 권한 이름 목록 조회
     */
    List<String> findAuthorityNamesByOrganizationId(@Param("organizationId") Long organizationId);
}
