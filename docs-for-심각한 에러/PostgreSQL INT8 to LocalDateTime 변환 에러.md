# PostgreSQL INT8 to LocalDateTime 변환 에러

## 에러 메시지

```
Caused by: org.postgresql.util.PSQLException: Cannot convert the column of type INT8 to requested type java.time.LocalDateTime.
```

## 문제 상황

카테고리 테이블 분리 작업 후, MyBatis ResultMap에서 Category 객체의 `id`와 `createdAt` 필드를 매핑할 때 에러가 발생했습니다.

## 원인 분석

### 1. 잘못된 id 매핑

**AuthorityMapper.xml**과 **UserAuthorityMapper.xml**에서 Category association의 `id` 필드를 잘못 매핑했습니다:

```xml
<!-- 문제가 있는 코드 -->
<association property="category" javaType="com.mapo.palantier.authority.domain.Category">
    <id property="id" column="category_id"/>  <!-- 잘못됨! -->
    <result property="name" column="category_name"/>
    <result property="description" column="category_description"/>
    <result property="createdAt" column="category_created_at"/>
</association>
```

**문제점**:
- `category_id`는 `authority` 테이블의 FK 컬럼
- 실제로는 `authority.category_id`의 값 (Long 타입)
- Category 객체의 PK `id`가 아님
- MyBatis는 `category_id`를 Category의 id로 사용하려고 했지만, 실제 category 테이블의 PK 값을 선택하지 않음

### 2. createdAt 컬럼 미선택 또는 잘못된 매핑

**AuthorityMapper.xml**에서는 `c.created_at as category_created_at`를 선택했지만, **UserAuthorityMapper.xml**에서는 선택하지 않았습니다.

그러나 근본적인 문제는 Category의 `id`가 잘못 매핑되어, MyBatis가 `authority.category_id` 값(BIGINT/INT8)을 Category의 `created_at`(LocalDateTime) 필드로 매핑하려고 시도한 것입니다.

## 해결 방법

Category 객체를 간단하게 만들기 위해 `id`와 `createdAt` 매핑을 제거하고, 필수 정보인 `name`과 `description`만 매핑했습니다.

### 수정된 AuthorityMapper.xml

```xml
<resultMap id="authorityWithCategory" type="com.mapo.palantier.authority.domain.Authority">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <result property="description" column="description"/>
    <result property="categoryId" column="category_id"/>
    <result property="createdAt" column="created_at"/>
    <association property="category" javaType="com.mapo.palantier.authority.domain.Category">
        <!-- id와 createdAt 매핑 제거 -->
        <result property="name" column="category_name"/>
        <result property="description" column="category_description"/>
    </association>
</resultMap>

<!-- 모든 SELECT 쿼리에서 category_created_at 제거 -->
<select id="findAll" resultMap="authorityWithCategory">
    SELECT
        a.id,
        a.name,
        a.description,
        a.category_id,
        a.created_at,
        c.name as category_name,
        c.description as category_description
        -- c.created_at as category_created_at 제거
    FROM authority a
    INNER JOIN category c ON a.category_id = c.id
    ORDER BY c.name, a.name
</select>
```

### 수정된 UserAuthorityMapper.xml

```xml
<resultMap id="UserAuthorityResultMap" type="com.mapo.palantier.authority.domain.UserAuthority">
    <result property="userId" column="user_id"/>
    <result property="authorityId" column="authority_id"/>
    <result property="grantedAt" column="granted_at"/>
    <result property="grantedBy" column="granted_by"/>
    <result property="expiresAt" column="expires_at"/>
    <result property="notes" column="notes"/>
    <association property="authority" javaType="com.mapo.palantier.authority.domain.Authority">
        <id property="id" column="authority_id"/>
        <result property="name" column="authority_name"/>
        <result property="description" column="authority_description"/>
        <result property="categoryId" column="authority_category_id"/>
        <association property="category" javaType="com.mapo.palantier.authority.domain.Category">
            <!-- id와 createdAt 매핑 제거 -->
            <result property="name" column="authority_category_name"/>
            <result property="description" column="authority_category_description"/>
        </association>
    </association>
</resultMap>

<!-- SELECT 쿼리는 이미 category_created_at을 선택하지 않았음 -->
<select id="findByUserId" resultMap="UserAuthorityResultMap">
    SELECT
        ua.user_id,
        ua.authority_id,
        ua.granted_at,
        ua.granted_by,
        ua.expires_at,
        ua.notes,
        a.name as authority_name,
        a.description as authority_description,
        a.category_id as authority_category_id,
        c.name as authority_category_name,
        c.description as authority_category_description
    FROM user_authority ua
    INNER JOIN authority a ON ua.authority_id = a.id
    INNER JOIN category c ON a.category_id = c.id
    WHERE ua.user_id = #{userId}
    ORDER BY ua.granted_at DESC
</select>
```

## 대안적 해결 방법 (완전한 매핑)

만약 Category의 모든 필드를 제대로 매핑하고 싶다면:

```xml
<association property="category" javaType="com.mapo.palantier.authority.domain.Category">
    <id property="id" column="category_real_id"/>  <!-- 실제 category.id 선택 -->
    <result property="name" column="category_name"/>
    <result property="description" column="category_description"/>
    <result property="createdAt" column="category_created_at"/>
</association>
```

그리고 SELECT 쿼리에서:

```sql
SELECT
    a.id,
    a.name,
    a.description,
    a.category_id,
    a.created_at,
    c.id as category_real_id,      -- category 테이블의 실제 PK
    c.name as category_name,
    c.description as category_description,
    c.created_at as category_created_at
FROM authority a
INNER JOIN category c ON a.category_id = c.id
```

하지만 현재 구현에서는 Category의 `id`와 `createdAt`이 필요하지 않으므로, 간단하게 제거하는 방식을 선택했습니다.

## 핵심 교훈

### 1. MyBatis ResultMap의 컬럼 매핑 이해

- `<id>` 또는 `<result>`의 `column` 속성은 SELECT 쿼리에서 선택한 **컬럼 alias**와 정확히 일치해야 함
- FK 컬럼 값을 nested 객체의 PK로 매핑하면 안 됨
- 예: `authority.category_id`(FK)를 `Category.id`(PK)로 매핑하면 안 됨

### 2. 타입 변환 에러의 근본 원인

에러 메시지만 보면 "INT8을 LocalDateTime으로 변환할 수 없다"고 나오지만, 실제 문제는:
1. MyBatis가 잘못된 컬럼을 잘못된 필드에 매핑하려고 시도
2. `category_id`(BIGINT) 값을 `Category.id`로 사용
3. ResultMap에서 다음 필드인 `createdAt`를 찾음
4. 하지만 다음에 읽을 컬럼이 없거나, 잘못된 컬럼을 읽게 됨
5. 결과적으로 BIGINT 값을 LocalDateTime으로 변환하려는 상황 발생

### 3. 최소한의 매핑 원칙

- 실제로 사용하는 필드만 매핑하는 것이 더 안전함
- 현재 구현에서는 Category의 `name`과 `description`만 필요하므로 이것만 매핑
- 필요 없는 필드를 매핑하려다가 불필요한 복잡성과 에러를 초래할 수 있음

### 4. MyBatis 디버깅 팁

이런 류의 에러가 발생하면 확인할 사항:
1. SELECT 쿼리에서 선택한 모든 컬럼 확인
2. ResultMap의 모든 컬럼 매핑 확인
3. 각 컬럼 alias가 ResultMap의 `column` 속성과 정확히 일치하는지 확인
4. FK 값을 nested 객체의 PK로 잘못 매핑하지 않았는지 확인
5. 컬럼 순서와 ResultMap의 필드 순서가 논리적으로 일치하는지 확인

## 수정된 파일

1. **AuthorityMapper.xml**
   - ResultMap의 Category association에서 id와 createdAt 제거
   - 모든 SELECT 쿼리에서 `c.created_at as category_created_at` 제거

2. **UserAuthorityMapper.xml**
   - ResultMap의 Category association에서 id 제거

3. **Category.java** ⭐ 핵심 수정
   - `createdAt` 필드 제거
   - `@NoArgsConstructor`와 `@AllArgsConstructor` 추가

4. **CategoryMapper.xml**
   - 모든 SELECT 쿼리에서 `created_at` 컬럼 제거

## 추가 수정 사항 - Category 도메인 클래스

초기 수정 후에도 에러가 계속 발생했습니다. 근본 원인은 **Category 클래스 자체**에 있었습니다.

### 문제
```java
@Getter
@Builder
public class Category {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;  // ❌ 이 필드가 문제!
}
```

**왜 문제였는가:**
1. MyBatis가 Category 객체를 생성할 때 `@NoArgsConstructor`가 없어서 기본 생성자를 사용할 수 없음
2. `createdAt` 필드가 클래스에 존재하지만 ResultMap에서 매핑되지 않음
3. MyBatis가 혼란스러워하며 잘못된 컬럼을 잘못된 필드에 매핑 시도
4. 결과적으로 `category_id`(BIGINT) 값을 `createdAt`(LocalDateTime) 필드로 매핑하려고 시도

### 해결책
```java
@Getter
@Builder
@NoArgsConstructor  // ✅ 추가
@AllArgsConstructor // ✅ 추가
public class Category {
    private Long id;
    private String name;
    private String description;
    // createdAt 제거 ✅
}
```

## 결과

- ✅ MyBatis 매핑 에러 완전 해결
- ✅ 백엔드 서버 정상 시작 가능
- ✅ Category 정보(name, description)는 정상적으로 조회됨
- ✅ Category 도메인 클래스 단순화 완료
