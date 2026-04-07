package com.mapo.palantier.wiki.infrastructure;

import com.mapo.palantier.wiki.domain.WikiFolder;
import com.mapo.palantier.wiki.domain.WikiFolderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class WikiFolderRepositoryImpl implements WikiFolderRepository {

    private final WikiFolderMapper wikiFolderMapper;

    @Override
    public List<WikiFolder> findAll() {
        return wikiFolderMapper.findAll();
    }

    @Override
    public Optional<WikiFolder> findById(Long id) {
        return wikiFolderMapper.findById(id);
    }

    @Override
    public void insert(WikiFolder folder) {
        wikiFolderMapper.insert(folder);
    }

    @Override
    public void update(WikiFolder folder) {
        wikiFolderMapper.update(folder);
    }

    @Override
    public void softDelete(Long id) {
        wikiFolderMapper.softDelete(id);
    }
}
