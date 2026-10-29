package com.myfriendinsurancewala.service;

import com.myfriendinsurancewala.dto.ReminderDto;
import com.myfriendinsurancewala.exception.ResourceNotFoundException;
import com.myfriendinsurancewala.model.FamilyMember;
import com.myfriendinsurancewala.model.Reminder;
import com.myfriendinsurancewala.model.ReminderType;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.repository.FamilyMemberRepository;
import com.myfriendinsurancewala.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private AuditService auditService;

    public List<ReminderDto> getReminders(User user, ReminderType type) {
        List<Reminder> reminders;
        if (type != null) {
            reminders = reminderRepository.findByUserAndReminderTypeOrderByReminderDateAsc(user, type);
        } else {
            reminders = reminderRepository.findByUserOrderByReminderDateAsc(user);
        }
        return reminders.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public ReminderDto createReminder(ReminderDto dto, User user, String ipAddress) {
        Reminder reminder = new Reminder();
        reminder.setUser(user);
        copyDtoToEntity(dto, reminder, user);

        Reminder saved = reminderRepository.save(reminder);
        auditService.log(user.getId(), user.getRole(), "CREATE_REMINDER", "Reminder #" + saved.getId(), ipAddress, "SUCCESS",
                "Created " + saved.getReminderType() + " reminder: " + saved.getTitle());

        return mapToDto(saved);
    }

    @Transactional
    public ReminderDto updateReminder(Long id, ReminderDto dto, User user, String ipAddress) {
        Reminder reminder = reminderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        copyDtoToEntity(dto, reminder, user);
        Reminder updated = reminderRepository.save(reminder);
        auditService.log(user.getId(), user.getRole(), "UPDATE_REMINDER", "Reminder #" + id, ipAddress, "SUCCESS", "Updated reminder");

        return mapToDto(updated);
    }

    @Transactional
    public ReminderDto toggleActive(Long id, User user, String ipAddress) {
        Reminder reminder = reminderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        reminder.setActive(!reminder.isActive());
        Reminder saved = reminderRepository.save(reminder);
        auditService.log(user.getId(), user.getRole(), "TOGGLE_REMINDER", "Reminder #" + id, ipAddress, "SUCCESS",
                "Reminder active status set to: " + saved.isActive());

        return mapToDto(saved);
    }

    @Transactional
    public void deleteReminder(Long id, User user, String ipAddress) {
        Reminder reminder = reminderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found with id: " + id));

        reminderRepository.delete(reminder);
        auditService.log(user.getId(), user.getRole(), "DELETE_REMINDER", "Reminder #" + id, ipAddress, "SUCCESS", "Deleted reminder");
    }

    private void copyDtoToEntity(ReminderDto dto, Reminder reminder, User user) {
        if (dto.getFamilyMemberId() != null) {
            FamilyMember member = familyMemberRepository.findByIdAndUser(dto.getFamilyMemberId(), user).orElse(null);
            reminder.setFamilyMember(member);
        } else {
            reminder.setFamilyMember(null);
        }

        reminder.setReminderType(dto.getReminderType());
        reminder.setTitle(dto.getTitle());
        reminder.setDescription(dto.getDescription());
        reminder.setReminderDate(dto.getReminderDate());
        reminder.setReminderTime(dto.getReminderTime());
        reminder.setDosageOrFrequency(dto.getDosageOrFrequency());
        reminder.setActive(dto.isActive());
    }

    public ReminderDto mapToDto(Reminder reminder) {
        ReminderDto dto = new ReminderDto();
        dto.setId(reminder.getId());
        if (reminder.getFamilyMember() != null) {
            dto.setFamilyMemberId(reminder.getFamilyMember().getId());
            dto.setFamilyMemberName(reminder.getFamilyMember().getFullName());
        }
        dto.setReminderType(reminder.getReminderType());
        dto.setTitle(reminder.getTitle());
        dto.setDescription(reminder.getDescription());
        dto.setReminderDate(reminder.getReminderDate());
        dto.setReminderTime(reminder.getReminderTime());
        dto.setDosageOrFrequency(reminder.getDosageOrFrequency());
        dto.setActive(reminder.isActive());
        return dto;
    }
}
