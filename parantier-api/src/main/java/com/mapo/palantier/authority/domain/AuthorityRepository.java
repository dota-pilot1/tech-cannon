package com.mapo.palantier.authority.domain;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AuthorityRepository {
    /**
     * 역할로 권한 목록 조회
     */
    List<String> findAuthorityNamesByRole(@Param("role") String role);

    /**
     * 모든 권한 조회
     */
    List<Authority> findAll();

    /**
     * 카테고리별 권한 조회
     */
    List<Authority> findByCategory(@Param("category") String category);

    /**
     * 권한 생성
     */
    void create(Authority authority);

    /**
     * 권한 수정
     */
    void update(Authority authority);

    /**
     * 권한 삭제
     */
    void delete(@Param("id") Long id);

    /**
     * 역할-권한 매핑 삭제 (특정 역할)
     */
    void deleteRoleAuthorities(@Param("role") String role);

    /**
     * 역할-권한 매핑 추가
     */
    void insertRoleAuthority(@Param("role") String role, @Param("authorityId") Long authorityId);

    /**
     * 역할-권한 매핑 업데이트
     */
    default void updateRoleAuthorities(String role, List<Long> authorityIds) {
        // 기존 매핑 삭제
        deleteRoleAuthorities(role);
        // 새 매핑 추가
        for (Long authorityId : authorityIds) {
            insertRoleAuthority(role, authorityId);
        }
    }

    /**
     * ID로 권한 조회
     */
    Authority findById(@Param("id") Long id);
}
