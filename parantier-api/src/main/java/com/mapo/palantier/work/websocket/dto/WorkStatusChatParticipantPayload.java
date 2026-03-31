package com.mapo.palantier.work.websocket.dto;

import java.util.List;

public class WorkStatusChatParticipantPayload {

    public static class Participant {
        private Long userId;
        private String username;

        public Participant() {}

        public Participant(Long userId, String username) {
            this.userId = userId;
            this.username = username;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }

    private List<Participant> participants;

    public WorkStatusChatParticipantPayload() {}

    public WorkStatusChatParticipantPayload(List<Participant> participants) {
        this.participants = participants;
    }

    public List<Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(List<Participant> participants) {
        this.participants = participants;
    }
}
