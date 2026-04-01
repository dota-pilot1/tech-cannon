package com.mapo.palantier.websocket;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WsMessage {
    private String type;   // CHAT, JOIN, LEAVE, PARTICIPANTS, SUBSCRIBE, UNSUBSCRIBE
    private String topic;  // meeting/1, meeting-participants, issue/5, work/3, work-status, work-status-participants
    private Object data;
}
