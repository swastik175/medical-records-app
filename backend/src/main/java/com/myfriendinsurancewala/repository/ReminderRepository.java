package com.myfriendinsurancewala.repository;

import com.myfriendinsurancewala.model.Reminder;
import com.myfriendinsurancewala.model.ReminderType;
import com.myfriendinsurancewala.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserOrderByReminderDateAsc(User user);
    List<Reminder> findByUserAndActiveTrueOrderByReminderDateAsc(User user);
    List<Reminder> findByUserAndReminderTypeOrderByReminderDateAsc(User user, ReminderType reminderType);
    List<Reminder> findByUserAndReminderDateGreaterThanEqual(User user, LocalDate date);
    Optional<Reminder> findByIdAndUser(Long id, User user);
    List<Reminder> findByUserId(Long userId);
}
