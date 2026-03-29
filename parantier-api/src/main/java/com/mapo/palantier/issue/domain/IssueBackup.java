package com.mapo.palantier.issue.domain;

import java.time.LocalDateTime;

public class IssueBackup {
    private Long id;
    private Long originalId;
    private String snapshot;
    private Long backedUpBy;
    private LocalDateTime backedUpAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOriginalId() { return originalId; }
    public void setOriginalId(Long originalId) { this.originalId = originalId; }

    public String getSnapshot() { return snapshot; }
    public void setSnapshot(String snapshot) { this.snapshot = snapshot; }

    public Long getBackedUpBy() { return backedUpBy; }
    public void setBackedUpBy(Long backedUpBy) { this.backedUpBy = backedUpBy; }

    public LocalDateTime getBackedUpAt() { return backedUpAt; }
    public void setBackedUpAt(LocalDateTime backedUpAt) { this.backedUpAt = backedUpAt; }
}
