package com.mapo.palantier.authority.domain;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CategoryRepository {
    /**
     * 모든 카테고리 조회
     */
    List<Category> findAll();

    /**
     * ID로 카테고리 조회
     */
    Category findById(@Param("id") Long id);

    /**
     * 이름으로 카테고리 조회
     */
    Category findByName(@Param("name") String name);

    /**
     * 카테고리 생성
     */
    void create(Category category);

    /**
     * 카테고리 수정
     */
    void update(Category category);

    /**
     * 카테고리 삭제
     */
    void delete(@Param("id") Long id);
}
