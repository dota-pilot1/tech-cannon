package com.mapo.palantier.prompt.post;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return promptMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.PROMPT_NOT_FOUND)
            );
    }

    @Transactional
    public Long savePrompt(PromptDto dto, Long authorId) {
        String tags =
            dto.getTags() != null ? String.join(",", dto.getTags()) : "";
        if (dto.getId() == null) {
            Prompt prompt = Prompt.builder()
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .authorId(authorId)
                .isPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false)
                .tags(tags)
                .build();
            promptMapper.insert(prompt);
            return prompt.getId();
        } else {
            Prompt prompt = Prompt.builder()
                .id(dto.getId())
                .folderId(dto.getFolderId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .authorId(authorId)
                .isPinned(dto.getIsPinned() != null ? dto.getIsPinned() : false)
                .tags(tags)
                .build();
            promptMapper.update(prompt);
            return prompt.getId();
        }
    }

    @Transactional
    public void deletePrompt(Long id) {
        promptMapper.softDelete(id);
    }
}
