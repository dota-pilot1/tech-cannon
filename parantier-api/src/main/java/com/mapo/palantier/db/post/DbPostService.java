package com.mapo.palantier.db.post;

import com.mapo.palantier.db.block.DbBlock;
import com.mapo.palantier.db.block.DbBlockMapper;
import com.mapo.palantier.db.dto.DbBlockDto;
import com.mapo.palantier.db.dto.DbPostDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

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
        return dbPostMapper.findByIdWithBlocks(id)
                .orElseThrow(() -> new IllegalArgumentException("문서를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePost(DbPostDto dto, Long currentUserId) {
        DbPost post = new DbPost();
        post.setFolderId(dto.getFolderId());
        post.setTitle(dto.getTitle());
        post.setAuthorId(currentUserId);

        if (dto.getId() == null) {
            dbPostMapper.insert(post);
        } else {
            post.setId(dto.getId());
            dbPostMapper.update(post);
            dbBlockMapper.deleteByPostId(post.getId());
        }

        if (dto.getBlocks() != null && !dto.getBlocks().isEmpty()) {
            for (int i = 0; i < dto.getBlocks().size(); i++) {
                DbBlockDto blockDto = dto.getBlocks().get(i);
                DbBlock block = new DbBlock();
                block.setPostId(post.getId());
                block.setBlockType(blockDto.getBlockType());
                block.setContent(blockDto.getContent());
                block.setSortOrder(i);
                dbBlockMapper.insert(block);
            }
        }
        return post.getId();
    }

    @Transactional
    public void deletePost(Long id) {
        dbPostMapper.softDelete(id);
    }
}
