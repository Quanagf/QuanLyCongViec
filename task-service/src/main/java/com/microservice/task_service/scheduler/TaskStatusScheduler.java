package com.microservice.task_service.scheduler;

import com.microservice.task_service.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class TaskStatusScheduler {

    @Autowired
    private TaskService taskService;

    // Run every 5 seconds to auto-update task statuses in database
    @Scheduled(fixedRate = 5000)
    public void updateTaskStatusesInDatabase() {
        System.out.println("[TaskStatusScheduler] Running scheduled task status update");
        taskService.updateAllTaskStatuses();
    }
}
