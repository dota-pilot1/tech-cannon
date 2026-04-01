package com.mapo.palantier.prototype.post;

import com.mapo.palantier.prototype.block.ProtoBlock;
import com.mapo.palantier.prototype.block.ProtoBlockMapper;
import com.mapo.palantier.prototype.dto.ProtoBlockDto;
import com.mapo.palantier.prototype.dto.ProtoPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

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
        return protoPostMapper.findByIdWithBlocks(id)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePost(ProtoPostDto dto, Long currentUserId) {
        ProtoPost post = new ProtoPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(currentUserId);
        post.setIsPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false);
        post.setTags(dto.getTags() != null ? String.join(",", dto.getTags()) : "");

        if (dto.getId() == null) {
            protoPostMapper.insert(post);
        } else {
            post.setId(dto.getId());
            protoPostMapper.update(post);
            protoBlockMapper.deleteByPostId(post.getId());
        }

        if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
            for (int i = 0; i < dto.getBlocks().size(); i++) {
                ProtoBlockDto blockDto = dto.getBlocks().get(i);
                ProtoBlock block = new ProtoBlock();
                block.setPostId(post.getId());
                block.setBlockType(blockDto.getBlockType());
                block.setContent(blockDto.getContent());
                block.setSortOrder(i);
                protoBlockMapper.insert(block);
            }
        }
        return post.getId();
    }

    @Transactional
    public void deletePost(Long id) {
        protoPostMapper.softDelete(id);
    }
}
