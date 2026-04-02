package com.mapo.palantier.sql.service;

import com.mapo.palantier.sql.dto.*;
import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.util.*;
import javax.sql.DataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
public class SqlPracticeService {

    private final DataSource dataSource;

    @Value("${sql.init.dir:}")
    private String externalInitDir;

    public SqlPracticeService(
        @Qualifier("sqlPracticeDataSource") DataSource dataSource
    ) {
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void init() {
        if (!isNewDatabase()) {
            log.info("[SQL Practice] 기존 DB 감지 - 초기화 스킵");
            return;
        }
        log.info("[SQL Practice] 새 DB 감지 - 초기화 시작");
        runSqlFile("schema.sql");
        runSqlFile("data.sql");
        log.info("[SQL Practice] 초기화 완료");
    }

    // DB가 비어있는지 확인 (테이블이 하나도 없으면 새 DB)
    private boolean isNewDatabase() {
        try (
            Connection conn = dataSource.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
            )
        ) {
            return rs.next() && rs.getInt(1) == 0;
        } catch (SQLException e) {
            return true;
        }
    }

    private void runSqlFile(String fileName) {
        try {
            String sql = readSqlFile(fileName);
            if (sql == null || sql.isBlank()) return;

            try (
                Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()
            ) {
                // 세미콜론으로 구분하여 각 문장 실행
                String[] statements = sql.split(";");
                for (String s : statements) {
                    String trimmed = s.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        stmt.execute(trimmed);
                    }
                }
            }
            log.info("[SQL Practice] {} 실행 완료", fileName);
        } catch (Exception e) {
            log.error(
                "[SQL Practice] {} 실행 실패: {}",
                fileName,
                e.getMessage()
            );
        }
    }

    private String readSqlFile(String fileName) throws IOException {
        // 1. 외부 경로 우선 (배포 환경: SQL_INIT_DIR 환경변수)
        if (StringUtils.hasText(externalInitDir)) {
            Path external = Paths.get(externalInitDir, fileName);
            if (Files.exists(external)) {
                log.info("[SQL Practice] 외부 파일 사용: {}", external);
                return Files.readString(external, StandardCharsets.UTF_8);
            }
        }
        // 2. classpath 폴백 (로컬 개발)
        ClassPathResource resource = new ClassPathResource("sql/" + fileName);
        if (resource.exists()) {
            try (InputStream is = resource.getInputStream()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        }
        log.warn("[SQL Practice] {} 파일을 찾을 수 없습니다", fileName);
        return null;
    }

    public SqlExecuteResponse execute(String query) {
        long start = System.currentTimeMillis();
        String trimmed = query.trim();
        String upperQuery = trimmed.toUpperCase();
        String type = detectQueryType(upperQuery);

        try (Connection conn = dataSource.getConnection()) {
            if (
                type.equals("SELECT") ||
                upperQuery.startsWith("PRAGMA") ||
                upperQuery.startsWith("EXPLAIN")
            ) {
                return executeQuery(conn, trimmed, type, start);
            } else {
                return executeUpdate(conn, trimmed, type, start);
            }
        } catch (SQLException e) {
            log.error("SQL execution error: {}", e.getMessage());
            return SqlExecuteResponse.builder()
                .success(false)
                .type(type)
                .message(e.getMessage())
                .executionTimeMs(System.currentTimeMillis() - start)
                .build();
        }
    }

    private SqlExecuteResponse executeQuery(
        Connection conn,
        String query,
        String type,
        long start
    ) throws SQLException {
        try (
            PreparedStatement ps = conn.prepareStatement(query);
            ResultSet rs = ps.executeQuery()
        ) {
            ResultSetMetaData meta = rs.getMetaData();
            int colCount = meta.getColumnCount();
            List<String> columns = new ArrayList<>();
            for (int i = 1; i <= colCount; i++) columns.add(
                meta.getColumnLabel(i)
            );

            List<Map<String, Object>> rows = new ArrayList<>();
            while (rs.next()) {
                Map<String, Object> row = new LinkedHashMap<>();
                for (int i = 1; i <= colCount; i++) row.put(
                    meta.getColumnLabel(i),
                    rs.getObject(i)
                );
                rows.add(row);
            }
            return SqlExecuteResponse.builder()
                .success(true)
                .type(type)
                .columns(columns)
                .rows(rows)
                .message(rows.size() + "개 행이 조회되었습니다.")
                .executionTimeMs(System.currentTimeMillis() - start)
                .build();
        }
    }

    private SqlExecuteResponse executeUpdate(
        Connection conn,
        String query,
        String type,
        long start
    ) throws SQLException {
        try (Statement stmt = conn.createStatement()) {
            int affected = stmt.executeUpdate(query);
            String msg = switch (type) {
                case "INSERT" -> affected + "개 행이 삽입되었습니다.";
                case "UPDATE" -> affected + "개 행이 수정되었습니다.";
                case "DELETE" -> affected + "개 행이 삭제되었습니다.";
                case "CREATE" -> "테이블이 생성되었습니다.";
                case "DROP" -> "테이블이 삭제되었습니다.";
                case "ALTER" -> "테이블이 수정되었습니다.";
                default -> "쿼리가 실행되었습니다.";
            };
            return SqlExecuteResponse.builder()
                .success(true)
                .type(type)
                .affectedRows(affected)
                .message(msg)
                .executionTimeMs(System.currentTimeMillis() - start)
                .build();
        }
    }

    public List<TableInfo> getTables() {
        List<TableInfo> tables = new ArrayList<>();
        try (
            Connection conn = dataSource.getConnection();
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
            )
        ) {
            while (rs.next()) {
                String tableName = rs.getString("name");
                List<ColumnInfo> columns = getColumns(conn, tableName);
                long rowCount = getRowCount(conn, tableName);
                tables.add(
                    TableInfo.builder()
                        .tableName(tableName)
                        .columns(columns)
                        .rowCount(rowCount)
                        .build()
                );
            }
        } catch (SQLException e) {
            log.error("Error fetching tables: {}", e.getMessage());
        }
        return tables;
    }

    public TableInfo getTable(String tableName) {
        try (Connection conn = dataSource.getConnection()) {
            return TableInfo.builder()
                .tableName(tableName)
                .columns(getColumns(conn, tableName))
                .rowCount(getRowCount(conn, tableName))
                .build();
        } catch (SQLException e) {
            log.error("Error fetching table: {}", e.getMessage());
            return null;
        }
    }

    private List<ColumnInfo> getColumns(Connection conn, String tableName)
        throws SQLException {
        List<ColumnInfo> columns = new ArrayList<>();
        try (
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                "PRAGMA table_info(" + tableName + ")"
            )
        ) {
            while (rs.next()) {
                columns.add(
                    ColumnInfo.builder()
                        .cid(rs.getInt("cid"))
                        .name(rs.getString("name"))
                        .type(rs.getString("type"))
                        .notNull(rs.getInt("notnull") == 1)
                        .defaultValue(rs.getString("dflt_value"))
                        .primaryKey(rs.getInt("pk") == 1)
                        .build()
                );
            }
        }
        return columns;
    }

    private long getRowCount(Connection conn, String tableName)
        throws SQLException {
        try (
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                "SELECT COUNT(*) FROM \"" + tableName + "\""
            )
        ) {
            return rs.next() ? rs.getLong(1) : 0;
        }
    }

    private String detectQueryType(String upper) {
        if (
            upper.startsWith("SELECT") || upper.startsWith("WITH")
        ) return "SELECT";
        if (upper.startsWith("INSERT")) return "INSERT";
        if (upper.startsWith("UPDATE")) return "UPDATE";
        if (upper.startsWith("DELETE")) return "DELETE";
        if (upper.startsWith("CREATE")) return "CREATE";
        if (upper.startsWith("DROP")) return "DROP";
        if (upper.startsWith("ALTER")) return "ALTER";
        if (upper.startsWith("PRAGMA")) return "PRAGMA";
        if (upper.startsWith("EXPLAIN")) return "EXPLAIN";
        return "OTHER";
    }
}
