package com.mapo.palantier.pilot.presentation.dto;

public class PilotReorderItem {
    private Long id;
    private Integer orderNum;

    public PilotReorderItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getOrderNum() { return orderNum; }
    public void setOrderNum(Integer orderNum) { this.orderNum = orderNum; }
}
