package com.mapo.palantier.memo;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoService {

    private final MemoMapper memoMapper;

    public List<Memo> getMyMemos(Long userId) {
        return memoMapper.findByUserId(userId);
    }

    @Transactional
    public Long createMemo(MemoDto dto, Long userId) {
        Memo memo = Memo.builder()
            .userId(userId)
            .title(dto.getTitle() != null ? dto.getTitle() : "제목 없음")
            .content(dto.getContent())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .build();
        memoMapper.insert(memo);
        return memo.getId();
    }

    @Transactional
    public void updateMemo(Long id, MemoDto dto, Long userId) {
        Memo memo = memoMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("메모를 찾을 수 없습니다: " + id)
            );
        if (!memo.getUserId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다");
        }
        Memo updated = Memo.builder()
            .id(memo.getId())
            .userId(memo.getUserId())
            .title(dto.getTitle() != null ? dto.getTitle() : memo.getTitle())
            .content(dto.getContent())
            .sortOrder(
                dto.getSortOrder() != null
                    ? dto.getSortOrder()
                    : memo.getSortOrder()
            )
            .createdAt(memo.getCreatedAt())
            .build();
        memoMapper.update(updated);
    }

    @Transactional
    public void deleteMemo(Long id, Long userId) {
        Memo memo = memoMapper
            .findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException("메모를 찾을 수 없습니다: " + id)
            );
        if (!memo.getUserId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다");
        }
        memoMapper.softDelete(id);
    }
}
