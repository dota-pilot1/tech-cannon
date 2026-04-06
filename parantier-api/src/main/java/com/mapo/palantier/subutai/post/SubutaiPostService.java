package com.mapo.palantier.subutai.post;

import com.mapo.palantier.subutai.block.SubutaiBlock;
import com.mapo.palantier.subutai.block.SubutaiBlockMapper;
import com.mapo.palantier.subutai.dto.SubutaiBlockDto;
import com.mapo.palantier.subutai.dto.SubutaiPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubutaiPostService {
    private final SubutaiPostMapper subutaiPostMapper;
    private final SubutaiBlockMapper subutaiBlockMapper;

    public List<SubutaiPost> getAllPosts() {
        return subutaiPostMapper.findAll();
    }

    public List<SubutaiPost> getPostsByFolderId(Long folderId) {
        return subutaiPostMapper.findByFolderId(folderId);
    }

    public SubutaiPost getPostById(Long id) {
        return subutaiPostMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    public SubutaiPost getPostWithBlocks(Long id) {
        return subutaiPostMapper.findByIdWithBlocks(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePost(SubutaiPostDto dto, Long currentUserId) {
        SubutaiPost post = new SubutaiPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(currentUserId);

        if (dto.getId() == null) {
            // 신규 생성
            subutaiPostMapper.insert(post);
        } else {
            // 수정
            post.setId(dto.getId());
            subutaiPostMapper.update(post);
            // 기존 블록 삭제
            subutaiBlockMapper.deleteByPostId(post.getId());
        }

        // 블록 저장
        if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
            for (int i = 0; i < dto.getBlocks().size(); i++) {
                SubutaiBlockDto blockDto = dto.getBlocks().get(i);
                SubutaiBlock block = new SubutaiBlock();
                block.setPostId(post.getId());
                block.setBlockType(blockDto.getBlockType());
                block.setContent(blockDto.getContent());
                block.setSortOrder(i);
                subutaiBlockMapper.insert(block);
            }
        }

        return post.getId();
    }

    @Transactional
    public void deletePost(Long id) {
        subutaiPostMapper.softDelete(id);
    }
}
