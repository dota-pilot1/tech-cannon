package com.mapo.palantier.challenge.application;

import com.mapo.palantier.challenge.domain.ChallengeCategory;
import com.mapo.palantier.challenge.domain.ChallengeSection;
import com.mapo.palantier.challenge.domain.ChallengeSubmission;
import com.mapo.palantier.challenge.domain.ChallengeTopic;
import com.mapo.palantier.challenge.dto.ChallengeCategoryRequest;
import com.mapo.palantier.challenge.dto.ChallengeReorderRequest.ReorderItem;
import com.mapo.palantier.challenge.dto.ChallengeSectionRequest;
import com.mapo.palantier.challenge.dto.ChallengeSubmissionRequest;
import com.mapo.palantier.challenge.dto.ChallengeTopicDto;
import com.mapo.palantier.challenge.infrastructure.ChallengeCategoryMapper;
import com.mapo.palantier.challenge.infrastructure.ChallengeSectionMapper;
import com.mapo.palantier.challenge.infrastructure.ChallengeSubmissionMapper;
import com.mapo.palantier.challenge.infrastructure.ChallengeTopicMapper;
import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChallengeService {

    private final ChallengeCategoryMapper categoryMapper;
    private final ChallengeSectionMapper sectionMapper;
    private final ChallengeTopicMapper topicMapper;
    private final ChallengeSubmissionMapper submissionMapper;

    // ── 카테고리 ──

    public List<ChallengeCategory> getCategories() {
        return categoryMapper.findAll();
    }

    @Transactional
    public void createCategory(ChallengeCategoryRequest req) {
        ChallengeCategory category = ChallengeCategory.builder()
                .name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true).build();
        categoryMapper.insert(category);
    }

    @Transactional
    public void updateCategory(Long id, ChallengeCategoryRequest req) {
        ChallengeCategory existing = categoryMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CHALLENGE_CATEGORY_NOT_FOUND));
        ChallengeCategory category = ChallengeCategory.builder()
                .id(existing.getId()).name(req.getName()).icon(req.getIcon()).emoji(req.getEmoji())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : existing.getOrderNum())
                .isActive(existing.getIsActive()).createdAt(existing.getCreatedAt()).build();
        categoryMapper.update(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryMapper.delete(id);
    }

    @Transactional
    public void reorderCategories(List<ReorderItem> items) {
        for (ReorderItem item : items) {
            categoryMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    // ── 섹션 ──

    public List<ChallengeSection> getSectionsByCategoryId(Long categoryId) {
        return sectionMapper.findByCategoryId(categoryId);
    }

    @Transactional
    public void createSection(ChallengeSectionRequest req) {
        ChallengeSection section = ChallengeSection.builder()
                .categoryId(req.getCategoryId()).title(req.getTitle())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : 0)
                .isActive(true).build();
        sectionMapper.insert(section);
    }

    @Transactional
    public void updateSection(Long id, ChallengeSectionRequest req) {
        ChallengeSection existing = sectionMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CHALLENGE_SECTION_NOT_FOUND));
        ChallengeSection section = ChallengeSection.builder()
                .id(existing.getId())
                .categoryId(req.getCategoryId() != null ? req.getCategoryId() : existing.getCategoryId())
                .title(req.getTitle())
                .orderNum(req.getOrderNum() != null ? req.getOrderNum() : existing.getOrderNum())
                .isActive(existing.getIsActive()).createdAt(existing.getCreatedAt()).build();
        sectionMapper.update(section);
    }

    @Transactional
    public void deleteSection(Long id) {
        sectionMapper.delete(id);
    }

    @Transactional
    public void reorderSections(List<ReorderItem> items) {
        for (ReorderItem item : items) {
            sectionMapper.updateOrderNum(item.getId(), item.getOrderNum());
        }
    }

    // ── 주제 블록 ──

    public List<ChallengeTopic> getTopicsBySectionId(Long sectionId) {
        return topicMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void saveTopics(Long sectionId, List<ChallengeTopicDto> topics, Long userId) {
        topicMapper.deleteBySectionId(sectionId);
        if (topics == null || topics.isEmpty()) return;
        for (int i = 0; i < topics.size(); i++) {
            ChallengeTopicDto dto = topics.get(i);
            ChallengeTopic topic = ChallengeTopic.builder()
                    .sectionId(sectionId).blockType(dto.getBlockType())
                    .content(dto.getContent()).sortOrder(i).updatedBy(userId).build();
            topicMapper.insert(topic);
        }
    }

    // ── 풀이 제출 ──

    public List<ChallengeSubmission> getSubmissionsBySectionId(Long sectionId) {
        return submissionMapper.findBySectionId(sectionId);
    }

    @Transactional
    public void createSubmission(Long sectionId, ChallengeSubmissionRequest req, Long userId) {
        ChallengeSubmission submission = ChallengeSubmission.builder()
                .sectionId(sectionId).userId(userId)
                .githubUrl(req.getGithubUrl()).content(req.getContent()).build();
        submissionMapper.insert(submission);
    }

    @Transactional
    public void updateSubmission(Long id, ChallengeSubmissionRequest req, Long userId) {
        ChallengeSubmission existing = submissionMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CHALLENGE_SUBMISSION_NOT_FOUND));
        if (!existing.getUserId().equals(userId)) {
            throw new ResourceNotFoundException(ErrorCode.FORBIDDEN_UPDATE);
        }
        submissionMapper.update(id, req.getGithubUrl(), req.getContent());
    }

    @Transactional
    public void deleteSubmission(Long id, Long userId, boolean isAdmin) {
        ChallengeSubmission existing = submissionMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CHALLENGE_SUBMISSION_NOT_FOUND));
        if (!isAdmin && !existing.getUserId().equals(userId)) {
            throw new ResourceNotFoundException(ErrorCode.FORBIDDEN_DELETE);
        }
        submissionMapper.delete(id);
    }

    @Transactional
    public void rateSubmission(Long id, int rating) {
        submissionMapper.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CHALLENGE_SUBMISSION_NOT_FOUND));
        submissionMapper.updateRating(id, rating);
    }
}
