package com.ghostmode.repository;

import com.ghostmode.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    @Query("SELECT r FROM Room r WHERE r.user1.id = :userId OR r.user2.id = :userId")
    List<Room> findByUserId(@Param("userId") Long userId);
}
