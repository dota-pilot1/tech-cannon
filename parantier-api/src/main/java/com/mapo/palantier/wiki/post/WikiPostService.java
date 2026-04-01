package com.mapo.palantier.wiki.post;

import com.mapo.palantier.wiki.block.WikiBlock;
import com.mapo.palantier.wiki.block.WikiBlockMapper;
import com.mapo.palantier.wiki.dto.WikiBlockDto;
import com.mapo.palantier.wiki.dto.WikiPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WikiPostService {
    private final WikiPostMapper wikiPostMapper;
    private final WikiBlockMapper wikiBlockMapper;

    public List<WikiPost> getAllPosts() {
        return wikiPostMapper.findAll();
    }

    public List<WikiPost> getPostsByFolderId(Long folderId) {
        return wikiPostMapper.findByFolderId(folderId);
    }

    public WikiPost getPostWithBlocks(Long id) {
        return wikiPostMapper.findByIdWithBlocks(id)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePost(WikiPostDto dto, Long currentUserId) {
        WikiPost post = new WikiPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(currentUserId);
        post.setIsPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false);
        post.setTags(dto.getTags() != null ? String.join(",", dto.getTags()) : "");

        if (dto.getId() == null) {
            wikiPostMapper.insert(post);
        } else {
            post.setId(dto.getId());
            wikiPostMapper.update(post);
            wikiBlockMapper.deleteByPostId(post.getId());
        }

        if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
            for (int i = 0; i < dto.getBlocks().size(); i++) {
                WikiBlockDto blockDto = dto.getBlocks().get(i);
                WikiBlock block = new WikiBlock();
                block.setPostId(post.getId());
                block.setBlockType(blockDto.getBlockType());
                block.setContent(blockDto.getContent());
                block.setSortOrder(i);
                wikiBlockMapper.insert(block);
            }
        }
        return post.getId();
    }

    @Transactional
    public void deletePost(Long id) {
        wikiPostMapper.softDelete(id);
    }
}
