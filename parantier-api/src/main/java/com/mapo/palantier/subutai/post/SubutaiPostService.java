package com.mapo.palantier.subutai.post;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.subutai.block.SubutaiBlock;
import com.mapo.palantier.subutai.block.SubutaiBlockMapper;
import com.mapo.palantier.subutai.dto.SubutaiBlockDto;
import com.mapo.palantier.subutai.dto.SubutaiPostDto;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiPostService {

    private final SubutaiPostMapper subutaiPostMapper;
    private final SubutaiBlockMapper subutaiBlockMapper;
    private final SubutaiPostTagMapper postTagMapper;

    public List<SubutaiPost> getAllPosts() {
        return subutaiPostMapper.findAll();
    }

    public List<SubutaiPost> getPostsByFolderId(Long folderId) {
        return subutaiPostMapper.findByFolderId(folderId);
    }

    public SubutaiPost getPostById(Long id) {
        return subutaiPostMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.SUBUTAI_POST_NOT_FOUND)
            );
    }

    public SubutaiPost getPostWithBlocks(Long id) {
        return subutaiPostMapper
            .findByIdWithBlocks(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.SUBUTAI_POST_NOT_FOUND)
            );
    }

    @Transactional
    public Long savePost(SubutaiPostDto dto, Long currentUserId) {
        if (dto.getId() == null) {
            // 신규 생성
            SubutaiPost post = SubutaiPost.builder()
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .build();
            subutaiPostMapper.insert(post);

            // 블록 저장
            if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
                for (int i = 0; i < dto.getBlocks().size(); i++) {
                    SubutaiBlockDto blockDto = dto.getBlocks().get(i);
                    SubutaiBlock block = SubutaiBlock.builder()
                        .postId(post.getId())
                        .blockType(blockDto.getBlockType())
                        .blockTitle(blockDto.getBlockTitle())
                        .content(blockDto.getContent())
                        .sortOrder(i)
                        .build();
                    subutaiBlockMapper.insert(block);
                }
            }

            return post.getId();
        } else {
            // 수정
            SubutaiPost post = SubutaiPost.builder()
                .id(dto.getId())
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .build();
            subutaiPostMapper.update(post);

            // 기존 블록 삭제
            subutaiBlockMapper.deleteByPostId(post.getId());

            // 블록 저장
            if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
                for (int i = 0; i < dto.getBlocks().size(); i++) {
                    SubutaiBlockDto blockDto = dto.getBlocks().get(i);
                    SubutaiBlock block = SubutaiBlock.builder()
                        .postId(post.getId())
                        .blockType(blockDto.getBlockType())
                        .blockTitle(blockDto.getBlockTitle())
                        .content(blockDto.getContent())
                        .sortOrder(i)
                        .build();
                    subutaiBlockMapper.insert(block);
                }
            }

            return post.getId();
        }
    }

    @Transactional
    public void deletePost(Long id) {
        subutaiPostMapper.softDelete(id);
    }

    @Transactional
    public void reorderPosts(List<Map<String, Object>> items) {
        for (Map<String, Object> item : items) {
            Long id = ((Number) item.get("id")).longValue();
            int sortOrder = ((Number) item.get("sortOrder")).intValue();
            subutaiPostMapper.updateSortOrder(id, sortOrder);
        }
    }

    // ── 태그 관련 메서드 ──────────────────────────────────────────────────────

    public List<String> getTagsByPost(Long postId) {
        return postTagMapper
            .findByPostId(postId)
            .stream()
            .map(SubutaiPostTag::getTag)
            .collect(Collectors.toList());
    }

    @Transactional
    public void saveTags(Long postId, List<String> tags) {
        postTagMapper.deleteByPostId(postId);
        if (tags == null) return;
        for (String tag : tags) {
            String trimmed = tag.trim();
            if (!trimmed.isBlank()) {
                postTagMapper.insert(
                    SubutaiPostTag.builder().postId(postId).tag(trimmed).build()
                );
            }
        }
    }

    public List<Map<String, Object>> searchByTag(String keyword) {
        List<SubutaiPostTag> allTags = postTagMapper.findAll();
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
            .map(SubutaiPostTag::getPostId)
            .collect(Collectors.toSet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (Long postId : matchedPostIds) {
            try {
                SubutaiPost post = subutaiPostMapper
                    .findById(postId)
                    .orElse(null);
                if (post == null) continue;
                List<String> tags = postTagMapper
                    .findByPostId(postId)
                    .stream()
                    .map(SubutaiPostTag::getTag)
                    .collect(Collectors.toList());
                Map<String, Object> map = new LinkedHashMap<>();
                map.put("postId", postId);
                map.put("title", post.getTitle());
                map.put("folderName", "");
                map.put("tags", tags);
                result.add(map);
            } catch (Exception e) {
                // 무시
            }
        }
        return result;
    }
}
