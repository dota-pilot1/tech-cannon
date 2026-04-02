package com.mapo.palantier.sql.infrastructure;

import com.mapo.palantier.sql.domain.SqlErd;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SqlErdMapper {

    /**
     * 전체 ERD 목록 조회 (order_num ASC, created_at DESC)
     */
    List<SqlErd> findAll();

    /**
     * ERD 항목 추가
     */
    void insert(SqlErd erd);

    /**
     * ERD 항목 수정
     */
    void update(SqlErd erd);

    /**
     * ERD 항목 삭제
     */
    void delete(@Param("id") Long id);
}
