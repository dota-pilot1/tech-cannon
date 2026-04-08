package com.mapo.palantier.challenge.infrastructure;

import com.mapo.palantier.challenge.domain.ChallengeTopic;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface ChallengeTopicMapper {
    List<ChallengeTopic> findBySectionId(@Param("sectionId") Long sectionId);
    void insert(ChallengeTopic topic);
    void deleteBySectionId(@Param("sectionId") Long sectionId);
}
