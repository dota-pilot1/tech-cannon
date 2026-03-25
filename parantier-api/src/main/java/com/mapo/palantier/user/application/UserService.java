package com.mapo.palantier.user.application;

import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRepository;
import com.mapo.palantier.user.domain.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    /**
     * 전체 사용자 목록 조회 (관리자 전용)
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * 사용자 권한 변경 (관리자 전용)
     */
    @Transactional
    public void updateUserRole(Long userId, UserRole role) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 권한 업데이트
        userRepository.updateRole(userId, role);
    }

    /**
     * 사용자 조직 변경 (관리자 전용)
     */
    @Transactional
    public void updateUserOrganization(Long userId, Long organizationId) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 조직 업데이트
        userRepository.updateOrganization(userId, organizationId);
    }

    /**
     * 여러 사용자의 조직 일괄 변경 (관리자 전용)
     */
    @Transactional
    public void updateUsersOrganization(List<Long> userIds, Long organizationId) {
        for (Long userId : userIds) {
            updateUserOrganization(userId, organizationId);
        }
    }

    /**
     * 사용자를 조직에서 제거 (미소속 상태로 변경)
     */
    @Transactional
    public void removeUserFromOrganization(Long userId) {
        // 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 조직을 NULL로 업데이트
        userRepository.updateOrganization(userId, null);
    }
}
