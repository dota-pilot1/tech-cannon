# 시간 설정 가이드 (Time Zone Guide)

## 개요

이 프로젝트는 **서버(백엔드) UTC 기준**, **프론트엔드 로컬 시간 표시** 원칙을 따릅니다.

---

## 백엔드 (Spring Boot 4.x / Jackson 3.x)

### Jackson 3.x 기본 동작

Spring Boot 4.x는 `tools.jackson.core:jackson-databind:3.1.0`을 사용합니다.
Jackson 3.x에서는 `WRITE_DATES_AS_TIMESTAMPS`가 **기본값 `false`** 이므로
별도 설정 없이 `LocalDateTime`이 ISO 8601 문자열로 직렬화됩니다.

```java
// tools.jackson.databind.cfg.DateTimeFeature
WRITE_DATES_AS_TIMESTAMPS(false)  // 기본값이 이미 false → ISO 8601 출력
```

### ⚠️ 주의: application.yml에 jackson 설정 금지

Spring Boot 4.x에서는 아래 설정이 **에러**를 유발합니다.

```yaml
# ❌ 사용 금지 - Spring Boot 4.x에서 동작하지 않음
spring:
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC
```

> **원인**: Spring Boot 4.x의 `JacksonProperties`가 `tools.jackson`을 사용하는데
> yml의 `write-dates-as-timestamps` 키를 `SerializationFeature` enum으로 변환하지 못함.
> `No enum constant tools.jackson.databind.SerializationFeature.write-dates-as-timestamps` 에러 발생.

### ⚠️ 주의: Jackson2ObjectMapperBuilderCustomizer 사용 금지

Spring Boot 4.x에서는 아래 클래스가 **패키지 변경**으로 컴파일 에러 발생합니다.

```java
// ❌ Spring Boot 3.x 방식 - 4.x에서 컴파일 에러
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
```

Spring Boot 4.x의 대응 인터페이스는 `JsonMapperBuilderCustomizer`이지만,
**Jackson 3.x 기본값이 이미 ISO 8601이므로 별도 설정이 불필요합니다.**

### 올바른 시간 처리 방법

`LocalDateTime`을 UTC 기준으로 생성할 때는 명시적으로 `ZoneOffset.UTC`를 사용합니다.

```java
import java.time.LocalDateTime;
import java.time.ZoneOffset;

// ✅ UTC 현재 시간
LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
```

### WebSocket 응답에서 createdAt 처리

DB INSERT 후 MyBatis가 `createdAt`을 반환하지 못하는 경우 null이 될 수 있습니다.
WebSocket 응답 객체 생성 시 반드시 폴백 처리를 합니다.

```java
// ✅ createdAt null 폴백 처리
response.setCreatedAt(
    savedMessage.getCreatedAt() != null
        ? savedMessage.getCreatedAt()
        : LocalDateTime.now(ZoneOffset.UTC)
);
```

### MyBatis INSERT 후 createdAt 반환

`useGeneratedKeys`로 id만 반환되고 `created_at`은 반환되지 않을 수 있습니다.
DB 기본값(`DEFAULT NOW()`)에 의존하는 경우 INSERT 후 별도 SELECT가 필요합니다.

```xml
<!-- ✅ id만 반환 (created_at은 DB 기본값) -->
<insert id="insert" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO work_status_chat_messages (user_id, message, is_deleted)
    VALUES (#{userId}, #{message}, false)
</insert>
```

---

## 프론트엔드 (Next.js / React)

### 기본 원칙

- 서버에서 받은 시간은 **항상 UTC로 간주**
- 화면 표시는 **사용자 로컬 시간 기준** (`date-fns` 사용)
- `Z` suffix 없는 문자열은 반드시 `+ "Z"` 처리

### 시간 파싱 유틸 함수

```typescript
// ✅ UTC 안전 파싱
const toUtcDate = (dateStr: string): Date => {
  if (!dateStr) return new Date();
  if (dateStr.endsWith("Z") || dateStr.includes("+")) return new Date(dateStr);
  return new Date(dateStr + "Z"); // Z 없으면 UTC로 강제
};
```

### date-fns 상대 시간 표시

```typescript
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// ✅ 올바른 사용법
const timeStr = formatDistanceToNow(toUtcDate(message.createdAt), {
  addSuffix: true,
  locale: ko,
});
// 결과: "3분 전", "방금 전", "1시간 전" 등
```

### ❌ 잘못된 파싱 예시

```typescript
// ❌ Z 없는 LocalDateTime 문자열을 그대로 파싱하면 로컬 시간으로 해석
new Date("2025-03-30T09:00:00")   // 로컬(KST) → UTC와 9시간 차이 발생

// ✅ 올바른 처리
new Date("2025-03-30T09:00:00Z")  // UTC 명시 → 정확
new Date("2025-03-30T09:00:00" + "Z")  // 폴백 처리
```

### WorkStatusPage getRelativeTime 함수

업무 현황 페이지의 로그 시간 표시에도 동일하게 적용됩니다.

```typescript
function getRelativeTime(isoString: string): string {
  const now = Date.now();
  const utcString =
    isoString.endsWith("Z") || isoString.includes("+")
      ? isoString
      : isoString + "Z";  // ← 반드시 Z 추가
  const then = new Date(utcString).getTime();
  // ...
}
```

---

## 트러블슈팅 이력

| 증상 | 원인 | 해결 |
|------|------|------|
| 채팅 시간이 "약 9시간 후"로 표시 | `LocalDateTime` Z 없이 직렬화 → 프론트에서 로컬 시간으로 해석 | 프론트 파싱 시 `+ "Z"` 폴백 처리 |
| 서버 기동 실패 (`No enum constant`) | `application.yml` jackson 설정이 Spring Boot 4.x와 호환 안 됨 | yml jackson 설정 제거 (Jackson 3.x 기본값 사용) |
| 서버 기동 실패 (컴파일 에러) | `Jackson2ObjectMapperBuilderCustomizer` Spring Boot 4.x에서 패키지 변경 | `JacksonConfig.java` 제거 (별도 설정 불필요) |
| 채팅 메시지 발신자 "?" 표시 | WebSocket 응답에 `username` 필드 없고 `senderName`만 존재 | 프론트에서 `username ?? senderName ?? "알 수 없음"` 폴백 |
| `createdAt` null로 수신 | MyBatis INSERT 후 DB 기본값 미반환 | WebSocket 응답 생성 시 `LocalDateTime.now(ZoneOffset.UTC)` 폴백 |

---

## 핵심 요약

| 항목 | 결론 |
|------|------|
| Jackson 3.x 날짜 포맷 | 기본값이 ISO 8601, 별도 설정 불필요 |
| `application.yml` jackson 설정 | Spring Boot 4.x에서 사용 금지 |
| `Jackson2ObjectMapperBuilderCustomizer` | Spring Boot 4.x에서 사용 금지 |
| 서버 시간 기준 | `LocalDateTime.now(ZoneOffset.UTC)` |
| 프론트 파싱 | `Z` 없는 문자열은 반드시 `+ "Z"` 추가 |