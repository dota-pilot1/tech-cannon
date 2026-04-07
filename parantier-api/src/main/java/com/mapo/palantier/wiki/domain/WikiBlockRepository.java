package com.mapo.palantier.wiki.domain;

import java.util.List;

public interface WikiBlockRepository {
    List<WikiBlock> findByPostId(Long postId);
    void insert(WikiBlock block);
    void deleteByPostId(Long postId);
}
