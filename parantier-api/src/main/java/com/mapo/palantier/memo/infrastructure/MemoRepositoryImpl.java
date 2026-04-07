package com.mapo.palantier.memo.infrastructure;

import com.mapo.palantier.memo.domain.Memo;
import com.mapo.palantier.memo.domain.MemoRepository;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MemoRepositoryImpl implements MemoRepository {

    private final MemoMapper memoMapper;

    @Override
    public List<Memo> findByUserId(Long userId) {
        return memoMapper.findByUserId(userId);
    }

    @Override
    public Optional<Memo> findById(Long id) {
        return memoMapper.findById(id);
    }

    @Override
    public void insert(Memo memo) {
        memoMapper.insert(memo);
    }

    @Override
    public void update(Memo memo) {
        memoMapper.update(memo);
    }

    @Override
    public void softDelete(Long id) {
        memoMapper.softDelete(id);
    }
}
