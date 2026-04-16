package com.mapo.palantier.subutai.ai.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.subutai.ai.domain.*;
import com.mapo.palantier.subutai.ai.dto.*;
import com.mapo.palantier.subutai.ai.dto.SubutaiDocTagRequest;
import com.mapo.palantier.subutai.ai.dto.SubutaiTagSearchResponse;
import com.mapo.palantier.subutai.ai.infrastructure.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiDocService {

    private final SubutaiDocFolderMapper folderMapper;
    private final SubutaiDocPostMapper postMapper;
    private final SubutaiDocSectionMapper sectionMapper;
    private final SubutaiDocTagMapper tagMapper;

    public List<SubutaiDocFolder> getFolders() {
        return folderMapper.findAll();
    }

    @Transactional
    public void createFolder(SubutaiDocFolderRequest req, Long userId) {
        SubutaiDocFolder f = SubutaiDocFolder.builder()
            .name(req.getName())
            .orderNum(0)
            .createdBy(userId)
            .build();
        folderMapper.insert(f);
    }

    @Transactional
    public void updateFolder(Long id, SubutaiDocFolderRequest req) {
        folderMapper.update(id, req.getName());
    }

    @Transactional
    public void deleteFolder(Long id) {
        folderMapper.delete(id);
    }

    public List<SubutaiDocPost> getPostsByFolder(Long folderId) {
        return postMapper.findByFolderId(folderId);
    }

    public SubutaiDocPost getPostWithSections(Long id) {
        SubutaiDocPost post = postMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.SUBUTAI_DOC_NOT_FOUND)
            );
        List<SubutaiDocSection> sections = sectionMapper.findByPostId(id);
        return SubutaiDocPost.builder()
            .id(post.getId())
            .folderId(post.getFolderId())
            .title(post.getTitle())
            .orderNum(post.getOrderNum())
            .createdBy(post.getCreatedBy())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .sections(sections)
            .build();
    }

    @Transactional
    public Long createPost(SubutaiDocPostRequest req, Long userId) {
        SubutaiDocPost post = SubutaiDocPost.builder()
            .folderId(req.getFolderId())
            .title(req.getTitle())
            .orderNum(0)
            .createdBy(userId)
            .build();
        postMapper.insert(post);
        saveSections(post.getId(), req.getSections());
        return post.getId();
    }

    @Transactional
    public void updatePost(Long id, SubutaiDocPostRequest req) {
        postMapper.update(id, req.getTitle());
        sectionMapper.deleteByPostId(id);
        saveSections(id, req.getSections());
    }

    @Transactional
    public void deletePost(Long id) {
        postMapper.delete(id);
    }

    private void saveSections(
        Long postId,
        List<SubutaiDocSectionRequest> sections
    ) {
        if (sections == null) return;
        for (int i = 0; i < sections.size(); i++) {
            SubutaiDocSectionRequest s = sections.get(i);
            SubutaiDocSection sec = SubutaiDocSection.builder()
                .postId(postId)
                .title(s.getTitle())
                .content(s.getContent())
                .orderNum(i)
                .build();
            sectionMapper.insert(sec);
        }
    }

    public List<String> getTagsByPost(Long postId) {
        return tagMapper
            .findByPostId(postId)
            .stream()
            .map(t -> t.getTag())
            .collect(Collectors.toList());
    }

    @Transactional
    public void saveTags(Long postId, SubutaiDocTagRequest req) {
        tagMapper.deleteByPostId(postId);
        if (req.getTags() == null) return;
        for (String tag : req.getTags()) {
            String trimmed = tag.trim();
            if (!trimmed.isBlank()) {
                tagMapper.insert(
                    SubutaiDocTag.builder().postId(postId).tag(trimmed).build()
                );
            }
        }
    }

    public List<SubutaiTagSearchResponse> searchByTag(String keyword) {
        List<SubutaiDocTag> allTags = tagMapper.findAll();

        // 형태소 분석기로 명사 추출 후 태그 매칭
        List<String> nouns = com.mapo.palantier.common.util.KomoranHelper.extractNouns(keyword);

        Set<Long> matchedPostIds = allTags
            .stream()
            .filter(t -> {
                String tag = t.getTag().toLowerCase();
                for (String word : nouns) {
                    if (tag.contains(word) || word.contains(tag)) return true;
                }
                return false;
            })
            .map(t -> t.getPostId())
            .collect(Collectors.toSet());

        List<SubutaiTagSearchResponse> result = new ArrayList<>();
        for (Long postId : matchedPostIds) {
            try {
                SubutaiDocPost post = postMapper.findById(postId).orElse(null);
                if (post == null) continue;
                SubutaiDocFolder folder = folderMapper
                    .findById(post.getFolderId())
                    .orElse(null);
                List<String> tags = tagMapper
                    .findByPostId(postId)
                    .stream()
                    .map(t -> t.getTag())
                    .collect(Collectors.toList());
                result.add(
                    SubutaiTagSearchResponse.builder()
                        .postId(postId)
                        .title(post.getTitle())
                        .folderName(folder != null ? folder.getName() : "")
                        .tags(tags)
                        .build()
                );
            } catch (Exception e) {
                log.warn(
                    "태그 검색 중 오류 postId={}: {}",
                    postId,
                    e.getMessage()
                );
            }
        }
        return result;
    }

    public String buildContext(List<Long> postIds) {
        if (postIds == null || postIds.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (Long postId : postIds) {
            try {
                SubutaiDocPost post = getPostWithSections(postId);
                sb.append("## ").append(post.getTitle()).append("\n\n");
                if (post.getSections() != null) {
                    for (SubutaiDocSection s : post.getSections()) {
                        if (s.getTitle() != null && !s.getTitle().isBlank()) sb
                            .append("### ")
                            .append(s.getTitle())
                            .append("\n");
                        if (
                            s.getContent() != null && !s.getContent().isBlank()
                        ) sb.append(s.getContent()).append("\n\n");
                    }
                }
                sb.append("---\n\n");
            } catch (Exception e) {
                log.warn(
                    "문서 로드 실패 postId={}: {}",
                    postId,
                    e.getMessage()
                );
            }
        }
        return sb.toString();
    }
}
