package com.mapo.palantier.study;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudyPostService {

    private final StudyPostMapper studyPostMapper;

    public List<StudyPost> getPostsByCategory(
        Long categoryId,
        Long currentUserId,
        String keyword,
        Boolean isPublic
    ) {
        return studyPostMapper.findByCategory(
            categoryId,
            currentUserId,
            keyword,
            isPublic
        );
    }

    @Transactional
    public StudyPost getPost(Long id, Long currentUserId) {
        StudyPost post = studyPostMapper
            .findById(id, currentUserId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.STUDY_POST_NOT_FOUND)
            );
        studyPostMapper.incrementViewCount(id);
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
        studyPostMapper.insert(post);
        return post.getId();
    }

    @Transactional
    public void updatePost(Long id, StudyPostRequest req, Long currentUserId) {
        StudyPost existing = studyPostMapper
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
        studyPostMapper.update(post);
    }

    @Transactional
    public void deletePost(Long id) {
        studyPostMapper.delete(id);
    }

    @Transactional
    public void togglePin(Long id) {
        StudyPost post = studyPostMapper
            .findById(id, null)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.STUDY_POST_NOT_FOUND)
            );
        studyPostMapper.updatePinned(
            id,
            !Boolean.TRUE.equals(post.getIsPinned())
        );
    }
}
