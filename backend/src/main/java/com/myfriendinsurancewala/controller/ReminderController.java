package com.myfriendinsurancewala.controller;

import com.myfriendinsurancewala.dto.ReminderDto;
import com.myfriendinsurancewala.model.ReminderType;
import com.myfriendinsurancewala.model.User;
import com.myfriendinsurancewala.service.ReminderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<ReminderDto>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) ReminderType type) {
        return ResponseEntity.ok(reminderService.getReminders(user, type));
    }

    @PostMapping
    public ResponseEntity<ReminderDto> create(
            @Valid @RequestBody ReminderDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        ReminderDto created = reminderService.createReminder(dto, user, request.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReminderDto> update(
            @PathVariable Long id,
            @Valid @RequestBody ReminderDto dto,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        ReminderDto updated = reminderService.updateReminder(id, dto, user, request.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ReminderDto> toggleActive(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        ReminderDto updated = reminderService.toggleActive(id, user, request.getRemoteAddr());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletRequest request) {
        reminderService.deleteReminder(id, user, request.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}
