package com.mapo.palantier.prototype.folder;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.prototype.dto.ProtoFolderDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProtoFolderService {

    private final ProtoFolderMapper protoFolderMapper;

    public List<ProtoFolder> getAllFolders() {
        return protoFolderMapper.findAll();
    }

    public ProtoFolder getFolderById(Long id) {
        return protoFolderMapper
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.PROTO_FOLDER_NOT_FOUND)
            );
    }

    @Transactional
    public Long createFolder(ProtoFolderDto dto, Long currentUserId) {
        ProtoFolder folder = ProtoFolder.builder()
            .parentId(dto.getParentId())
            .name(dto.getName())
            .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
            .createdBy(currentUserId)
            .build();
        protoFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, ProtoFolderDto dto) {
        ProtoFolder existing = getFolderById(id);
        ProtoFolder folder = ProtoFolder.builder()
            .id(existing.getId())
            .parentId(
                dto.getParentId() != null
                    ? dto.getParentId()
                    : existing.getParentId()
            )
            .name(dto.getName())
            .sortOrder(
                dto.getSortOrder() != null
                    ? dto.getSortOrder()
                    : existing.getSortOrder()
            )
            .createdBy(existing.getCreatedBy())
            .createdAt(existing.getCreatedAt())
            .build();
        protoFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        protoFolderMapper.softDelete(id);
    }
}
