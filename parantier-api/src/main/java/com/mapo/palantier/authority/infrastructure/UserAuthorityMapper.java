package com.mapo.palantier.authority.infrastructure;

import com.mapo.palantier.authority.domain.UserAuthority;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserAuthorityMapper {

    List<UserAuthority> findByUserId(@Param("userId") Long userId);

    List<UserAuthority> findValidByUserId(@Param("userId") Long userId);

    void insert(UserAuthority userAuthority);

    void delete(@Param("userId") Long userId, @Param("authorityId") Long authorityId);

    void deleteAll(@Param("userId") Long userId);

    int exists(@Param("userId") Long userId, @Param("authorityId") Long authorityId);

    List<String> findAuthorityNamesByUserId(@Param("userId") Long userId);
}
