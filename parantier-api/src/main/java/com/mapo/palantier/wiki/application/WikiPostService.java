package com.mapo.palantier.wiki.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.wiki.domain.Tags;
import com.mapo.palantier.wiki.domain.WikiBlock;
import com.mapo.palantier.wiki.domain.WikiBlockRepository;
import com.mapo.palantier.wiki.domain.WikiPost;
import com.mapo.palantier.wiki.domain.WikiPostRepository;
import com.mapo.palantier.wiki.presentation.dto.WikiBlockRequest;
import com.mapo.palantier.wiki.presentation.dto.WikiPostDetail;
import com.mapo.palantier.wiki.presentation.dto.WikiPostRequest;
import com.mapo.palantier.wiki.presentation.dto.WikiPostSummary;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WikiPostService {

    private final WikiPostRepository wikiPostRepository;
    private final WikiBlockRepository wikiBlockRepository;

    public List<WikiPostSummary> getAllPosts() {
        return wikiPostRepository.findAll();
    }

    public List<WikiPostSummary> getPostsByFolderId(Long folderId) {
        return wikiPostRepository.findByFolderId(folderId);
    }

    public WikiPostDetail getPostWithBlocks(Long id) {
        return wikiPostRepository
            .findByIdWithBlocks(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.WIKI_POST_NOT_FOUND)
            );
    }

    @Transactional
    public Long savePost(WikiPostRequest request, Long currentUserId) {
        String tags = Tags.from(request.getTags()).toCsv();

        if (request.getId() == null) {
            // 신규 생성 — 도메인 팩토리 메서드 사용
            WikiPost post = WikiPost.create(
                request.getFolderId(),
                request.getTitle(),
                currentUserId,
                request.getIsPinned(),
                tags
            );
            wikiPostRepository.insert(post);
            saveBlocks(post.getId(), request.getBlocks());
            return post.getId();
        } else {
            // 수정 — 도메인 팩토리 메서드 사용
            WikiPost post = WikiPost.modify(
                request.getId(),
                request.getFolderId(),
                request.getTitle(),
                currentUserId,
                request.getIsPinned(),
                tags
            );
            wikiPostRepository.update(post);
            wikiBlockRepository.deleteByPostId(post.getId());
            saveBlocks(post.getId(), request.getBlocks());
            return post.getId();
        }
    }

    @Transactional
    public void deletePost(Long id) {
        wikiPostRepository.softDelete(id);
    }

    private void saveBlocks(Long postId, List<WikiBlockRequest> blockRequests) {
        if (blockRequests == null || blockRequests.isEmpty()) return;
        for (int i = 0; i < blockRequests.size(); i++) {
            WikiBlockRequest req = blockRequests.get(i);
            WikiBlock block = WikiBlock.builder()
                .postId(postId)
                .blockType(req.getBlockType())
                .content(req.getContent())
                .sortOrder(i)
                .build();
            wikiBlockRepository.insert(block);
        }
    }
}
