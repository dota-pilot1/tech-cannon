package com.mapo.palantier.study.infrastructure;

import com.mapo.palantier.study.domain.StudyCategory;
import com.mapo.palantier.study.domain.StudyCategoryRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class StudyCategoryRepositoryImpl implements StudyCategoryRepository {

    private final StudyCategoryMapper studyCategoryMapper;

    @Override
    public List<StudyCategory> findAllFlat(Long ownerId) {
        return studyCategoryMapper.findAllFlat(ownerId);
    }

    @Override
    public void insert(StudyCategory category) {
        studyCategoryMapper.insert(category);
    }

    @Override
    public void update(StudyCategory category) {
        studyCategoryMapper.update(category);
    }

    @Override
    public void delete(Long id) {
        studyCategoryMapper.delete(id);
    }
}
