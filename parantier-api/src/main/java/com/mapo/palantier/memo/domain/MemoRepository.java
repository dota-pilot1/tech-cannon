package com.mapo.palantier.memo.domain;

import java.util.List;
import java.util.Optional;

public interface MemoRepository {
    List<Memo> findByUserId(Long userId);
    Optional<Memo> findById(Long id);
    void insert(Memo memo);
    void update(Memo memo);
    void softDelete(Long id);
}
