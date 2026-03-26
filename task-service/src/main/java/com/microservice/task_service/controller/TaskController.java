package com.microservice.task_service.controller;

import com.microservice.task_service.dto.TaskDTO;
import com.microservice.task_service.dto.TaskCategoryResponse;
import com.microservice.task_service.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        List<TaskDTO> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/categories")
    public ResponseEntity<TaskCategoryResponse> getTasksByTimeCategory() {
        TaskCategoryResponse tasksByCategory = taskService.getTasksByTimeCategory();
        return ResponseEntity.ok(tasksByCategory);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        TaskDTO task = taskService.getTaskById(id);
        if (task != null) {
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUserId(@PathVariable Long userId) {
        List<TaskDTO> tasks = taskService.getTasksByUserId(userId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TaskDTO>> getTasksByStatus(@PathVariable String status) {
        List<TaskDTO> tasks = taskService.getTasksByStatus(status);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDTO taskDTO) {
        try {
            TaskDTO createdTask = taskService.createTask(taskDTO);
            return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error creating task: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long id, @RequestBody TaskDTO taskDTO) {
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        boolean deleted = taskService.deleteTask(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/update-statuses")
    public ResponseEntity<String> updateTaskStatuses() {
        taskService.updateAllTaskStatuses();
        return ResponseEntity.ok("Task statuses updated");
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TaskDTO> completeTask(@PathVariable Long id) {
        TaskDTO completedTask = taskService.completeTask(id);
        if (completedTask != null) {
            return ResponseEntity.ok(completedTask);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/completed")
    public ResponseEntity<List<TaskDTO>> getCompletedTasks() {
        List<TaskDTO> tasks = taskService.getCompletedTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/completed/on-time")
    public ResponseEntity<List<TaskDTO>> getCompletedOnTimeTasks() {
        List<TaskDTO> tasks = taskService.getCompletedOnTimeTasks();
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/completed/late")
    public ResponseEntity<List<TaskDTO>> getCompletedLateTasks() {
        List<TaskDTO> tasks = taskService.getCompletedLateTasks();
        return ResponseEntity.ok(tasks);
    }
}

class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
