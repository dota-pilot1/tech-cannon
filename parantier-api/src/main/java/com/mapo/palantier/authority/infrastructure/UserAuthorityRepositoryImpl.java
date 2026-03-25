package com.mapo.palantier.authority.infrastructure;

import com.mapo.palantier.authority.domain.UserAuthority;
import com.mapo.palantier.authority.domain.UserAuthorityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserAuthorityRepositoryImpl implements UserAuthorityRepository {

    private final UserAuthorityMapper mapper;

    @Override
    public List<UserAuthority> findByUserId(Long userId) {
        return mapper.findByUserId(userId);
    }

    @Override
    public List<UserAuthority> findValidByUserId(Long userId) {
        return mapper.findValidByUserId(userId);
    }

    @Override
    public void grant(UserAuthority userAuthority) {
        mapper.insert(userAuthority);
    }

    @Override
    public void revoke(Long userId, Long authorityId) {
        mapper.delete(userId, authorityId);
    }

    @Override
    public void revokeAll(Long userId) {
        mapper.deleteAll(userId);
    }

    @Override
    public boolean exists(Long userId, Long authorityId) {
        return mapper.exists(userId, authorityId) > 0;
    }

    @Override
    public List<String> findAuthorityNamesByUserId(Long userId) {
        return mapper.findAuthorityNamesByUserId(userId);
    }
}
