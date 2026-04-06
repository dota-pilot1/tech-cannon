package com.mapo.palantier.subutai.ai.application;

import com.mapo.palantier.subutai.ai.domain.*;
import com.mapo.palantier.subutai.ai.dto.*;
import com.mapo.palantier.subutai.ai.infrastructure.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiDocService {
    private final SubutaiDocFolderMapper folderMapper;
    private final SubutaiDocPostMapper postMapper;
    private final SubutaiDocSectionMapper sectionMapper;

    public List<SubutaiDocFolder> getFolders() { return folderMapper.findAll(); }

    @Transactional
    public void createFolder(SubutaiDocFolderRequest req, Long userId) {
        SubutaiDocFolder f = new SubutaiDocFolder();
        f.setName(req.getName()); f.setOrderNum(0); f.setCreatedBy(userId);
        folderMapper.insert(f);
    }

    @Transactional
    public void updateFolder(Long id, SubutaiDocFolderRequest req) {
        folderMapper.update(id, req.getName());
    }

    @Transactional
    public void deleteFolder(Long id) { folderMapper.delete(id); }

    public List<SubutaiDocPost> getPostsByFolder(Long folderId) {
        return postMapper.findByFolderId(folderId);
    }

    public SubutaiDocPost getPostWithSections(Long id) {
        SubutaiDocPost post = postMapper.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
        post.setSections(sectionMapper.findByPostId(id));
        return post;
    }

    @Transactional
    public Long createPost(SubutaiDocPostRequest req, Long userId) {
        SubutaiDocPost post = new SubutaiDocPost();
        post.setFolderId(req.getFolderId()); post.setTitle(req.getTitle());
        post.setOrderNum(0); post.setCreatedBy(userId);
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
    public void deletePost(Long id) { postMapper.delete(id); }

    private void saveSections(Long postId, List<SubutaiDocSectionRequest> sections) {
        if (sections == null) return;
        for (int i = 0; i < sections.size(); i++) {
            SubutaiDocSectionRequest s = sections.get(i);
            SubutaiDocSection sec = new SubutaiDocSection();
            sec.setPostId(postId); sec.setTitle(s.getTitle());
            sec.setContent(s.getContent()); sec.setOrderNum(i);
            sectionMapper.insert(sec);
        }
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
                        if (s.getTitle() != null && !s.getTitle().isBlank())
                            sb.append("### ").append(s.getTitle()).append("\n");
                        if (s.getContent() != null && !s.getContent().isBlank())
                            sb.append(s.getContent()).append("\n\n");
                    }
                }
                sb.append("---\n\n");
            } catch (Exception e) {
                log.warn("문서 로드 실패 postId={}: {}", postId, e.getMessage());
            }
        }
        return sb.toString();
    }
}
