package com.mapo.palantier.work.infrastructure;

import com.mapo.palantier.work.domain.WorkMessage;
import com.mapo.palantier.work.domain.WorkMessageWithUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WorkMessageMapper {

    /**
     * 특정 업무의 메시지 목록 조회 (작성자 정보 포함)
     */
    List<WorkMessageWithUser> findByWorkId(@Param("workId") Long workId);

    /**
     * 메시지 ID로 단일 메시지 조회
     */
    WorkMessage findById(@Param("id") Long id);

    /**
     * 메시지 생성
     */
    void insert(WorkMessage message);

    /**
     * 메시지 수정
     */
    void update(@Param("id") Long id, @Param("message") String message);

    /**
     * 메시지 삭제 (소프트 삭제)
     */
    void softDelete(@Param("id") Long id);

    /**
     * 특정 업무의 전체 메시지 개수 조회
     */
    int countByWorkId(@Param("workId") Long workId);
}
