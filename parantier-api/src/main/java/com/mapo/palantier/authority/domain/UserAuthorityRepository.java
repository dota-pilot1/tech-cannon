package com.mapo.palantier.authority.domain;

import java.util.List;

public interface UserAuthorityRepository {

    /**
     * 사용자의 모든 개별 권한 조회 (Authority 정보 포함)
     */
    List<UserAuthority> findByUserId(Long userId);

    /**
     * 사용자의 유효한 개별 권한만 조회
     */
    List<UserAuthority> findValidByUserId(Long userId);

    /**
     * 사용자에게 권한 부여
     */
    void grant(UserAuthority userAuthority);

    /**
     * 사용자 권한 회수
     */
    void revoke(Long userId, Long authorityId);

    /**
     * 사용자의 모든 권한 회수
     */
    void revokeAll(Long userId);

    /**
     * 특정 권한이 사용자에게 있는지 확인
     */
    boolean exists(Long userId, Long authorityId);

    /**
     * JWT 생성용: 사용자 ID로 권한 이름 목록 조회
     */
    List<String> findAuthorityNamesByUserId(Long userId);
}
