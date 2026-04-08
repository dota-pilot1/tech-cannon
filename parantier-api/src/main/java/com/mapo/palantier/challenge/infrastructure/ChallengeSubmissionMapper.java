package com.mapo.palantier.challenge.infrastructure;

import com.mapo.palantier.challenge.domain.ChallengeSubmission;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;
import java.util.Optional;

@Mapper
public interface ChallengeSubmissionMapper {
    List<ChallengeSubmission> findBySectionId(@Param("sectionId") Long sectionId);
    Optional<ChallengeSubmission> findById(Long id);
    void insert(ChallengeSubmission submission);
    void update(@Param("id") Long id, @Param("language") String language, @Param("content") String content);
    void delete(Long id);
}
