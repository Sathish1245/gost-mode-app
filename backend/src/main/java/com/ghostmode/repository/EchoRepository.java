package com.ghostmode.repository;

import com.ghostmode.model.Echo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EchoRepository extends JpaRepository<Echo, Long> {
    // Find echoes created in the last 24 hours, ordered by newest first
    List<Echo> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime twentyFourHoursAgo);
}
