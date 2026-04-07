package com.mapo.palantier.prototype.post;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.prototype.block.ProtoBlock;
import com.mapo.palantier.prototype.block.ProtoBlockMapper;
import com.mapo.palantier.prototype.dto.ProtoBlockDto;
import com.mapo.palantier.prototype.dto.ProtoPostDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProtoPostService {

    private final ProtoPostMapper protoPostMapper;
    private final ProtoBlockMapper protoBlockMapper;

    public List<ProtoPost> getAllPosts() {
        return protoPostMapper.findAll();
    }

    public List<ProtoPost> getPostsByFolderId(Long folderId) {
        return protoPostMapper.findByFolderId(folderId);
    }

    public ProtoPost getPostWithBlocks(Long id) {
        return protoPostMapper
            .findByIdWithBlocks(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.PROTO_POST_NOT_FOUND)
            );
    }

    @Transactional
    public Long savePost(ProtoPostDto dto, Long currentUserId) {
        if (dto.getId() == null) {
            ProtoPost post = ProtoPost.builder()
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .isPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false)
                .tags(
                    dto.getTags() != null ? String.join(",", dto.getTags()) : ""
                )
                .build();
            protoPostMapper.insert(post);

            if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
                for (int i = 0; i < dto.getBlocks().size(); i++) {
                    ProtoBlockDto blockDto = dto.getBlocks().get(i);
                    ProtoBlock block = ProtoBlock.builder()
                        .postId(post.getId())
                        .blockType(blockDto.getBlockType())
                        .content(blockDto.getContent())
                        .sortOrder(i)
                        .build();
                    protoBlockMapper.insert(block);
                }
            }
            return post.getId();
        } else {
            ProtoPost post = ProtoPost.builder()
                .id(dto.getId())
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .isPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false)
                .tags(
                    dto.getTags() != null ? String.join(",", dto.getTags()) : ""
                )
                .build();
            protoPostMapper.update(post);
            protoBlockMapper.deleteByPostId(post.getId());

            if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
                for (int i = 0; i < dto.getBlocks().size(); i++) {
                    ProtoBlockDto blockDto = dto.getBlocks().get(i);
                    ProtoBlock block = ProtoBlock.builder()
                        .postId(post.getId())
                        .blockType(blockDto.getBlockType())
                        .content(blockDto.getContent())
                        .sortOrder(i)
                        .build();
                    protoBlockMapper.insert(block);
                }
            }
            return post.getId();
        }
    }

    @Transactional
    public void deletePost(Long id) {
        protoPostMapper.softDelete(id);
    }
}
