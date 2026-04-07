package com.mapo.palantier.memo;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ForbiddenException;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
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
                new ResourceNotFoundException(ErrorCode.MEMO_NOT_FOUND)
            );
        if (!memo.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_UPDATE);
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
                new ResourceNotFoundException(ErrorCode.MEMO_NOT_FOUND)
            );
        if (!memo.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_DELETE);
        }
        memoMapper.softDelete(id);
    }
}
