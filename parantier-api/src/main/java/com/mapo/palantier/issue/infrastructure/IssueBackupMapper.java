package com.mapo.palantier.issue.infrastructure;

import com.mapo.palantier.issue.domain.IssueBackup;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface IssueBackupMapper {
    void insert(IssueBackup backup);
    List<IssueBackup> findAll();
    IssueBackup findById(@Param("id") Long id);
}
