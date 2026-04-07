package com.mapo.palantier.study.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.study.domain.StudyPost;
import com.mapo.palantier.study.domain.StudyPostRepository;
import com.mapo.palantier.study.presentation.dto.StudyPostRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyPostService {

    private final StudyPostRepository studyPostRepository;

    public List<StudyPost> getPostsByCategory(
        Long categoryId,
        Long currentUserId,
        String keyword,
        Boolean isPublic
    ) {
        return studyPostRepository.findByCategory(
            categoryId,
            currentUserId,
            keyword,
            isPublic
        );
    }

    @Transactional
    public StudyPost getPost(Long id, Long currentUserId) {
        StudyPost post = studyPostRepository
            .findById(id, currentUserId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.STUDY_POST_NOT_FOUND)
            );
        studyPostRepository.incrementViewCount(id);
        return post;
    }

    @Transactional
    public Long createPost(StudyPostRequest req, Long authorId) {
        StudyPost post = StudyPost.builder()
            .categoryId(req.getCategoryId())
            .title(req.getTitle())
            .content(req.getContent())
            .isPublic(req.getIsPublic() != null ? req.getIsPublic() : true)
            .authorId(authorId)
            .build();
        studyPostRepository.insert(post);
        return post.getId();
    }

    @Transactional
    public void updatePost(Long id, StudyPostRequest req, Long currentUserId) {
        StudyPost existing = studyPostRepository
            .findById(id, currentUserId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.STUDY_POST_NOT_FOUND)
            );
        StudyPost post = StudyPost.builder()
            .id(existing.getId())
            .categoryId(existing.getCategoryId())
            .title(req.getTitle())
            .content(req.getContent())
            .isPublic(
                req.getIsPublic() != null
                    ? req.getIsPublic()
                    : existing.getIsPublic()
            )
            .authorId(existing.getAuthorId())
            .viewCount(existing.getViewCount())
            .isPinned(existing.getIsPinned())
            .build();
        studyPostRepository.update(post);
    }

    @Transactional
    public void deletePost(Long id) {
        studyPostRepository.delete(id);
    }

    @Transactional
    public void togglePin(Long id) {
        StudyPost post = studyPostRepository
            .findById(id, null)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.STUDY_POST_NOT_FOUND)
            );
        studyPostRepository.updatePinned(
            id,
            !Boolean.TRUE.equals(post.getIsPinned())
        );
    }
}
