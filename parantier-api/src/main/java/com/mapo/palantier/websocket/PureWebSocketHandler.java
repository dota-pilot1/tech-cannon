package com.mapo.palantier.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mapo.palantier.issue.application.IssueMessageService;
import com.mapo.palantier.issue.domain.IssueMessage;
import com.mapo.palantier.meeting.application.MeetingChatService;
import com.mapo.palantier.meeting.domain.MeetingChatMessage;
import com.mapo.palantier.work.application.WorkMessageService;
import com.mapo.palantier.work.application.WorkStatusChatService;
import com.mapo.palantier.work.domain.WorkMessage;
import com.mapo.palantier.work.domain.WorkStatusChatMessage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
public class PureWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private MeetingChatService meetingChatService;

    @Autowired
    private IssueMessageService issueMessageService;

    @Autowired
    private WorkMessageService workMessageService;

    @Autowired
    private WorkStatusChatService workStatusChatService;

    // topic → 세션 목록
    private final ConcurrentHashMap<
        String,
        CopyOnWriteArrayList<WebSocketSession>
    > topicSessions = new ConcurrentHashMap<>();
    // sessionId → 참여자 정보 (userId, username, type)
    private final ConcurrentHashMap<
        String,
        Map<String, Object>
    > sessionParticipants = new ConcurrentHashMap<>();
    // 회의실 참여자: channelId → (userId → username)
    private final ConcurrentHashMap<
        Long,
        ConcurrentHashMap<Long, String>
    > meetingChannelParticipants = new ConcurrentHashMap<>();
    // 업무현황 참여자: userId → username
    private final ConcurrentHashMap<Long, String> workStatusParticipants =
        new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        log.info("WS Connected: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(
        WebSocketSession session,
        CloseStatus status
    ) {
        log.info("WS Disconnected: {} status={}", session.getId(), status);

        // 모든 토픽에서 세션 제거
        topicSessions.forEach((topic, sessions) -> sessions.remove(session));

        // 참여자 정보 제거 및 브로드캐스트
        Map<String, Object> participant = sessionParticipants.remove(
            session.getId()
        );
        if (participant != null) {
            Long userId = (Long) participant.get("userId");
            String type = (String) participant.get("type");
            if (userId != null) {
                if ("meeting".equals(type)) {
                    Long channelId = (Long) participant.get("channelId");
                    if (channelId != null) {
                        ConcurrentHashMap<Long, String> channelMap =
                            meetingChannelParticipants.get(channelId);
                        if (channelMap != null) channelMap.remove(userId);
                        broadcastMeetingChannelParticipants(channelId);
                    }
                } else if ("work-status".equals(type)) {
                    workStatusParticipants.remove(userId);
                    broadcastWorkStatusParticipants();
                }
            }
        }
    }

    @Override
    protected void handleTextMessage(
        WebSocketSession session,
        TextMessage message
    ) {
        try {
            WsMessage msg = objectMapper.readValue(
                message.getPayload(),
                WsMessage.class
            );
            String type = msg.getType();
            String topic = msg.getTopic();

            // data를 Map으로 변환
            @SuppressWarnings("unchecked")
            Map<String, Object> data =
                msg.getData() != null
                    ? objectMapper.convertValue(msg.getData(), Map.class)
                    : Collections.emptyMap();

            switch (type) {
                case "SUBSCRIBE" -> handleSubscribe(session, topic);
                case "UNSUBSCRIBE" -> handleUnsubscribe(session, topic);
                case "CHAT" -> handleChat(session, topic, data);
                case "JOIN" -> handleJoin(session, topic, data);
                case "LEAVE" -> handleLeave(session, topic, data);
                default -> log.warn("Unknown WS message type: {}", type);
            }
        } catch (Exception e) {
            log.error("WS message handling error: {}", e.getMessage(), e);
        }
    }

    // -----------------------------------------------------------------------
    // SUBSCRIBE / UNSUBSCRIBE
    // -----------------------------------------------------------------------

    private void handleSubscribe(WebSocketSession session, String topic) {
        topicSessions
            .computeIfAbsent(topic, k -> new CopyOnWriteArrayList<>())
            .add(session);
        log.info("Session {} subscribed to '{}'", session.getId(), topic);
    }

    private void handleUnsubscribe(WebSocketSession session, String topic) {
        CopyOnWriteArrayList<WebSocketSession> sessions = topicSessions.get(
            topic
        );
        if (sessions != null) {
            sessions.remove(session);
            log.info(
                "Session {} unsubscribed from '{}'",
                session.getId(),
                topic
            );
        }
    }

    // -----------------------------------------------------------------------
    // JOIN / LEAVE
    // -----------------------------------------------------------------------

    private void handleJoin(
        WebSocketSession session,
        String topic,
        Map<String, Object> data
    ) {
        Long userId = toLong(data.get("userId"));
        String username = (String) data.get("username");
        if (userId == null || username == null) {
            log.warn(
                "JOIN ignored – missing userId or username. topic={}",
                topic
            );
            return;
        }

        Map<String, Object> participantInfo = new HashMap<>();
        participantInfo.put("userId", userId);
        participantInfo.put("username", username);

        if (topic.startsWith("meeting-participants/")) {
            Long channelId = Long.parseLong(
                topic.substring("meeting-participants/".length())
            );
            participantInfo.put("type", "meeting");
            participantInfo.put("channelId", channelId);
            sessionParticipants.put(session.getId(), participantInfo);
            meetingChannelParticipants
                .computeIfAbsent(channelId, k -> new ConcurrentHashMap<>())
                .put(userId, username);
            broadcastMeetingChannelParticipants(channelId);
            log.info(
                "User {}({}) joined meeting-participants/{}",
                userId,
                username,
                channelId
            );
        } else if ("work-status-participants".equals(topic)) {
            participantInfo.put("type", "work-status");
            sessionParticipants.put(session.getId(), participantInfo);
            workStatusParticipants.put(userId, username);
            broadcastWorkStatusParticipants();
            log.info(
                "User {}({}) joined work-status-participants",
                userId,
                username
            );
        }
    }

    private void handleLeave(
        WebSocketSession session,
        String topic,
        Map<String, Object> data
    ) {
        Long userId = toLong(data.get("userId"));
        if (userId == null) {
            log.warn("LEAVE ignored – missing userId. topic={}", topic);
            return;
        }

        if (topic.startsWith("meeting-participants/")) {
            Long channelId = Long.parseLong(
                topic.substring("meeting-participants/".length())
            );
            ConcurrentHashMap<Long, String> channelMap =
                meetingChannelParticipants.get(channelId);
            if (channelMap != null) channelMap.remove(userId);
            sessionParticipants.remove(session.getId());
            broadcastMeetingChannelParticipants(channelId);
            log.info("User {} left meeting-participants/{}", userId, channelId);
        } else if ("work-status-participants".equals(topic)) {
            workStatusParticipants.remove(userId);
            sessionParticipants.remove(session.getId());
            broadcastWorkStatusParticipants();
            log.info("User {} left work-status-participants", userId);
        }
    }

    // -----------------------------------------------------------------------
    // CHAT
    // -----------------------------------------------------------------------

    private void handleChat(
        WebSocketSession session,
        String topic,
        Map<String, Object> data
    ) throws Exception {
        if (topic.startsWith("meeting/")) {
            long channelId = Long.parseLong(topic.split("/")[1]);
            Long senderId = toLong(data.get("senderId"));
            String senderName = (String) data.get("senderName");
            String messageText = (String) data.get("message");

            MeetingChatMessage saved = meetingChatService.createMessage(
                senderId,
                messageText,
                channelId
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", saved.getId());
            response.put("userId", saved.getUserId());
            response.put("senderId", senderId);
            response.put("senderName", senderName);
            response.put("username", senderName);
            response.put("message", saved.getMessage());
            response.put("channelId", channelId);
            response.put(
                "createdAt",
                saved.getCreatedAt() != null
                    ? saved.getCreatedAt().toString()
                    : LocalDateTime.now(ZoneOffset.UTC).toString()
            );

            broadcast(topic, new WsMessage("CHAT", topic, response));
        } else if (topic.startsWith("issue/")) {
            long issueId = Long.parseLong(topic.split("/")[1]);
            Long senderId = toLong(data.get("senderId"));
            String senderName = (String) data.get("senderName");
            String messageText = (String) data.get("message");

            IssueMessage saved = issueMessageService.createMessage(
                issueId,
                senderId,
                messageText
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", saved.getId());
            response.put("issueId", saved.getIssueId());
            response.put("userId", saved.getUserId());
            response.put("senderId", senderId);
            response.put("senderName", senderName);
            response.put("username", senderName);
            response.put("message", saved.getMessage());
            response.put(
                "createdAt",
                saved.getCreatedAt() != null
                    ? saved.getCreatedAt().toString()
                    : LocalDateTime.now(ZoneOffset.UTC).toString()
            );

            broadcast(topic, new WsMessage("CHAT", topic, response));
        } else if (topic.startsWith("work/")) {
            long workId = Long.parseLong(topic.split("/")[1]);
            Long senderId = toLong(data.get("senderId"));
            String senderName = (String) data.get("senderName");
            String messageText = (String) data.get("message");

            WorkMessage saved = workMessageService.createMessage(
                workId,
                senderId,
                messageText
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", saved.getId());
            response.put("workId", saved.getWorkId());
            response.put("userId", saved.getUserId());
            response.put("senderId", senderId);
            response.put("senderName", senderName);
            response.put("username", senderName);
            response.put("message", saved.getMessage());
            response.put(
                "createdAt",
                saved.getCreatedAt() != null
                    ? saved.getCreatedAt().toString()
                    : LocalDateTime.now(ZoneOffset.UTC).toString()
            );

            broadcast(topic, new WsMessage("CHAT", topic, response));
        } else if ("work-status".equals(topic)) {
            Long senderId = toLong(data.get("senderId"));
            String senderName = (String) data.get("senderName");
            String messageText = (String) data.get("message");

            WorkStatusChatMessage saved = workStatusChatService.createMessage(
                senderId,
                messageText
            );

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", saved.getId());
            response.put("userId", saved.getUserId());
            response.put("senderId", senderId);
            response.put("senderName", senderName);
            response.put("username", senderName);
            response.put("message", saved.getMessage());
            response.put(
                "createdAt",
                saved.getCreatedAt() != null
                    ? saved.getCreatedAt().toString()
                    : LocalDateTime.now(ZoneOffset.UTC).toString()
            );

            broadcast(topic, new WsMessage("CHAT", topic, response));
        } else {
            log.warn("CHAT on unknown topic: {}", topic);
        }
    }

    // -----------------------------------------------------------------------
    // PARTICIPANTS 브로드캐스트
    // -----------------------------------------------------------------------

    private void broadcastMeetingChannelParticipants(Long channelId) {
        ConcurrentHashMap<Long, String> channelMap =
            meetingChannelParticipants.get(channelId);
        List<Map<String, Object>> list = new ArrayList<>();
        if (channelMap != null) {
            channelMap.forEach((uid, uname) -> {
                Map<String, Object> p = new HashMap<>();
                p.put("userId", uid);
                p.put("username", uname);
                list.add(p);
            });
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("participants", list);
        String topic = "meeting-participants/" + channelId;
        broadcast(topic, new WsMessage("PARTICIPANTS", topic, payload));
    }

    private void broadcastWorkStatusParticipants() {
        List<Map<String, Object>> list = new ArrayList<>();
        workStatusParticipants.forEach((userId, username) -> {
            Map<String, Object> p = new HashMap<>();
            p.put("userId", userId);
            p.put("username", username);
            list.add(p);
        });
        Map<String, Object> payload = new HashMap<>();
        payload.put("participants", list);
        broadcast(
            "work-status-participants",
            new WsMessage("PARTICIPANTS", "work-status-participants", payload)
        );
    }

    // -----------------------------------------------------------------------
    // 외부에서 호출 가능한 브로드캐스트 메서드 (WorkStatusLogService 등)
    // -----------------------------------------------------------------------

    /**
     * 특정 topic을 구독 중인 모든 세션에 WsMessage를 전송합니다.
     */
    public void broadcast(String topic, WsMessage message) {
        CopyOnWriteArrayList<WebSocketSession> sessions = topicSessions.get(
            topic
        );
        if (sessions == null || sessions.isEmpty()) return;

        try {
            String json = objectMapper.writeValueAsString(message);
            TextMessage textMessage = new TextMessage(json);
            List<WebSocketSession> deadSessions = new ArrayList<>();

            for (WebSocketSession s : sessions) {
                if (s.isOpen()) {
                    try {
                        s.sendMessage(textMessage);
                    } catch (IOException e) {
                        log.warn(
                            "Failed to send to session {}: {}",
                            s.getId(),
                            e.getMessage()
                        );
                        deadSessions.add(s);
                    }
                } else {
                    deadSessions.add(s);
                }
            }
            sessions.removeAll(deadSessions);
        } catch (Exception e) {
            log.error(
                "Broadcast error for topic '{}': {}",
                topic,
                e.getMessage()
            );
        }
    }

    /**
     * 단일 세션에 WsMessage를 전송합니다.
     */
    public void sendToSession(WebSocketSession session, WsMessage message) {
        if (!session.isOpen()) return;
        try {
            String json = objectMapper.writeValueAsString(message);
            session.sendMessage(new TextMessage(json));
        } catch (Exception e) {
            log.warn(
                "Failed to send to session {}: {}",
                session.getId(),
                e.getMessage()
            );
        }
    }

    // -----------------------------------------------------------------------
    // 유틸
    // -----------------------------------------------------------------------

    private Long toLong(Object val) {
        if (val == null) return null;
        if (val instanceof Long l) return l;
        if (val instanceof Integer i) return i.longValue();
        if (val instanceof Number n) return n.longValue();
        try {
            return Long.parseLong(val.toString());
        } catch (Exception e) {
            return null;
        }
    }
}
