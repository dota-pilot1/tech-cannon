package com.mapo.palantier.wiki.infrastructure;

import com.mapo.palantier.wiki.domain.WikiBlock;
import com.mapo.palantier.wiki.domain.WikiBlockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class WikiBlockRepositoryImpl implements WikiBlockRepository {

    private final WikiBlockMapper wikiBlockMapper;

    @Override
    public List<WikiBlock> findByPostId(Long postId) {
        return wikiBlockMapper.findByPostId(postId);
    }

    @Override
    public void insert(WikiBlock block) {
        wikiBlockMapper.insert(block);
    }

    @Override
    public void deleteByPostId(Long postId) {
        wikiBlockMapper.deleteByPostId(postId);
    }
}
