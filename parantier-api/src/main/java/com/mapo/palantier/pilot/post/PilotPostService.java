package com.mapo.palantier.pilot.post;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.pilot.block.PilotBlock;
import com.mapo.palantier.pilot.block.PilotBlockMapper;
import com.mapo.palantier.pilot.dto.PilotBlockDto;
import com.mapo.palantier.pilot.dto.PilotPostDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return pilotPostMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.PILOT_POST_NOT_FOUND)
            );
    }

    public PilotPost getPostWithBlocks(Long id) {
        return pilotPostMapper
            .findByIdWithBlocks(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.PILOT_POST_NOT_FOUND)
            );
    }

    @Transactional
    public Long savePost(PilotPostDto dto, Long currentUserId) {
        if (dto.getId() == null) {
            PilotPost post = PilotPost.builder()
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .build();
            pilotPostMapper.insert(post);
            saveBlocks(post.getId(), dto);
            return post.getId();
        } else {
            PilotPost post = PilotPost.builder()
                .id(dto.getId())
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .build();
            pilotPostMapper.update(post);
            pilotBlockMapper.deleteByPostId(post.getId());
            saveBlocks(post.getId(), dto);
            return post.getId();
        }
    }

    @Transactional
    public void deletePost(Long id) {
        pilotPostMapper.softDelete(id);
    }

    private void saveBlocks(Long postId, PilotPostDto dto) {
        if (dto.getBlocks() == null || dto.getBlocks().isEmpty()) return;
        for (int i = 0; i < dto.getBlocks().size(); i++) {
            PilotBlockDto blockDto = dto.getBlocks().get(i);
            PilotBlock block = PilotBlock.builder()
                .postId(postId)
                .blockType(blockDto.getBlockType())
                .content(blockDto.getContent())
                .sortOrder(i)
                .build();
            pilotBlockMapper.insert(block);
        }
    }
}
