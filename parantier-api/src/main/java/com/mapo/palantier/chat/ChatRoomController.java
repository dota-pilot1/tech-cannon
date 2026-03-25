package com.mapo.palantier.chat;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "채팅방", description = "채팅방 관리 API")
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {
    private final ChatRoomService chatRoomService;
    private final ChatMessageMapper chatMessageMapper;

    @Operation(summary = "모든 활성 채팅방 목록 조회")
    @GetMapping
    public ResponseEntity<List<ChatRoom>> getAllRooms() {
        List<ChatRoom> rooms = chatRoomService.getAllRooms();
        log.info("채팅방 목록 조회 - 총 {}개", rooms.size());
        return ResponseEntity.ok(rooms);
    }

    @Operation(summary = "내가 참가한 채팅방 목록 조회")
    @GetMapping("/my")
    public ResponseEntity<List<ChatRoom>> getMyRooms(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
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
    public ResponseEntity<Long> createRoom(@RequestBody ChatRoom chatRoom, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        chatRoom.setCreatedBy(userId);
        Long roomId = chatRoomService.createRoom(chatRoom);
        return ResponseEntity.ok(roomId);
    }

    @Operation(summary = "채팅방 수정")
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateRoom(@PathVariable Long id, @RequestBody ChatRoom chatRoom) {
        chatRoom.setId(id);
        chatRoomService.updateRoom(chatRoom);
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
    public ResponseEntity<Void> deleteAllRooms(HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        // TODO: 관리자 권한 체크 로직 추가 가능
        chatRoomService.deleteAllRooms();
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 참가")
    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinRoom(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        chatRoomService.joinRoom(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 나가기")
    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable Long id, HttpServletRequest request) {
        Long userId = getUserIdFromRequest(request);
        chatRoomService.leaveRoom(id, userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "채팅방 메시지 히스토리 조회")
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ChatMessageHistory>> getRoomMessages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(required = false) Long beforeId
    ) {
        List<ChatMessageHistory> messages = chatMessageMapper.findByRoomId(id, limit, beforeId);
        return ResponseEntity.ok(messages);
    }

    /**
     * HttpServletRequest에서 userId 추출 (JWT 필터에서 저장한 값)
     */
    private Long getUserIdFromRequest(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new IllegalStateException("User ID not found in request. Authentication required.");
        }
        return userId;
    }
}
