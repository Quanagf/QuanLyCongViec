package com.microservice.task_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class TaskCategoryResponse {
    private List<TaskDTO> pending;
    private List<TaskDTO> inProgress;
    private List<TaskDTO> late;
}
