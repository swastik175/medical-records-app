package com.myfriendinsurancewala.repository;

import com.myfriendinsurancewala.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobileNumber(String mobileNumber);
    boolean existsByMobileNumber(String mobileNumber);
    Optional<User> findByEmail(String email);
}
