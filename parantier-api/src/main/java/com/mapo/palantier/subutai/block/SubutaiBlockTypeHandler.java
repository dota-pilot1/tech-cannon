package com.mapo.palantier.subutai.block;

import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@MappedTypes(SubutaiBlockType.class)
public class SubutaiBlockTypeHandler extends BaseTypeHandler<SubutaiBlockType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, SubutaiBlockType parameter, JdbcType jdbcType)
            throws SQLException {
        ps.setString(i, parameter.name());
    }

    @Override
    public SubutaiBlockType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String value = rs.getString(columnName);
        return value == null ? null : SubutaiBlockType.valueOf(value);
    }

    @Override
    public SubutaiBlockType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String value = rs.getString(columnIndex);
        return value == null ? null : SubutaiBlockType.valueOf(value);
    }

    @Override
    public SubutaiBlockType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String value = cs.getString(columnIndex);
        return value == null ? null : SubutaiBlockType.valueOf(value);
    }
}
