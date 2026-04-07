package com.mapo.palantier.db.post;

import com.mapo.palantier.db.block.DbBlock;
import com.mapo.palantier.db.block.DbBlockMapper;
import com.mapo.palantier.db.dto.DbBlockDto;
import com.mapo.palantier.db.dto.DbPostDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DbPostService {

    private final DbPostMapper dbPostMapper;
    private final DbBlockMapper dbBlockMapper;

    public List<DbPost> getAllPosts() {
        return dbPostMapper.findAll();
    }

    public List<DbPost> getPostsByFolderId(Long folderId) {
        return dbPostMapper.findByFolderId(folderId);
    }

    public DbPost getPostWithBlocks(Long id) {
        return dbPostMapper
            .findByIdWithBlocks(id)
            .orElseThrow(() ->
                new IllegalArgumentException("문서를 찾을 수 없습니다: " + id)
            );
    }

    @Transactional
    public Long savePost(DbPostDto dto, Long currentUserId) {
        if (dto.getId() == null) {
            DbPost post = DbPost.builder()
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .build();
            dbPostMapper.insert(post);
            saveBlocks(post.getId(), dto);
            return post.getId();
        } else {
            DbPost post = DbPost.builder()
                .id(dto.getId())
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .authorId(currentUserId)
                .build();
            dbPostMapper.update(post);
            dbBlockMapper.deleteByPostId(post.getId());
            saveBlocks(post.getId(), dto);
            return post.getId();
        }
    }

    @Transactional
    public void deletePost(Long id) {
        dbPostMapper.softDelete(id);
    }

    private void saveBlocks(Long postId, DbPostDto dto) {
        if (dto.getBlocks() == null || dto.getBlocks().isEmpty()) return;
        for (int i = 0; i < dto.getBlocks().size(); i++) {
            DbBlockDto blockDto = dto.getBlocks().get(i);
            DbBlock block = DbBlock.builder()
                .postId(postId)
                .blockType(blockDto.getBlockType())
                .content(blockDto.getContent())
                .sortOrder(i)
                .build();
            dbBlockMapper.insert(block);
        }
    }
}
