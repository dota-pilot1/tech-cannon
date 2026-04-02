package com.mapo.palantier.prompt.folder;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromptFolderService {
    private final PromptFolderMapper promptFolderMapper;

    public List<PromptFolder> getFolders() {
        return promptFolderMapper.findAll();
    }

    @Transactional
    public void createFolder(PromptFolder folder) {
        promptFolderMapper.insert(folder);
    }

    @Transactional
    public void renameFolder(Long id, String name) {
        promptFolderMapper.update(id, name);
    }

    @Transactional
    public void deleteFolder(Long id) {
        promptFolderMapper.delete(id);
    }
}
