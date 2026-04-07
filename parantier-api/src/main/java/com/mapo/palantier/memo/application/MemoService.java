package com.mapo.palantier.memo.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ForbiddenException;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.memo.domain.Memo;
import com.mapo.palantier.memo.domain.MemoRepository;
import com.mapo.palantier.memo.presentation.dto.MemoRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MemoService {

    private final MemoRepository memoRepository;

    public List<Memo> getMyMemos(Long userId) {
        return memoRepository.findByUserId(userId);
    }

    @Transactional
    public Long createMemo(MemoRequest request, Long userId) {
        Memo memo = Memo.builder()
            .userId(userId)
            .title(request.getTitle() != null ? request.getTitle() : "제목 없음")
            .content(request.getContent())
            .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
            .build();
        memoRepository.insert(memo);
        return memo.getId();
    }

    @Transactional
    public void updateMemo(Long id, MemoRequest request, Long userId) {
        Memo memo = memoRepository
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
            .title(request.getTitle() != null ? request.getTitle() : memo.getTitle())
            .content(request.getContent())
            .sortOrder(
                request.getSortOrder() != null
                    ? request.getSortOrder()
                    : memo.getSortOrder()
            )
            .createdAt(memo.getCreatedAt())
            .build();
        memoRepository.update(updated);
    }

    @Transactional
    public void deleteMemo(Long id, Long userId) {
        Memo memo = memoRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.MEMO_NOT_FOUND)
            );
        if (!memo.getUserId().equals(userId)) {
            throw new ForbiddenException(ErrorCode.FORBIDDEN_DELETE);
        }
        memoRepository.softDelete(id);
    }
}
