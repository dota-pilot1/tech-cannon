package com.mapo.palantier.challenge.infrastructure;

import com.mapo.palantier.challenge.domain.ChallengeCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ChallengeCategoryMapper {
    List<ChallengeCategory> findAll();
    Optional<ChallengeCategory> findById(Long id);
    void insert(ChallengeCategory category);
    void update(ChallengeCategory category);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
