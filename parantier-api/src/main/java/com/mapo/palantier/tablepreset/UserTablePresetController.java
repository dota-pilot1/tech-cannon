package com.mapo.palantier.tablepreset;

import com.mapo.palantier.config.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/table-presets")
@RequiredArgsConstructor
public class UserTablePresetController {

    private final UserTablePresetService presetService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<List<UserTablePreset>> getMyPresets(@RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        List<UserTablePreset> presets = presetService.getUserPresets(userId);
        return ResponseEntity.ok(presets);
    }

    @GetMapping("/default")
    public ResponseEntity<UserTablePreset> getDefaultPreset(@RequestHeader("Authorization") String token) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        UserTablePreset preset = presetService.getDefaultPreset(userId);
        if (preset == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(preset);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserTablePreset> getPreset(@PathVariable Long id) {
        UserTablePreset preset = presetService.getPresetById(id);
        if (preset == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(preset);
    }

    @PostMapping
    public ResponseEntity<UserTablePreset> createPreset(
            @RequestHeader("Authorization") String token,
            @RequestBody CreateTablePresetRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromToken(token.substring(7));
        UserTablePreset created = presetService.createPreset(userId, request);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserTablePreset> updatePreset(
            @PathVariable Long id,
            @RequestBody UpdateTablePresetRequest request) {
        UserTablePreset updated = presetService.updatePreset(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePreset(@PathVariable Long id) {
        presetService.deletePreset(id);
        return ResponseEntity.noContent().build();
    }
}
