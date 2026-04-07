package com.mapo.palantier.wiki.infrastructure;

import com.mapo.palantier.wiki.domain.WikiPost;
import com.mapo.palantier.wiki.domain.WikiPostRepository;
import com.mapo.palantier.wiki.presentation.dto.WikiPostDetail;
import com.mapo.palantier.wiki.presentation.dto.WikiPostSummary;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class WikiPostRepositoryImpl implements WikiPostRepository {

    private final WikiPostMapper wikiPostMapper;

    @Override
    public List<WikiPostSummary> findAll() {
        return wikiPostMapper.findAll();
    }

    @Override
    public List<WikiPostSummary> findByFolderId(Long folderId) {
        return wikiPostMapper.findByFolderId(folderId);
    }

    @Override
    public Optional<WikiPostSummary> findById(Long id) {
        return wikiPostMapper.findById(id);
    }

    @Override
    public Optional<WikiPostDetail> findByIdWithBlocks(Long id) {
        return wikiPostMapper.findByIdWithBlocks(id);
    }

    @Override
    public void insert(WikiPost post) {
        wikiPostMapper.insert(post);
    }

    @Override
    public void update(WikiPost post) {
        wikiPostMapper.update(post);
    }

    @Override
    public void softDelete(Long id) {
        wikiPostMapper.softDelete(id);
    }
}
