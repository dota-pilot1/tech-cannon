package com.mapo.palantier.user.application;

import com.mapo.palantier.common.exception.ErrorCode;
import com.mapo.palantier.common.exception.ResourceNotFoundException;
import com.mapo.palantier.user.domain.User;
import com.mapo.palantier.user.domain.UserRepository;
import com.mapo.palantier.user.domain.UserRole;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );

        // 권한 업데이트
        userRepository.updateRole(userId, role);
    }

    /**
     * 사용자 조직 변경 (관리자 전용)
     */
    @Transactional
    public void updateUserOrganization(Long userId, Long organizationId) {
        // 사용자 존재 여부 확인
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );

        // 조직 업데이트
        userRepository.updateOrganization(userId, organizationId);
    }

    /**
     * 여러 사용자의 조직 일괄 변경 (관리자 전용)
     */
    @Transactional
    public void updateUsersOrganization(
        List<Long> userIds,
        Long organizationId
    ) {
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
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );

        // 조직을 NULL로 업데이트
        userRepository.updateOrganization(userId, null);
    }

    /**
     * 이메일로 사용자 조회
     */
    public User findByEmail(String email) {
        return userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );
    }

    /**
     * ID로 사용자 조회
     */
    public User findById(Long id) {
        return userRepository
            .findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );
    }

    /**
     * 사용자 정보 업데이트
     */
    @Transactional
    public void updateUser(Long userId, User user) {
        User existingUser = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );

        // 사용자명만 업데이트
        userRepository.updateUsername(userId, user.getUsername());
    }

    /**
     * 비밀번호 확인
     */
    public boolean verifyPassword(Long userId, String currentPassword) {
        User user = userRepository
            .findById(userId)
            .orElseThrow(() ->
                new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND)
            );

        return passwordEncoder.matches(currentPassword, user.getPassword());
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(Long userId, String newPassword) {
        String encodedPassword = passwordEncoder.encode(newPassword);
        userRepository.updatePassword(userId, encodedPassword);
    }

    /**
     * 프로필 이미지 URL 업데이트
     */
    @Transactional
    public void updateProfileImage(Long userId, String profileImageUrl) {
        userRepository.updateProfileImage(userId, profileImageUrl);
    }

    /**
     * 사용자 일괄 삭제 (관리자 전용)
     */
    @Transactional
    public void deleteUsers(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) return;
        userRepository.deleteByIds(userIds);
    }
}
