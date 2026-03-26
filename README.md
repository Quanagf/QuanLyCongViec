# Task Management Microservices System

## 📋 Overview

A complete microservices architecture for task management with React frontend, Java Spring Boot services, MySQL database, and Docker containerization.

**Stack**: React 18 • Spring Boot 4 • MySQL 8 • Docker • Spring Cloud Gateway

## 🏗️ Architecture

```
React Frontend (3000)
        ↓
API Gateway (8080)
        ↓
┌─────────┴─────────┐
Task Service    User Service
(8081)          (8082)
    ↓               ↓
  MySQL (3306)
   task_db, user_db
```

## 🚀 Quick Start

```bash
cd testDockerCloud
docker-compose up --build
```

**Access**: http://localhost:3000

## 📍 Services

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 3000 | React UI |
| API Gateway | 8080 | Request routing |
| Task Service | 8081 | Task management |
| User Service | 8082 | User management |
| MySQL | 3306 | Database |

## 🔌 API Endpoints

### Users
```
POST   /api/users           - Create user
GET    /api/users           - Get all users
GET    /api/users/{id}      - Get user by ID
PUT    /api/users/{id}      - Update user
DELETE /api/users/{id}      - Delete user
```

### Tasks
```
POST   /api/tasks           - Create task
GET    /api/tasks           - Get all tasks
GET    /api/tasks/{id}      - Get task by ID
PUT    /api/tasks/{id}      - Update task
DELETE /api/tasks/{id}      - Delete task
```

## 📊 Database

**Default Credentials**: 
- User: `root`
- Password: `root`

**Databases**: `task_db`, `user_db`

```bash
# Connect to MySQL
docker exec -it mysql_db mysql -uroot -proot
```

## 💻 Commands

```bash
# Start services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f task-service

# Access MySQL
docker exec -it mysql_db mysql -uroot -proot

# Remove volumes (reset data)
docker-compose down -v
```

## 🐛 Troubleshooting

**Port in use**:
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Database connection issues**:
```bash
docker-compose logs mysql
docker ps | grep mysql_db
```

**Rebuild everything**:
```bash
docker-compose down -v
docker-compose up --build
```

## 📁 Project Structure

```
testDockerCloud/
├── api-gateway/        - Spring Cloud Gateway
├── task-service/       - Task management service
├── user-service/       - User management service
├── frontend/           - React application
├── docker-compose.yml  - Service orchestration
├── init-db.sql        - Database initialization
└── README.md          - This file
```

## 🎯 Features

✅ Microservices architecture  
✅ API Gateway routing  
✅ RESTful APIs  
✅ React frontend  
✅ MySQL database  
✅ Docker containerization  
✅ Service-to-service communication  

## 📝 Example Usage

**Create a user**:
```bash
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","fullName":"John Doe","password":"pass123"}'
```

**Create a task**:
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"My Task","description":"Description","userId":1,"status":"PENDING"}'
```

**Get all tasks**:
```bash
curl http://localhost:8080/api/tasks
```

## 📚 References

- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://react.dev)
- [Docker](https://docs.docker.com)
- [MySQL](https://dev.mysql.com/doc)

---

**Happy Coding!** 🎉
