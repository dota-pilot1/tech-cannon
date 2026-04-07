# Backend (parantier-api) 규칙

> 상세 내용: /docs/architecture.md

## IMPORTANT

- **Service에서 @Mapper 직접 주입 금지** → 반드시 Repository 인터페이스 사용
- **도메인 객체에 @Data / @Setter 금지** → @Getter + @Builder만 사용
- **모든 코드는 com.mapo.palantier 하위에 작성**
- **@ComponentScan, @MapperScan 명시적 설정 금지**
- **XML Mapper namespace는 infrastructure 패키지 경로 사용**

## 새 도메인 추가 시 생성 순서

```
{domain}/domain/{Domain}.java                 ← @Getter @Builder
{domain}/domain/{Domain}Repository.java       ← 인터페이스
{domain}/infrastructure/{Domain}Mapper.java   ← @Mapper
{domain}/infrastructure/{Domain}RepositoryImpl.java
{domain}/application/{Domain}Service.java     ← Repository 인터페이스만 주입
{domain}/presentation/{Domain}Controller.java
{domain}/presentation/dto/{Domain}Request.java
{domain}/presentation/dto/{Domain}Response.java
```

## 의존성 방향

```
presentation → application → domain ← infrastructure
```

## REFERENCE

- DDD 원칙 상세: /docs/architecture.md
- DB 변경 원칙: /docs/database.md
