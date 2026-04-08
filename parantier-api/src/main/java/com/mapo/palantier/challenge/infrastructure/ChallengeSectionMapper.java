package com.mapo.palantier.challenge.infrastructure;

import com.mapo.palantier.challenge.domain.ChallengeSection;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ChallengeSectionMapper {
    List<ChallengeSection> findByCategoryId(Long categoryId);
    Optional<ChallengeSection> findById(Long id);
    void insert(ChallengeSection section);
    void update(ChallengeSection section);
    void delete(Long id);
    void updateOrderNum(@Param("id") Long id, @Param("orderNum") int orderNum);
}
