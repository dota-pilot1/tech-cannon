# `@Setter` / `@Data` 제거 → 불변성 강화란?

> 이 문서는 현재 프로젝트의 **실제 코드**를 예시로 사용합니다.

---

## 핵심 한 줄 요약

> **도메인 객체의 상태(값)는 아무 곳에서나 바꿀 수 없어야 한다.**
> 바꾸고 싶으면 **정해진 메서드를 통해서만** 바꿔야 한다.

---

## 1. `@Data` 가 뭔데?

Lombok의 `@Data`는 아래 어노테이션을 한 번에 붙여주는 단축키입니다.

```java
@Getter       // 모든 필드에 getXxx() 생성
@Setter       // 모든 필드에 setXxx() 생성  ← 이게 문제
@ToString
@EqualsAndHashCode
@RequiredArgsConstructor
```

**`@Setter`가 생기면 어떻게 되냐?**
→ 프로젝트 어디서든 객체 내부 값을 마음대로 바꿀 수 있게 됩니다.

---

## 2. 현재 프로젝트의 문제 상황 (AS-IS)

### `Organization.java` — 현재 코드

```java
@Data           // ← @Setter 포함!
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {
    private Long id;
    private String name;
    private String code;
    private String orgType;  // COMPANY, DEPARTMENT, TEAM
    private Boolean isActive;
    ...
}
```

`@Data`가 붙어있으면 **어디서든 이렇게 할 수 있습니다:**

```java
// Service 안에서
organization.setIsActive(false);      // ← OK

// Controller 안에서도
organization.setOrgType("WHATEVER");  // ← OK

// 심지어 이런 것도 막을 수 없음
organization.setId(9999L);            // ← OK, 하지만 위험!
```

### 문제가 뭔가요?

```java
// OrganizationService.java
public void processOrg(Organization org) {
    // 이 메서드가 org를 건드렸을까?
    // 안 건드렸을까?
    // 코드를 다 읽어보지 않으면 알 수 없음
    someOtherMethod(org);
    anotherMethod(org);
    yetAnotherMethod(org);
    
    // org.getName() 이 값이 처음과 같을까? 모름!
}
```

→ **객체가 언제, 어디서, 누구에 의해 바뀌었는지 추적이 불가능합니다.**

---

## 3. 개선 후 (TO-BE)

### `TaskFolder.java` — 리팩토링 후 코드 (실제 적용됨)

```java
@Getter          // getter만 있음
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskFolder {
    private Long id;
    private Long parentId;
    private String name;
    private Integer sortOrder;
    private Long createdBy;
    private LocalDateTime createdAt;

    // 상태를 바꾸고 싶으면 반드시 이 메서드를 써야 함
    public TaskFolder withUpdated(String name, Long parentId, Integer sortOrder) {
        return TaskFolder.builder()
                .id(this.id)
                .parentId(parentId != null ? parentId : this.parentId)
                .name(name)
                .sortOrder(sortOrder != null ? sortOrder : this.sortOrder)
                .createdBy(this.createdBy)
                .createdAt(this.createdAt)
                .build();
    }
}
```

이제 이렇게 하면 **컴파일 에러**가 납니다:

```java
folder.setName("새이름");     // ❌ 컴파일 에러! setName() 자체가 없음
folder.setParentId(123L);    // ❌ 컴파일 에러!
```

수정하려면 반드시 이렇게 해야 합니다:

```java
// ✅ 유일한 방법 — 새 인스턴스를 명시적으로 만들어야 함
TaskFolder updated = folder.withUpdated("새이름", 123L, 1);
taskFolderRepository.update(updated);
```

---

## 4. 실제 차이 — `TaskFolderService` 비교

### 변경 전 (Setter 사용)

```java
// TaskFolderService.java (구버전)
@Transactional
public void updateFolder(Long id, TaskFolderDto dto) {
    TaskFolder folder = getFolderById(id);
    
    folder.setName(dto.getName());              // 내부 값을 직접 변경
    if (dto.getParentId() != null) {
        folder.setParentId(dto.getParentId());  // 직접 변경
    }
    if (dto.getSortOrder() != null) {
        folder.setSortOrder(dto.getSortOrder()); // 직접 변경
    }
    
    taskFolderMapper.update(folder); // mapper를 직접 호출
}
```

→ `folder` 객체가 위에서 아래로 내려오면서 중간에 몇 번 바뀌었는지 불명확합니다.

### 변경 후 (불변성 적용)

```java
// TaskFolderService.java (현재 버전)
@Transactional
public void updateFolder(Long id, TaskFolderRequest request) {
    TaskFolder existing = getFolderById(id);  // 기존 객체 (변하지 않음)
    
    TaskFolder updated = existing.withUpdated( // 새 객체 명시적 생성
            request.getName(),
            request.getParentId(),
            request.getSortOrder()
    );
    
    taskFolderRepository.update(updated);     // Repository 인터페이스 사용
}
```

→ `existing`은 절대 변하지 않고, 변경된 결과는 `updated`라는 **새 객체**입니다.
→ 코드만 읽어도 "기존 것은 그대로, 새것을 만들어서 저장"이라는 의도가 바로 보입니다.

---

## 5. 왜 이게 DDD에서 중요한가?

DDD에서 도메인 객체는 **비즈니스 규칙의 수호자**입니다.

```java
// 나쁜 예 — 비즈니스 규칙이 Service에 흩어짐
public void deactivateOrg(Organization org) {
    org.setIsActive(false);           // Service가 직접 건드림
    org.setUpdatedAt(LocalDateTime.now()); // 이것도 Service가
    org.setUpdatedBy(currentUserId);  // 이것도 Service가
}

// 좋은 예 — 비즈니스 규칙이 도메인 객체 안에 있음
public void deactivateOrg(Organization org) {
    Organization deactivated = org.deactivate(currentUserId); // 도메인이 스스로 처리
    orgRepository.save(deactivated);
}

// Organization.java 도메인 안에서
public Organization deactivate(Long updatedBy) {
    return Organization.builder()
            .id(this.id)
            .name(this.name)
            .isActive(false)          // 비즈니스 규칙이 여기에
            .updatedAt(LocalDateTime.now())
            .updatedBy(updatedBy)
            .build();
}
```

→ "조직을 비활성화하면 updatedAt도 같이 찍힌다"는 **규칙이 도메인 안에 캡슐화**됩니다.
→ Service에서 `setIsActive(false)` 하고 `setUpdatedAt()` 을 깜빡하는 실수가 원천 차단됩니다.

---

## 6. 한눈에 보는 정리

| | `@Data` / `@Setter` 사용 | `@Getter` + 도메인 메서드 |
|---|---|---|
| 값 변경 위치 | 어디서든 가능 | 도메인 메서드 안에서만 |
| 버그 발생 | 어디서 바뀌었는지 추적 어려움 | 변경 지점이 명확함 |
| 비즈니스 규칙 | Service에 흩어짐 | 도메인 객체 안에 모임 |
| 코드 읽기 | 전체 흐름을 다 봐야 이해 | 메서드 이름만 봐도 의도 파악 |
| DDD 관점 | Anemic Domain Model (빈혈 모델) | Rich Domain Model (풍부한 모델) |

---

## 7. 실무 적용 우선순위

현재 프로젝트에서 `@Data` / `@Setter` 가 붙어있는 도메인 객체들:

| 파일 | 문제 | 권장 변경 |
|------|------|-----------|
| `Organization.java` | `@Data` | `@Getter` + `deactivate()`, `activate()` 메서드 |
| `MeetingChannel.java` | 수동 setter 전체 | `@Getter` + `@Builder` + 팩토리 메서드 |

> `task`, `wiki` 도메인은 이미 이번 리팩토링에서 `@Getter + @Builder + 팩토리 메서드` 로 개선 완료되었습니다. ✅