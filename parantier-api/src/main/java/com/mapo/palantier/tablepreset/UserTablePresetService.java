package com.mapo.palantier.tablepreset;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserTablePresetService {

    private final UserTablePresetMapper presetMapper;

    public List<UserTablePreset> getUserPresets(Long userId) {
        return presetMapper.findByUserId(userId);
    }

    public UserTablePreset getPresetById(Long id) {
        return presetMapper.findById(id);
    }

    public UserTablePreset getDefaultPreset(Long userId) {
        return presetMapper.findDefaultByUserId(userId);
    }

    @Transactional
    public UserTablePreset createPreset(
        Long userId,
        CreateTablePresetRequest request
    ) {
        // 새로운 프리셋을 기본값으로 설정하는 경우, 기존 기본값 해제
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            presetMapper.clearDefaultForUser(userId);
        }

        UserTablePreset preset = UserTablePreset.builder()
            .userId(userId)
            .name(request.getName())
            .headers(request.getHeaders())
            .isDefault(
                request.getIsDefault() != null ? request.getIsDefault() : false
            )
            .build();

        presetMapper.insert(preset);
        return preset;
    }

    @Transactional
    public UserTablePreset updatePreset(
        Long id,
        UpdateTablePresetRequest request
    ) {
        UserTablePreset existing = presetMapper.findById(id);
        if (existing == null) {
            throw new IllegalArgumentException(
                "Preset not found with id: " + id
            );
        }

        // 새로운 기본값 설정 시 기존 기본값 해제
        if (
            Boolean.TRUE.equals(request.getIsDefault()) &&
            !Boolean.TRUE.equals(existing.getIsDefault())
        ) {
            presetMapper.clearDefaultForUser(existing.getUserId());
        }

        UserTablePreset updated = UserTablePreset.builder()
            .id(existing.getId())
            .userId(existing.getUserId())
            .name(request.getName())
            .headers(request.getHeaders())
            .isDefault(
                request.getIsDefault() != null ? request.getIsDefault() : false
            )
            .createdAt(existing.getCreatedAt())
            .build();

        presetMapper.update(updated);
        return updated;
    }

    @Transactional
    public void deletePreset(Long id) {
        presetMapper.delete(id);
    }
}
