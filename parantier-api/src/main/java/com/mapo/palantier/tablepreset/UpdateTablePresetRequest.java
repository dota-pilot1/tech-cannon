package com.mapo.palantier.tablepreset;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTablePresetRequest {
    private String name;
    private List<String> headers;
    private Boolean isDefault;
}
