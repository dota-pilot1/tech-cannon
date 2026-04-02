package com.mapo.palantier.prompt.post;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PromptService {
    private final PromptMapper promptMapper;

    public List<Prompt> getAllPrompts() {
        return promptMapper.findAll();
    }

    public List<Prompt> getPromptsByFolder(Long folderId) {
        return promptMapper.findByFolderId(folderId);
    }

    public Prompt getPrompt(Long id) {
        return promptMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("프롬프트를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long savePrompt(PromptDto dto, Long authorId) {
        Prompt prompt = new Prompt();
        prompt.setFolderId(dto.getFolderId());
        prompt.setTitle(dto.getTitle());
        prompt.setContent(dto.getContent());
        prompt.setAuthorId(authorId);
        prompt.setIsPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false);
        prompt.setTags(dto.getTags() != null ? String.join(",", dto.getTags()) : "");

        if (dto.getId() == null) {
            promptMapper.insert(prompt);
        } else {
            prompt.setId(dto.getId());
            promptMapper.update(prompt);
        }
        return prompt.getId();
    }

    @Transactional
    public void deletePrompt(Long id) {
        promptMapper.softDelete(id);
    }
}
