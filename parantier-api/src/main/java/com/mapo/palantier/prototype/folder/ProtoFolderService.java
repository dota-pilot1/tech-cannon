package com.mapo.palantier.prototype.folder;

import com.mapo.palantier.prototype.dto.ProtoFolderDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProtoFolderService {
    private final ProtoFolderMapper protoFolderMapper;

    public List<ProtoFolder> getAllFolders() {
        return protoFolderMapper.findAll();
    }

    public ProtoFolder getFolderById(Long id) {
        return protoFolderMapper.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("폴더를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public Long createFolder(ProtoFolderDto dto, Long currentUserId) {
        ProtoFolder folder = new ProtoFolder();
        folder.setParentId(dto.getParentId());
        folder.setName(dto.getName());
        folder.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0);
        folder.setCreatedBy(currentUserId);
        protoFolderMapper.insert(folder);
        return folder.getId();
    }

    @Transactional
    public void updateFolder(Long id, ProtoFolderDto dto) {
        ProtoFolder folder = getFolderById(id);
        folder.setName(dto.getName());
        if (dto.getParentId() != null) folder.setParentId(dto.getParentId());
        if (dto.getSortOrder() != null) folder.setSortOrder(dto.getSortOrder());
        protoFolderMapper.update(folder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        protoFolderMapper.softDelete(id);
    }
}
