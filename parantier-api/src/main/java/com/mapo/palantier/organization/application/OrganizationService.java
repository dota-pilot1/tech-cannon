package com.mapo.palantier.organization.application;

import com.mapo.palantier.organization.domain.Organization;
import com.mapo.palantier.organization.domain.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationService {
    private final OrganizationRepository organizationRepository;

    /**
     * 모든 조직을 트리 구조로 조회
     */
    public List<Organization> getOrganizationTree() {
        List<Organization> all = organizationRepository.findAll();
        return buildTree(all);
    }

    /**
     * 플랫한 리스트를 트리 구조로 변환
     */
    private List<Organization> buildTree(List<Organization> organizations) {
        Map<Long, Organization> orgMap = organizations.stream()
                .collect(Collectors.toMap(Organization::getId, org -> org));

        List<Organization> roots = new ArrayList<>();

        for (Organization org : organizations) {
            if (org.getParentId() == null) {
                roots.add(org);
            } else {
                Organization parent = orgMap.get(org.getParentId());
                if (parent != null) {
                    if (parent.getChildren() == null) {
                        parent.setChildren(new ArrayList<>());
                    }
                    parent.getChildren().add(org);
                }
            }
        }

        return roots;
    }

    /**
     * ID로 조직 조회
     */
    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id);
    }

    /**
     * 부모 ID로 자식 조직 조회
     */
    public List<Organization> getChildOrganizations(Long parentId) {
        return organizationRepository.findByParentId(parentId);
    }

    /**
     * 조직 타입으로 조회
     */
    public List<Organization> getOrganizationsByType(String orgType) {
        return organizationRepository.findByType(orgType);
    }

    /**
     * 조직 생성
     */
    @Transactional
    public Organization createOrganization(Organization organization) {
        organizationRepository.create(organization);
        return organization;
    }

    /**
     * 조직 수정
     */
    @Transactional
    public Organization updateOrganization(Long id, Organization organization) {
        organization.setId(id);
        organizationRepository.update(organization);
        return organizationRepository.findById(id);
    }

    /**
     * 조직 삭제
     */
    @Transactional
    public void deleteOrganization(Long id) {
        organizationRepository.delete(id);
    }
}
