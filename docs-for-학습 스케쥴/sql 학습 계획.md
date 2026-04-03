# SQL 기본 학습 계획 (20단계 커리큘럼)

본 가이드는 **PostgreSQL**과 **MyBatis**를 사용하는 Palantier 프로젝트의 환경에 맞춰, 신입 개발자나 SQL 입문자가 단계적으로 학습할 수 있는 20가지 핵심 주제를 정리한 계획표입니다.

---

## 📅 학습 로드맵: 기초부터 실전까지

### 🟢 1단계: 데이터 조회 기초 (SELECT & FILTER)
1.  **SELECT & FROM**: 특정 컬럼 선택 및 전체 데이터 조회 (`SELECT *`)
2.  **컬럼 별칭 (Alias)**: `AS` 키워드를 사용한 컬럼 명칭 변경 및 연산식 적용
3.  **WHERE 절 기초**: 비교 연산자(`=`, `<>`, `>`, `<`)를 활용한 조건 필터링
4.  **논리 연산자**: `AND`, `OR`, `NOT`을 결합한 복합 조건문 작성
5.  **범위 및 목록 조회**: `BETWEEN` 연산자와 `IN` 연산자 활용하기
6.  **패턴 매칭 (LIKE)**: 와일드카드(`%`, `_`)와 PostgreSQL의 대소문자 무시 검색 `ILIKE`
7.  **NULL 처리**: `IS NULL`, `IS NOT NULL` 및 `COALESCE` 함수를 통한 기본값 설정
8.  **데이터 정렬 (ORDER BY)**: 오름차순(`ASC`), 내림차순(`DESC`) 및 다중 컬럼 정렬
9.  **결과 제한**: `LIMIT`와 `OFFSET`을 활용한 데이터 수 제한 및 페이징 기초

### 🟡 2단계: 데이터 집계 및 요약 (AGGREGATE)
10. **중복 제거 (DISTINCT)**: 유니크한 값들만 추출하기
11. **집계 함수 (Aggregate)**: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` 활용
12. **그룹화 (GROUP BY)**: 특정 컬럼 기준 데이터 그룹핑 및 집계 연산
13. **그룹 조건 (HAVING)**: 요약된 데이터 그룹에 대한 필터링 (WHERE와 HAVING의 차이 이해)

### 🟠 3단계: 테이블 결합 및 심화 (JOIN & SUBQUERY)
14. **INNER JOIN**: 두 테이블 간의 교집합 데이터 결합
15. **LEFT/RIGHT OUTER JOIN**: 기준 테이블의 모든 데이터와 매칭되는 상대 테이블 데이터 결합
16. **FULL OUTER JOIN**: 양쪽 테이블의 모든 데이터 결합 및 매칭 여부 확인
17. **서브쿼리 (Subquery)**: SELECT, FROM, WHERE 절 내부에 중첩된 쿼리 활용
18. **CTE (Common Table Expressions)**: `WITH` 문을 사용하여 가독성 높은 임시 결과 집합 정의

### 🔴 4단계: 집합 연산 및 데이터 관리 (SET & DML)
19. **집합 연산자**: `UNION(ALL)`, `INTERSECT`, `EXCEPT`를 통한 결과 집합 합체 및 비교
20. **데이터 조작 (DML)**: `INSERT`, `UPDATE`, `DELETE` 문의 구조와 트랜잭션 관리 개념

---

## 💡 학습 팁
*   **직접 실행**: 이론만 보지 말고 Docker로 실행 중인 `palantier` DB에 접속하여 `menus`나 `users` 테이블을 대상으로 직접 쿼리해 보세요.
*   **MyBatis 연동**: 각 주제가 MyBatis의 XML 파일 내에서 어떻게 동적 쿼리(`<if>`, `<where>`)로 변환되는지 고민해 보세요.
*   **실제 데이터**: 프로젝트에 이미 들어가 있는 실데이터를 기반으로 "가장 활발한 사용자 순 정렬" 같은 미션을 정해 연습하는 것이 효과적입니다.

---
> [!TIP]
> **PostgreSQL 접속 명령어**
> `docker exec -it palantier-postgres psql -U palantier_user -d palantier`
