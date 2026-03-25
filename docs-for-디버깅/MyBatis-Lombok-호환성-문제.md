# MyBatis와 Lombok 호환성 문제

## 문제 발생

### 에러 메시지
```
org.apache.ibatis.executor.ExecutorException: Constructor auto-mapping of 'com.mapo.palantier.menu.domain.Menu(...)' failed.
The constructor takes '12' arguments, but there are only '11' columns in the result set.
```

### 원인
- Lombok의 `@Builder`만 사용한 경우 MyBatis가 생성자 기반 매핑을 시도
- `children` 필드가 DB 컬럼이 아닌데 생성자에 포함되어 있어서 컬럼 수 불일치 발생
- MyBatis는 기본 생성자나 setter를 통해 객체를 생성해야 함

## 해결 방법

### 1. Lombok 어노테이션 추가

```java
@Getter
@Builder
@NoArgsConstructor          // 추가: 기본 생성자
@AllArgsConstructor         // 추가: 모든 필드 생성자
public class Menu {
    private Long id;
    private String name;
    // ... 다른 필드들

    @Builder.Default        // 추가: 기본값 설정
    private List<Menu> children = null;
}
```

### 2. 핵심 어노테이션 설명

#### `@NoArgsConstructor`
- **목적**: 파라미터가 없는 기본 생성자 생성
- **MyBatis 필수**: MyBatis가 리플렉션으로 객체를 먼저 생성한 후 setter로 값을 주입
- **없으면**: `No default constructor found` 에러 발생

#### `@AllArgsConstructor`
- **목적**: 모든 필드를 파라미터로 받는 생성자 생성
- **Lombok @Builder와의 관계**: @Builder는 내부적으로 AllArgsConstructor를 사용
- **함께 사용 이유**: @NoArgsConstructor를 추가하면 AllArgsConstructor가 자동 생성되지 않아 @Builder가 깨짐

#### `@Builder.Default`
- **목적**: Builder 패턴 사용 시 필드의 기본값 지정
- **children 필드**: DB에 없는 필드이므로 null로 초기화
- **없으면**: Builder로 생성 시 NPE 발생 가능

## MyBatis ResultMap 설정

```xml
<resultMap id="MenuResultMap" type="com.mapo.palantier.menu.domain.Menu">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <!-- ... 다른 필드들 -->
    <!-- children 필드는 ResultMap에 포함하지 않음 (DB 컬럼 아님) -->
</resultMap>
```

## 베스트 프랙티스

### MyBatis + Lombok 엔티티 템플릿

```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class YourEntity {
    // DB 컬럼 매핑 필드
    private Long id;
    private String name;

    // DB에 없는 추가 필드는 @Builder.Default 사용
    @Builder.Default
    private List<ChildEntity> children = new ArrayList<>();
}
```

### 주의사항
1. **@Data 사용 지양**: @Setter가 포함되어 불변성 위반
2. **@Builder만 사용 금지**: 기본 생성자가 없어 MyBatis 매핑 실패
3. **DB 외 필드**: 반드시 `@Builder.Default`로 기본값 설정
4. **final 필드**: MyBatis는 final 필드를 setter로 설정할 수 없으므로 사용 불가

## 디버깅 팁

### 1. MyBatis 로그 활성화
```yaml
# application.yml
logging:
  level:
    org.mybatis: DEBUG
```

### 2. 컬럼 수 확인
```sql
-- 실제 DB 쿼리 실행하여 컬럼 수 확인
SELECT * FROM menus LIMIT 1;
```

### 3. 생성자 확인
```bash
# 컴파일된 클래스의 생성자 확인
javap -p target/classes/com/mapo/palantier/menu/domain/Menu.class
```

## 관련 이슈

### Flyway vs 직접 SQL 실행
- **초기 문제**: Flyway 자동 마이그레이션이 서버 재시작 전까지 실행 안 됨
- **해결책**: Docker psql로 직접 SQL 실행
```bash
docker exec palantier-postgres psql -U palantier_user -d palantier -c "CREATE TABLE ..."
```

### API 엔드포인트 중복 `/api` 문제
- **문제**: axios baseURL이 `/api`인데 API 경로도 `/api/menus`로 호출
- **결과**: `/api/api/menus` 요청 → 404 에러
- **해결**: API 경로에서 `/api` 제거 → `/menus`

## 참고 문서
- [MyBatis 공식 문서 - Type Handlers](https://mybatis.org/mybatis-3/configuration.html#typeHandlers)
- [Lombok 공식 문서 - @Builder](https://projectlombok.org/features/Builder)
