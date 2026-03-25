package com.mapo.palantier.organization.domain;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface OrganizationRepository {
    /**
     * 모든 조직 조회
     */
    List<Organization> findAll();

    /**
     * ID로 조직 조회
     */
    Organization findById(@Param("id") Long id);

    /**
     * 최상위 조직 조회 (parent_id가 null인 조직)
     */
    List<Organization> findRootOrganizations();

    /**
     * 부모 ID로 자식 조직 조회
     */
    List<Organization> findByParentId(@Param("parentId") Long parentId);

    /**
     * 조직 타입으로 조회
     */
    List<Organization> findByType(@Param("orgType") String orgType);

    /**
     * 조직 생성
     */
    void create(Organization organization);

    /**
     * 조직 수정
     */
    void update(Organization organization);

    /**
     * 조직 삭제
     */
    void delete(@Param("id") Long id);

    /**
     * 조직 코드로 조회
     */
    Organization findByCode(@Param("code") String code);
}
