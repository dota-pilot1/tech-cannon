package com.mapo.palantier.chat.presentation;

import com.mapo.palantier.chat.application.ChatMessageService;
import com.mapo.palantier.chat.application.ChatRoomService;
import com.mapo.palantier.chat.domain.ChatMessageHistory;
import com.mapo.palantier.chat.domain.ChatRoom;
import com.mapo.palantier.chat.domain.RoomMember;
import com.mapo.palantier.chat.presentation.dto.ChatRoomRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Tag(name = "채팅방", description = "채팅방 관리 API")
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;
    private final ChatMessageService chatMessageService;
    private final com.mapo.palantier.websocket.PureWebSocketHandler pureWebSocketHandler;

    @Operation(summary = "모든 활성 채팅방 목록 조회")
    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllRooms() {
        return ResponseEntity.ok(chatRoomService.getAllRooms());
    }

    @Operation(summary = "내가 참가한 채팅방 목록 조회")
    @GetMapping("/my")
    public ResponseEntity<List<ChatRoom>> getMyRooms(
        @RequestAttribute("userId") Long userId
    ) {
        return ResponseEntity.ok(chatRoomService.getRoomsByUserId(userId));
    }

    @Operation(summary = "채팅방 상세 조회")
    @GetMapping("/{id}")
    public ResponseEntity<ChatRoom> getRoom(@PathVariable Long id) {
        return ResponseEntity.ok(chatRoomService.getRoomById(id));
    }

    @Operation(summary = "채팅방 참가자 목록 조회")
    @GetMapping("/{id}/members")
    public ResponseEntity<List<RoomMember>> getRoomMembers(@PathVariable Long id) {
        return ResponseEntity.ok(chatRoomService.getRoomMembers(id));
    }

    @Operation(summary = "채팅방 생성")
    @PostMapping
    public ResponseEntity<Long> createRoom(
        @RequestBody @Valid ChatRoomRequest request,
        @RequestAttribute("userId") Long userId
    ) {
        Long roomId = chatRoomService.createRoom(request.getName(), request.getRoomType(), userId);
        // DIRECT 방이면 targetUserId로 상대방도 자동 참가
        if ("DIRECT".equals(request.getRoomType()) && request.getTargetUserId() != null) {
            chatRoomService.joinRoom(roomId, request.getTargetUserId());
        }
        return ResponseEntity.ok(roomId);
    }

    @Operation(summary = "채팅방 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateRoom(
        @PathVariable Long id,
        @RequestBody @Valid ChatRoomRequest request
    ) {
        chatRoomService.updateRoom(id, request.getName(), request.getRoomType());
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 삭제")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        chatRoomService.deleteRoom(id);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "모든 채팅방 삭제 (관리자 전용)")
    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllRooms() {
        chatRoomService.deleteAllRooms();
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 참가")
    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinRoom(
        @PathVariable Long id,
        @RequestAttribute("userId") Long userId
    ) {
        chatRoomService.joinRoom(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 나가기")
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveRoom(
        @PathVariable Long id,
        @RequestAttribute("userId") Long userId
    ) {
        chatRoomService.leaveRoom(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "메시지 전송 (REST)")
    @PostMapping("/{id}/messages")
    public ResponseEntity<Void> sendMessage(
        @PathVariable Long id,
        @RequestBody java.util.Map<String, Object> body,
        @RequestAttribute("userId") Long userId
    ) {
        String content = (String) body.get("content");
        String senderName = (String) body.get("senderName");
        String messageType = (String) body.getOrDefault("messageType", "TALK");

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        chatMessageService.saveMessage(id, userId, senderName, content, messageType, now);

        // WebSocket 브로드캐스트 (온라인 유저에게)
        try {
            java.util.Map<String, Object> data = new java.util.LinkedHashMap<>();
            data.put("roomId", id);
            data.put("senderId", userId);
            data.put("senderName", senderName);
            data.put("content", content);
            data.put("messageType", messageType);
            data.put("createdAt", now.toString());

            pureWebSocketHandler.broadcast(
                "chat/" + id,
                new com.mapo.palantier.websocket.WsMessage("CHAT", "chat/" + id, data)
            );
        } catch (Exception e) {
            log.debug("WebSocket broadcast failed (no subscribers?): {}", e.getMessage());
        }

        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 메시지 히스토리 조회")
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessageHistory>> getRoomMessages(
        @PathVariable Long id,
        @RequestParam(defaultValue = "50") int limit,
        @RequestParam(required = false) Long beforeId
    ) {
        return ResponseEntity.ok(chatMessageService.getMessages(id, limit, beforeId));
    }
}
