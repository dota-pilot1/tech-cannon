# 카테고리 테이블 분리 작업 및 MyBatis 매핑 에러 해결

## 문제 상황

권한 관리 페이지에서 카테고리를 별도로 추가하는 기능이 작동하지 않았습니다. 초기에는 `authority` 테이블에 `category` VARCHAR 컬럼으로 카테고리를 저장하고 있었으나, 이는 데이터베이스 정규화 관점에서 적절하지 않았습니다.

## 해결 방법 선택

두 가지 방법을 고려했습니다:
1. **임시 방편**: 프론트엔드에서만 카테고리 관리 (권장하지 않음)
2. **교과서적 구현**: Category 테이블 분리 및 FK 관계 설정 (선택됨)

최종적으로 데이터베이스 정규화를 통한 올바른 구현 방식을 선택했습니다.

## 작업 내용

### 1. 데이터베이스 스키마 변경

#### 1.1 Category 테이블 생성
```sql
CREATE TABLE IF NOT EXISTS category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 기존 카테고리 데이터 마이그레이션
```sql
-- 기존 authority 테이블에서 distinct한 카테고리 추출하여 category 테이블에 삽입
INSERT INTO category (name, description)
SELECT DISTINCT category, '기존 카테고리'
FROM authority
WHERE category IS NOT NULL
ON CONFLICT (name) DO NOTHING;
```
결과: 9개의 카테고리 마이그레이션 완료

#### 1.3 Authority 테이블 구조 변경
```sql
-- category_id 컬럼 추가
ALTER TABLE authority ADD COLUMN IF NOT EXISTS category_id BIGINT;

-- 기존 데이터의 category_id 채우기
UPDATE authority a
SET category_id = c.id
FROM category c
WHERE a.category = c.name;

-- category_id를 NOT NULL로 설정 및 FK 추가
ALTER TABLE authority ALTER COLUMN category_id SET NOT NULL;
ALTER TABLE authority ADD CONSTRAINT fk_authority_category
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE RESTRICT;

-- 기존 category 컬럼 삭제
ALTER TABLE authority DROP COLUMN category;
```
결과: 26개의 권한이 category_id로 업데이트됨

### 2. 백엔드 구현

#### 2.1 새로운 도메인 엔티티 생성

**Category.java**
```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
```

#### 2.2 Repository 계층

**CategoryRepository.java** - MyBatis Mapper 인터페이스
```java
@Mapper
public interface CategoryRepository {
    List<Category> findAll();
    Category findById(@Param("id") Long id);
    Category findByName(@Param("name") String name);
    void create(Category category);
    void update(Category category);
    void delete(@Param("id") Long id);
}
```

**CategoryMapper.xml** - SQL 쿼리 정의
```xml
<mapper namespace="com.mapo.palantier.authority.domain.CategoryRepository">
    <select id="findAll" resultType="com.mapo.palantier.authority.domain.Category">
        SELECT id, name, description, created_at
        FROM category
        ORDER BY created_at DESC
    </select>

    <insert id="create" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO category (name, description, created_at)
        VALUES (#{name}, #{description}, NOW())
    </insert>

    <!-- 기타 CRUD 쿼리들... -->
</mapper>
```

#### 2.3 서비스 계층

**CategoryService.java**
```java
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public Category createCategory(String name, String description) {
        // 중복 체크
        Category existing = categoryRepository.findByName(name);
        if (existing != null) {
            throw new IllegalArgumentException("Category with name '" + name + "' already exists");
        }

        Category category = Category.builder()
                .name(name)
                .description(description)
                .build();
        categoryRepository.create(category);
        return category;
    }

    // 기타 메서드들...
}
```

#### 2.4 컨트롤러 계층

**CategoryController.java**
```java
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CreateCategoryRequest request) {
        Category category = categoryService.createCategory(request.getName(), request.getDescription());
        return ResponseEntity.ok(category);
    }

    // 기타 엔드포인트들...
}
```

#### 2.5 Authority 도메인 수정

**Authority.java**
```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Authority {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;      // String category에서 변경
    private Category category;    // JOIN 결과를 위한 필드 추가
    private LocalDateTime createdAt;
}
```

#### 2.6 AuthorityMapper.xml 수정

**핵심 변경사항**: ResultMap에 Category 객체 매핑 추가
```xml
<resultMap id="authorityWithCategory" type="com.mapo.palantier.authority.domain.Authority">
    <id property="id" column="id"/>
    <result property="name" column="name"/>
    <result property="description" column="description"/>
    <result property="categoryId" column="category_id"/>
    <result property="createdAt" column="created_at"/>
    <!-- Category 객체 매핑 -->
    <association property="category" javaType="com.mapo.palantier.authority.domain.Category">
        <id property="id" column="category_id"/>
        <result property="name" column="category_name"/>
        <result property="description" column="category_description"/>
        <result property="createdAt" column="category_created_at"/>
    </association>
</resultMap>

<!-- 모든 SELECT 쿼리에 category JOIN 추가 -->
<select id="findAll" resultMap="authorityWithCategory">
    SELECT
        a.id, a.name, a.description, a.category_id, a.created_at,
        c.name as category_name,
        c.description as category_description,
        c.created_at as category_created_at
    FROM authority a
    INNER JOIN category c ON a.category_id = c.id
    ORDER BY c.name, a.name
</select>
```

#### 2.7 DTO 수정

**CreateAuthorityRequest.java**
```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuthorityRequest {
    private String name;
    private String description;
    private Long categoryId;  // String category에서 변경
}
```

**UserAuthorityResponse.java** - 컴파일 에러 수정
```java
public static UserAuthorityResponse from(UserAuthority userAuthority) {
    return UserAuthorityResponse.builder()
            // ...
            .authorityCategory(userAuthority.getAuthority().getCategory().getName())  // .getName() 추가
            // ...
            .build();
}
```

### 3. 가장 심각했던 에러: UserAuthorityMapper.xml

#### 3.1 에러 내용
```
java.lang.IllegalStateException: No typehandler found for property category
Error parsing Mapper XML. The XML location is 'UserAuthorityMapper.xml'
```

#### 3.2 원인 분석

UserAuthorityMapper.xml이 다음과 같은 문제점이 있었습니다:

1. **잘못된 매핑**:
```xml
<!-- 문제가 있는 코드 -->
<association property="authority" javaType="com.mapo.palantier.authority.domain.Authority">
    <id property="id" column="authority_id"/>
    <result property="name" column="authority_name"/>
    <result property="description" column="authority_description"/>
    <result property="category" column="authority_category"/>  <!-- 문제! -->
</association>
```

2. **존재하지 않는 컬럼 참조**:
```sql
-- 문제가 있는 SQL
SELECT
    ...
    a.category as authority_category  -- 이 컬럼은 더 이상 존재하지 않음
FROM user_authority ua
INNER JOIN authority a ON ua.authority_id = a.id
```

#### 3.3 해결 방법

**수정된 ResultMap**:
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
        <!-- Category 객체에 대한 nested association 추가 -->
        <association property="category" javaType="com.mapo.palantier.authority.domain.Category">
            <id property="id" column="authority_category_id"/>
            <result property="name" column="authority_category_name"/>
            <result property="description" column="authority_category_description"/>
        </association>
    </association>
</resultMap>
```

**수정된 SELECT 쿼리**:
```xml
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
    INNER JOIN category c ON a.category_id = c.id  -- category 테이블과 JOIN 추가
    WHERE ua.user_id = #{userId}
    ORDER BY ua.granted_at DESC
</select>
```

### 4. 프론트엔드 구현

#### 4.1 타입 정의

**category.ts**
```typescript
export interface Category {
  id: number
  name: string
  description: string
  createdAt: string
}

export interface CreateCategoryRequest {
  name: string
  description: string
}
```

**authority.ts** 수정
```typescript
import type { Category } from './category'

export interface Authority {
  id: number
  name: string
  description: string
  categoryId: number     // category: string에서 변경
  category: Category     // 추가
  createdAt: string
}

export interface CreateAuthorityRequest {
  name: string
  description: string
  categoryId: number     // category: string에서 변경
}
```

#### 4.2 API 클라이언트

**categoryApi.ts**
```typescript
import { apiClient } from '@/shared/api/client'
import type { Category, CreateCategoryRequest } from '@/types/category'

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>('/api/categories')
    return response.data
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await apiClient.post<Category>('/api/categories', data)
    return response.data
  },

  // update, delete 메서드들...
}
```

#### 4.3 UI 컴포넌트 수정

**AuthoritiesPage.tsx** - 주요 변경사항

1. 카테고리 데이터 조회:
```typescript
const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
  queryKey: ['categories'],
  queryFn: () => categoryApi.getAll(),
})
```

2. 카테고리 생성 mutation:
```typescript
const createCategoryMutation = useMutation({
  mutationFn: (data: CreateCategoryRequest) => categoryApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    toast.success('카테고리가 생성되었습니다')
    handleCloseCategoryDialog()
  },
})
```

3. 카테고리 선택 드롭다운:
```tsx
<Select
  value={formData.categoryId.toString()}
  onValueChange={(value) =>
    setFormData({ ...formData, categoryId: parseInt(value) })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="카테고리를 선택하세요" />
  </SelectTrigger>
  <SelectContent>
    {categories.map((cat) => (
      <SelectItem key={cat.id} value={cat.id.toString()}>
        {cat.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

4. 별도의 카테고리 추가 다이얼로그 구현

## 핵심 교훈

### 1. MyBatis ResultMap의 중요성
- 객체 간 관계를 정확히 매핑해야 함
- `<association>`을 사용하여 nested 객체를 매핑
- JOIN 쿼리의 컬럼 alias와 ResultMap의 column 속성이 정확히 일치해야 함

### 2. 데이터베이스 스키마 변경 시 영향 범위
- 스키마 변경 시 관련된 모든 Mapper XML 파일을 확인해야 함
- 단순히 Authority를 직접 사용하는 코드뿐만 아니라, Authority를 포함하는 다른 엔티티(UserAuthority 등)의 매핑도 확인 필요

### 3. 에러 메시지 분석
```
No typehandler found for property category
```
이 에러는 MyBatis가 `Authority.category` 속성을 어떻게 매핑할지 모르겠다는 의미입니다.
- Category 객체는 primitive type이 아니므로 단순한 `<result>` 태그로 매핑 불가
- `<association>` 태그를 사용하여 nested 객체로 매핑해야 함

### 4. 정규화의 중요성
초기에는 간단해 보였던 String category 컬럼이 다음과 같은 문제를 야기했습니다:
- 카테고리 중복 관리 어려움
- 카테고리 이름 변경 시 모든 권한 데이터 업데이트 필요
- 카테고리에 대한 추가 메타데이터 저장 불가

Category 테이블 분리로 해결:
- 카테고리 독립적 관리 가능
- FK 제약조건으로 데이터 무결성 보장
- 카테고리별 설명 등 추가 정보 저장 가능

## 수정된 파일 목록

### Backend
1. `Category.java` - 새 도메인 엔티티
2. `CategoryRepository.java` - 새 Mapper 인터페이스
3. `CategoryMapper.xml` - 새 SQL 매퍼
4. `CategoryService.java` - 새 서비스
5. `CategoryController.java` - 새 컨트롤러
6. `CreateCategoryRequest.java` - 새 DTO
7. `Authority.java` - categoryId 및 category 필드 수정
8. `AuthorityMapper.xml` - ResultMap 및 모든 쿼리 수정
9. `AuthorityService.java` - 파라미터 타입 변경
10. `CreateAuthorityRequest.java` - categoryId 타입 변경
11. `UserAuthorityResponse.java` - getCategory().getName() 호출로 수정
12. `UserAuthorityMapper.xml` - ⭐ **가장 중요** ResultMap에 Category association 추가, 모든 SELECT 쿼리에 category JOIN 추가

### Frontend
1. `category.ts` - 새 타입 정의
2. `categoryApi.ts` - 새 API 클라이언트
3. `authority.ts` - Authority 인터페이스 수정
4. `AuthoritiesPage.tsx` - UI 전면 수정
5. `client.ts` - apiClient export 추가

### Database
1. category 테이블 생성
2. authority 테이블 구조 변경
3. 데이터 마이그레이션

## 결과

- ✅ 카테고리를 독립적으로 관리 가능
- ✅ 권한 생성 시 카테고리 드롭다운에서 선택
- ✅ 데이터베이스 정규화 완료
- ✅ MyBatis 매핑 에러 해결
- ✅ 프론트엔드 UI 분리 완료

## 난이도 평가

**원래는 어려운 문제가 아니었습니다.** 하지만 데이터베이스 정규화를 진행하면서 여러 파일을 동시에 수정해야 했고, 특히 MyBatis XML 매퍼 파일들의 의존성을 모두 추적하고 수정하는 과정에서 복잡도가 증가했습니다.

핵심은 **스키마 변경 시 영향을 받는 모든 매퍼 파일을 빠짐없이 찾아 수정하는 것**이었습니다.
