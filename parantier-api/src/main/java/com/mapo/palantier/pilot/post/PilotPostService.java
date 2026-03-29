package com.mapo.palantier.pilot.post;

import com.mapo.palantier.pilot.block.PilotBlock;
import com.mapo.palantier.pilot.block.PilotBlockMapper;
import com.mapo.palantier.pilot.dto.PilotBlockDto;
import com.mapo.palantier.pilot.dto.PilotPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PilotPostService {
    private final PilotPostMapper pilotPostMapper;
    private final PilotBlockMapper pilotBlockMapper;

    public List<PilotPost> getAllPosts() {
        return pilotPostMapper.findAll();
    }

    public List<PilotPost> getPostsByFolderId(Long folderId) {
        return pilotPostMapper.findByFolderId(folderId);
    }

    public PilotPost getPostById(Long id) {
        return pilotPostMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    public PilotPost getPostWithBlocks(Long id) {
        return pilotPostMapper.findByIdWithBlocks(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePost(PilotPostDto dto, Long currentUserId) {
        PilotPost post = new PilotPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(currentUserId);

        if (dto.getId() == null) {
            // 신규 생성
            pilotPostMapper.insert(post);
        } else {
            // 수정
            post.setId(dto.getId());
            pilotPostMapper.update(post);
            // 기존 블록 삭제
            pilotBlockMapper.deleteByPostId(post.getId());
        }

        // 블록 저장
        if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
            for (int i = 0; i < dto.getBlocks().size(); i++) {
                PilotBlockDto blockDto = dto.getBlocks().get(i);
                PilotBlock block = new PilotBlock();
                block.setPostId(post.getId());
                block.setBlockType(blockDto.getBlockType());
                block.setContent(blockDto.getContent());
                block.setSortOrder(i);
                pilotBlockMapper.insert(block);
            }
        }

        return post.getId();
    }

    @Transactional
    public void deletePost(Long id) {
        pilotPostMapper.softDelete(id);
    }
}
