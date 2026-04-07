package com.mapo.palantier.memo.infrastructure;

import com.mapo.palantier.memo.domain.Memo;
import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MemoMapper {

    List<Memo> findByUserId(@Param("userId") Long userId);

    Optional<Memo> findById(@Param("id") Long id);

    void insert(Memo memo);

    void update(Memo memo);

    void softDelete(@Param("id") Long id);
}
