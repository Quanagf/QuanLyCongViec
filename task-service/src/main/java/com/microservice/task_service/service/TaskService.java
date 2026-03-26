package com.microservice.task_service.service;

import com.microservice.task_service.dto.TaskDTO;
import com.microservice.task_service.dto.TaskCategoryResponse;
import com.microservice.task_service.entity.Task;
import com.microservice.task_service.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    // Get all tasks
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get task by ID
    public TaskDTO getTaskById(Long id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.map(this::convertToDTO).orElse(null);
    }
    
    // Get tasks by user ID
    public List<TaskDTO> getTasksByUserId(Long userId) {
        return taskRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get tasks by status
    public List<TaskDTO> getTasksByStatus(String status) {
        return taskRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Create task
    public TaskDTO createTask(TaskDTO taskDTO) {
        System.out.println("Creating task with DTO: " + taskDTO);
        
        // Validation
        if (taskDTO.getTitle() == null || taskDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Task title is required");
        }
        
        if (taskDTO.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        
        if (taskDTO.getEndDate() == null) {
            throw new IllegalArgumentException("End date is required");
        }
        
        if (taskDTO.getStartDate().isAfter(taskDTO.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }
        
        Task task = convertToEntity(taskDTO);
        System.out.println("Converted task: " + task);
        
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        Task savedTask = taskRepository.save(task);
        System.out.println("Saved task: " + savedTask);
        
        return convertToDTO(savedTask);
    }
    
    // Update task
    public TaskDTO updateTask(Long id, TaskDTO taskDTO) {
        Optional<Task> existingTask = taskRepository.findById(id);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            task.setTitle(taskDTO.getTitle());
            task.setDescription(taskDTO.getDescription());
            task.setStatus(taskDTO.getStatus());
            task.setUserId(taskDTO.getUserId());
            task.setStartDate(taskDTO.getStartDate());
            task.setEndDate(taskDTO.getEndDate());
            task.setUpdatedAt(LocalDateTime.now());
            Task updatedTask = taskRepository.save(task);
            return convertToDTO(updatedTask);
        }
        return null;
    }
    
    // Delete task
    public boolean deleteTask(Long id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Complete a task
    public TaskDTO completeTask(Long id) {
        Optional<Task> existingTask = taskRepository.findById(id);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            task.setStatus("COMPLETED");
            task.setCompletedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());
            Task completedTask = taskRepository.save(task);
            return convertToDTO(completedTask);
        }
        return null;
    }

    // Get all completed tasks
    public List<TaskDTO> getCompletedTasks() {
        List<Task> tasks = taskRepository.findByStatus("COMPLETED");
        return tasks.stream().map(this::convertToDTO).collect(java.util.stream.Collectors.toList());
    }

    // Get completed tasks that were on time (complatedAt <= endDate)
    public List<TaskDTO> getCompletedOnTimeTasks() {
        List<Task> tasks = taskRepository.findByStatus("COMPLETED");
        return tasks.stream()
                .filter(t -> t.getCompletedAt() != null && t.getEndDate() != null && 
                        !t.getCompletedAt().isAfter(t.getEndDate()))
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    // Get completed tasks that were late (completedAt > endDate)
    public List<TaskDTO> getCompletedLateTasks() {
        List<Task> tasks = taskRepository.findByStatus("COMPLETED");
        return tasks.stream()
                .filter(t -> t.getCompletedAt() != null && t.getEndDate() != null && 
                        t.getCompletedAt().isAfter(t.getEndDate()))
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    // Get tasks organized by time category (PENDING, IN_PROCESS, LATE)
    public TaskCategoryResponse getTasksByTimeCategory() {
        List<Task> allTasksEntity = taskRepository.findAll();
        List<TaskDTO> pending = new ArrayList<>();
        List<TaskDTO> inProgress = new ArrayList<>();
        List<TaskDTO> late = new ArrayList<>();

        for (Task task : allTasksEntity) {
            // Skip completed tasks - don't recategorize them
            if ("COMPLETED".equals(task.getStatus())) {
                continue;
            }
            
            // Calculate new category based on current time
            String newCategory = calculateTimeCategory(task);
            
            // Update status in database if changed
            if (!task.getStatus().equals(newCategory)) {
                task.setStatus(newCategory);
                taskRepository.save(task);
                System.out.println("Task " + task.getId() + " status updated from " + task.getStatus() + " to " + newCategory);
            }
            
            TaskDTO taskDTO = convertToDTO(task);
            
            // Organize by category
            if ("PENDING".equals(newCategory)) {
                pending.add(taskDTO);
            } else if ("IN_PROCESS".equals(newCategory)) {
                inProgress.add(taskDTO);
            } else if ("LATE".equals(newCategory)) {
                late.add(taskDTO);
            }
        }

        return new TaskCategoryResponse(pending, inProgress, late);
    }

    // Calculate time category for a task
    private String calculateTimeCategory(Task task) {
        LocalDateTime now = LocalDateTime.now();
        if (task.getStartDate() == null || task.getEndDate() == null) {
            return "PENDING";
        }

        if (now.isBefore(task.getStartDate())) {
            return "PENDING"; // Before start date
        } else if (!now.isBefore(task.getEndDate())) {
            // now >= endDate
            return "LATE"; // On or after end date
        } else {
            return "IN_PROCESS"; // Between start and end date
        }
    }

    // Calculate time category for TaskDTO (for backward compatibility)
    private String calculateTimeCategory(TaskDTO taskDTO) {
        LocalDateTime now = LocalDateTime.now();
        if (taskDTO.getStartDate() == null || taskDTO.getEndDate() == null) {
            return "PENDING";
        }

        if (now.isBefore(taskDTO.getStartDate())) {
            return "PENDING"; // Before start date
        } else if (!now.isBefore(taskDTO.getEndDate())) {
            // now >= endDate (using !isBefore instead of isAfter to include equals)
            return "LATE"; // On or after end date
        } else {
            return "IN_PROCESS"; // Between start and end date
        }
    }
    // Update all task statuses in database
    public void updateAllTaskStatuses() {
        List<Task> allTasks = taskRepository.findAll();
        
        // Get current time from database to ensure timezone consistency
        LocalDateTime now = LocalDateTime.now();
        System.out.println("[TaskService] Starting updateAllTaskStatuses at " + now);
        System.out.println("[TaskService] Found " + allTasks.size() + " tasks to process");
        
        for (Task task : allTasks) {
            // Skip completed tasks - don't recalculate their status
            if ("COMPLETED".equals(task.getStatus())) {
                System.out.println("[TaskService] Skipping COMPLETED task " + task.getId());
                continue;
            }
            
            String newStatus = calculateStatusForTask(task, now);
            
            System.out.println("[TaskService] Task " + task.getId() + 
                    ": now=" + now + ", start=" + task.getStartDate() + 
                    ", end=" + task.getEndDate() + 
                    ", oldStatus=" + task.getStatus() + ", newStatus=" + newStatus);
            
            if (!task.getStatus().equals(newStatus)) {
                System.out.println("[TaskService] UPDATING Task " + task.getId() + ": " + task.getStatus() + " → " + newStatus);
                task.setStatus(newStatus);
                task.setUpdatedAt(now);
                taskRepository.save(task);
            }
        }
    }

    private String calculateStatusForTask(Task task, LocalDateTime now) {
        if (task.getStartDate() == null || task.getEndDate() == null) {
            return "PENDING";
        }

        if (now.isBefore(task.getStartDate())) {
            return "PENDING";
        } else if (!now.isBefore(task.getEndDate())) {
            return "LATE";
        } else {
            return "IN_PROCESS";
        }
    }    
    // Utility methods for DTO conversion
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setUserId(task.getUserId());
        dto.setStartDate(task.getStartDate());
        dto.setEndDate(task.getEndDate());
        dto.setCompletedAt(task.getCompletedAt());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
    
    private Task convertToEntity(TaskDTO taskDTO) {
        Task task = new Task();
        task.setId(taskDTO.getId());
        task.setTitle(taskDTO.getTitle());
        task.setDescription(taskDTO.getDescription());
        task.setStatus(taskDTO.getStatus());
        task.setUserId(taskDTO.getUserId());
        task.setStartDate(taskDTO.getStartDate());
        task.setEndDate(taskDTO.getEndDate());
        task.setCreatedAt(taskDTO.getCreatedAt());
        task.setUpdatedAt(taskDTO.getUpdatedAt());
        return task;
    }
}
