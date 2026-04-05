package com.mapo.palantier.devlog;

import lombok.Data;

@Data
public class DevLogLinkDto {
    private Long targetId; // issueId 또는 workId
}
