# `WikiPost.tags` Value Object 개선

> 상태: ✅ 리팩토링 완료
> 대상: `wiki/domain/WikiPost.java`, `wiki/application/WikiPostService.java`
> 변경 파일 수: 5개

---

## 문제 원인

`WikiPost` 도메인 객체의 `tags` 필드가 콤마 구분 `String`으로 저장되고 있었다.

```java
// 변경 전 — wiki/domain/WikiPost.java
private String tags; // "컨벤션,TypeScript,필독"
```

태그를 다룰 때마다 파싱/직렬화 로직이 Service에 흩어진다.

```java
// 변경 전 — WikiPostService.java
String tags = request.getTags() != null
    ? String.join(",", request.getTags())
    : "";
```

---

## 왜 문제인가

### 1. 태그 개념이 원시 타입에 묻힌다

`String tags = "컨벤션,TypeScript,필독"` 을 봤을 때
이게 단순 문자열인지, 콤마 구분 목록인지 코드만 봐서 알 수 없다.

### 2. 파싱/직렬화 로직이 Service에 흩어진다

```java
// Service에 태그 변환 로직이 박혀있음
String tags = String.join(",", request.getTags());
```

태그를 다루는 모든 곳에서 이 변환을 직접 해야 한다.

### 3. 유효성 검사를 할 곳이 없다

빈 태그 제거, 중복 제거, 최대 개수 제한 등을
도메인 레벨에서 보장할 방법이 없다.

---

## 개선 내용

### Tags Value Object 도입

```java
// wiki/domain/Tags.java
public class Tags {
    private final List<String> values;

    private Tags(List<String> values) {
        this.values = values.stream()
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .toList();
    }

    // CSV 문자열에서 생성 (DB 조회용)
    public static Tags from(String csv) {
        if (csv == null || csv.isBlank()) return new Tags(List.of());
        return new Tags(Arrays.asList(csv.split(",")));
    }

    // List에서 생성 (Request DTO 입력용)
    public static Tags from(List<String> list) {
        return new Tags(list != null ? list : List.of());
    }

    public String toCsv() {
        return String.join(",", values);
    }

    public List<String> toList() {
        return Collections.unmodifiableList(values);
    }

    public boolean isEmpty() {
        return values.isEmpty();
    }
}
```

### WikiPost에서 Tags 사용

```java
// wiki/domain/WikiPost.java
private Tags tags;  // String → Tags

// create() / modify() 팩토리 메서드에서도 Tags.from()으로 생성
public static WikiPost create(..., String tags) {
    return WikiPost.builder()
            .tags(Tags.from(tags))
            ...
}
```

### Service에서 파싱 로직 제거

```java
// 변경 전
String tags = request.getTags() != null
    ? String.join(",", request.getTags())
    : "";

// 변경 후
String tags = Tags.from(request.getTags()).toCsv();
```

---

## 변경 파일 목록

| 파일 | 변경 유형 | 내용 |
|------|---------|------|
| `wiki/domain/Tags.java` | 신규 생성 | Tags Value Object |
| `wiki/domain/WikiPost.java` | 수정 | `String tags` → `Tags tags` |
| `wiki/application/WikiPostService.java` | 수정 | String 변환 로직 → `Tags.from()` |
| `wiki/presentation/dto/WikiPostSummary.java` | 수정 | `String tags` → `String tags` (getTags() → tags.toCsv()) |
| `wiki/presentation/dto/WikiPostDetail.java` | 수정 | 동일 |
| `mybatis/mapper/WikiPostMapper.xml` | 수정 | insert/update에서 `#{tags}` → `#{tags.toCsv}` 또는 TypeHandler 사용 |

---

## 완료 체크리스트

- [x] `Tags.java` Value Object 생성
- [x] `WikiPost.tags` 타입 변경
- [x] `WikiPostService` 파싱 로직 제거
- [x] 빌드 성공 확인 (`BUILD SUCCESSFUL`)

---

## 참고 — MyBatis에서 Value Object 다루기

MyBatis는 `#{tags}`를 처리할 때 `tags.toString()` 또는 TypeHandler를 사용한다.
이 프로젝트에서는 `toCsv()` 메서드를 사용해서 `#{tags.toCsv}` 형태로 XML에 전달하거나,
`WikiPost`에 `getTagsCsv()` 헬퍼 메서드를 두어 MyBatis가 자동으로 사용하도록 한다.