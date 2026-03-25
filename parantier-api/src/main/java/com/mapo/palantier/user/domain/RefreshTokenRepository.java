package com.mapo.palantier.user.domain;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

/**
 * 리프레시 토큰 Repository
 * - MyBatis를 사용한 CRUD 인터페이스
 */
@Mapper
public interface RefreshTokenRepository {

    /**
     * 리프레시 토큰 저장
     */
    void save(RefreshToken refreshToken);

    /**
     * 토큰 문자열로 조회
     */
    Optional<RefreshToken> findByToken(@Param("token") String token);

    /**
     * 사용자 ID로 조회 (1명당 1개의 토큰)
     */
    Optional<RefreshToken> findByUserId(@Param("userId") Long userId);

    /**
     * 사용자 ID로 토큰 삭제 (로그아웃 시 사용)
     */
    void deleteByUserId(@Param("userId") Long userId);

    /**
     * 토큰 문자열로 삭제
     */
    void deleteByToken(@Param("token") String token);

    /**
     * 만료된 토큰 일괄 삭제 (배치 작업용)
     */
    int deleteExpiredTokens();
}
