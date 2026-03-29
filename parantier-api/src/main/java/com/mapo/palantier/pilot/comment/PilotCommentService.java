package com.mapo.palantier.pilot.comment;

import com.mapo.palantier.pilot.dto.PilotCommentDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PilotCommentService {
    private final PilotCommentMapper pilotCommentMapper;

    public List<PilotComment> getCommentsByPostId(Long postId) {
        return pilotCommentMapper.findByPostId(postId);
    }

    @Transactional
    public Long createComment(PilotCommentDto dto, Long currentUserId) {
        PilotComment comment = new PilotComment();
        comment.setPostId(dto.getPostId());
        comment.setAuthorId(currentUserId);
        comment.setContent(dto.getContent());

        pilotCommentMapper.insert(comment);
        return comment.getId();
    }

    @Transactional
    public void deleteComment(Long id) {
        pilotCommentMapper.softDelete(id);
    }
}
