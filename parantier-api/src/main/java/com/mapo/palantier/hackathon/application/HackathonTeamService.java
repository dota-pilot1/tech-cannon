package com.mapo.palantier.hackathon.application;

import com.mapo.palantier.hackathon.domain.HackathonTeamFaq;
import com.mapo.palantier.hackathon.domain.HackathonTeamIssue;
import com.mapo.palantier.hackathon.domain.HackathonTeamLink;
import com.mapo.palantier.hackathon.domain.HackathonTeamMember;
import com.mapo.palantier.hackathon.domain.HackathonTeamTask;
import com.mapo.palantier.hackathon.dto.CreateFaqRequest;
import com.mapo.palantier.hackathon.dto.CreateIssueRequest;
import com.mapo.palantier.hackathon.dto.CreateLinkRequest;
import com.mapo.palantier.hackathon.dto.CreateTaskRequest;
import com.mapo.palantier.hackathon.dto.UpdateFaqRequest;
import com.mapo.palantier.hackathon.dto.UpdateIssueRequest;
import com.mapo.palantier.hackathon.dto.UpdateTaskRequest;
import com.mapo.palantier.hackathon.infrastructure.HackathonFaqMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonIssueMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonLinkMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonTaskMapper;
import com.mapo.palantier.hackathon.infrastructure.HackathonTeamMemberMapper;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class HackathonTeamService {

    private final HackathonTeamMemberMapper memberMapper;
    private final HackathonLinkMapper linkMapper;
    private final HackathonTaskMapper taskMapper;
    private final HackathonIssueMapper issueMapper;
    private final HackathonFaqMapper faqMapper;

    public HackathonTeamService(
        HackathonTeamMemberMapper memberMapper,
        HackathonLinkMapper linkMapper,
        HackathonTaskMapper taskMapper,
        HackathonIssueMapper issueMapper,
        HackathonFaqMapper faqMapper
    ) {
        this.memberMapper = memberMapper;
        this.linkMapper = linkMapper;
        this.taskMapper = taskMapper;
        this.issueMapper = issueMapper;
        this.faqMapper = faqMapper;
    }

    // -----------------------------------------------------------------------
    // Members
    // -----------------------------------------------------------------------

    @Transactional
    public void addMember(Long teamId, Long userId) {
        HackathonTeamMember member = new HackathonTeamMember();
        member.setTeamId(teamId);
        member.setUserId(userId);
        memberMapper.insert(member);
    }

    @Transactional
    public void removeMember(Long teamId, Long userId) {
        memberMapper.deleteByTeamIdAndUserId(teamId, userId);
    }

    // -----------------------------------------------------------------------
    // Links
    // -----------------------------------------------------------------------

    public List<HackathonTeamLink> getLinks(Long teamId) {
        return linkMapper.findByTeamId(teamId);
    }

    @Transactional
    public Long addLink(Long teamId, Long userId, CreateLinkRequest req) {
        HackathonTeamLink link = new HackathonTeamLink();
        link.setTeamId(teamId);
        link.setLinkType(req.getLinkType());
        link.setTitle(req.getTitle());
        link.setUrl(req.getUrl());
        link.setCreatedBy(userId);
        linkMapper.insert(link);
        return link.getId();
    }

    @Transactional
    public void deleteLink(Long linkId) {
        linkMapper.deleteById(linkId);
    }

    // -----------------------------------------------------------------------
    // Tasks
    // -----------------------------------------------------------------------

    public List<HackathonTeamTask> getTasks(Long teamId) {
        return taskMapper.findByTeamId(teamId);
    }

    @Transactional
    public Long createTask(Long teamId, Long userId, CreateTaskRequest req) {
        HackathonTeamTask task = new HackathonTeamTask();
        task.setTeamId(teamId);
        task.setTitle(req.getTitle());
        task.setStatus(req.getStatus());
        task.setAssigneeId(req.getAssigneeId());
        task.setDueAt(req.getDueAt());
        task.setCreatedBy(userId);
        taskMapper.insert(task);
        return task.getId();
    }

    @Transactional
    public void updateTask(Long taskId, UpdateTaskRequest req) {
        HackathonTeamTask task = new HackathonTeamTask();
        task.setId(taskId);
        task.setTitle(req.getTitle());
        task.setStatus(req.getStatus());
        task.setAssigneeId(req.getAssigneeId());
        task.setDueAt(req.getDueAt());
        taskMapper.update(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        taskMapper.deleteById(taskId);
    }

    // -----------------------------------------------------------------------
    // Issues
    // -----------------------------------------------------------------------

    public List<HackathonTeamIssue> getIssues(Long teamId) {
        return issueMapper.findByTeamId(teamId);
    }

    @Transactional
    public Long createIssue(Long teamId, Long userId, CreateIssueRequest req) {
        HackathonTeamIssue issue = new HackathonTeamIssue();
        issue.setTeamId(teamId);
        issue.setTitle(req.getTitle());
        issue.setContent(req.getContent());
        issue.setStatus(req.getStatus());
        issue.setPriority(req.getPriority());
        issue.setAssigneeId(req.getAssigneeId());
        issue.setCreatedBy(userId);
        issueMapper.insert(issue);
        return issue.getId();
    }

    @Transactional
    public void updateIssue(Long issueId, UpdateIssueRequest req) {
        HackathonTeamIssue issue = new HackathonTeamIssue();
        issue.setId(issueId);
        issue.setTitle(req.getTitle());
        issue.setContent(req.getContent());
        issue.setStatus(req.getStatus());
        issue.setPriority(req.getPriority());
        issue.setAssigneeId(req.getAssigneeId());
        issueMapper.update(issue);
    }

    // -----------------------------------------------------------------------
    // FAQs
    // -----------------------------------------------------------------------

    public List<HackathonTeamFaq> getFaqs(Long teamId) {
        return faqMapper.findByTeamId(teamId);
    }

    @Transactional
    public Long createFaq(Long teamId, Long userId, CreateFaqRequest req) {
        HackathonTeamFaq faq = new HackathonTeamFaq();
        faq.setTeamId(teamId);
        faq.setQuestion(req.getQuestion());
        faq.setAnswer(req.getAnswer());
        faq.setOrderNum(req.getOrderNum());
        faq.setCreatedBy(userId);
        faqMapper.insert(faq);
        return faq.getId();
    }

    @Transactional
    public void updateFaq(Long faqId, UpdateFaqRequest req) {
        HackathonTeamFaq faq = new HackathonTeamFaq();
        faq.setId(faqId);
        faq.setQuestion(req.getQuestion());
        faq.setAnswer(req.getAnswer());
        faq.setOrderNum(req.getOrderNum());
        faqMapper.update(faq);
    }

    @Transactional
    public void deleteFaq(Long faqId) {
        faqMapper.deleteById(faqId);
    }
}
