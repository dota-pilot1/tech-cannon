package com.mapo.palantier.subutai.post;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.subutai.block.SubutaiBlock;
import com.mapo.palantier.subutai.block.SubutaiBlockMapper;
import com.mapo.palantier.subutai.dto.SubutaiBlockDto;
import com.mapo.palantier.subutai.dto.SubutaiPostDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
