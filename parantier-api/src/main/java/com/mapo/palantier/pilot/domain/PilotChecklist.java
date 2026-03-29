package com.mapo.palantier.pilot.domain;

import java.time.LocalDateTime;

public class PilotChecklist {
    private Long id;
    private Long pilotId;
    private String content;
    private Boolean isChecked;
    private String imageUrl;
    private String imageFilename;
    private Integer orderNum;
    private LocalDateTime createdAt;

    public PilotChecklist() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPilotId() { return pilotId; }
    public void setPilotId(Long pilotId) { this.pilotId = pilotId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Boolean getIsChecked() { return isChecked; }
    public void setIsChecked(Boolean isChecked) { this.isChecked = isChecked; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImageFilename() { return imageFilename; }
    public void setImageFilename(String imageFilename) { this.imageFilename = imageFilename; }

    public Integer getOrderNum() { return orderNum; }
    public void setOrderNum(Integer orderNum) { this.orderNum = orderNum; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
