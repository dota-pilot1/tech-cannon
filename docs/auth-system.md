# 권한 시스템

## Role vs Authority

| 구분 | 설명 | 예시 |
|------|------|------|
| **Role** | 사용자 신분 | `ROLE_USER`, `ROLE_ADMIN` |
| **Authority** | 세밀한 기능 권한 | `USER:READ`, `MENU:ADMIN:WRITE` |

## Authority 명명 규칙

```
CATEGORY:RESOURCE:ACTION
예: USER:READ, MENU:ADMIN:WRITE, AUTHORITY:READ
```

## 주요 엔드포인트

| 항목 | 주소 |
|------|------|
| Backend | http://localhost:8080 |
| Frontend | http://localhost:5173 |
