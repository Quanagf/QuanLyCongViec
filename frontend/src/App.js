import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import Login from './Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksByCategory, setTasksByCategory] = useState({
    pending: [],
    inProgress: [],
    late: []
  });
  const [users, setUsers] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'history'
  const [completedTasks, setCompletedTasks] = useState({
    onTime: [],
    late: []
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedInLS = localStorage.getItem('isLoggedIn');
    const userLS = localStorage.getItem('user');
    
    if (isLoggedInLS === 'true' && userLS) {
      setCurrentUser(JSON.parse(userLS));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
      fetchTasksByTimeCategory();
      fetchCompletedTasks();
      fetchUsers();

      // Auto-refresh task categories every 3 seconds
      const interval = setInterval(() => {
        fetchTasksByTimeCategory();
        if (activeTab === 'history') {
          fetchCompletedTasks();
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, activeTab]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setTasks([]);
    setUsers([]);
    setTaskTitle('');
    setTaskDescription('');
    setStartDate('');
    setEndDate('');
    setError('');
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      setTasks(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải công việc: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksByTimeCategory = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks/categories`);
      setTasksByCategory({
        pending: response.data.pending || [],
        inProgress: response.data.inProgress || [],
        late: response.data.late || []
      });
    } catch (err) {
      console.error('Failed to fetch tasks by time category:', err);
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const [onTimeRes, lateRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/api/tasks/completed/on-time`),
        axios.get(`${apiBaseUrl}/api/tasks/completed/late`)
      ]);
      setCompletedTasks({
        onTime: onTimeRes.data || [],
        late: lateRes.data || []
      });
    } catch (err) {
      console.error('Failed to fetch completed tasks:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/api/users`);
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách người dùng: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ tất cả các trường bắt buộc');
      return;
    }
    try {
      // Format datetime for backend (add seconds if not present)
      const formatDateTime = (dt) => {
        if (dt && dt.length === 16) {
          return dt + ':00';
        }
        return dt;
      };
      const newTask = {
        title: taskTitle,
        description: taskDescription,
        startDate: formatDateTime(startDate),
        endDate: formatDateTime(endDate),
        status: 'PENDING',
        userId: currentUser?.id || null
      };
      console.log('Sending task:', newTask);
      await axios.post(`${apiBaseUrl}/api/tasks`, newTask);
      setTaskTitle('');
      setTaskDescription('');
      setStartDate('');
      setEndDate('');
      setError('');
      fetchTasks();
      fetchTasksByTimeCategory();
    } catch (err) {
      console.error('Error details:', err.response?.data || err);
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi không xác định';
      setError('Không thể tạo công việc: ' + errorMsg);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${apiBaseUrl}/api/tasks/${id}`);
      fetchTasks();
      fetchTasksByTimeCategory();
    } catch (err) {
      setError('Không thể xóa công việc');
    }
  };

  const handleUpdateTaskStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'COMPLETED') {
        // Call complete endpoint
        await axios.post(`${apiBaseUrl}/api/tasks/${id}/complete`);
      } else {
        // Update status normally
        const task = tasks.find(t => t.id === id);
        await axios.put(`${apiBaseUrl}/api/tasks/${id}`, {
          ...task,
          status: newStatus
        });
      }
      fetchTasks();
      fetchTasksByTimeCategory();
      fetchCompletedTasks();
    } catch (err) {
      setError('Không thể cập nhật công việc');
    }
  };

  // Hàm xác định danh mục thời gian của task
  const getTaskTimeCategory = (task) => {
    const now = new Date();
    const start = new Date(task.startDate);
    const end = new Date(task.endDate);

    if (now < start) {
      return 'PENDING'; // Trước thời gian bắt đầu
    } else if (now > end) {
      return 'LATE'; // Quá hạn
    } else {
      return 'IN_PROCESS'; // Trong thời gian làm
    }
  };

  // Hàm return tasks từ state (đã tính toán từ backend)
  const getTasksByTimeCategory = () => {
    return {
      pending: tasksByCategory.pending || [],
      inProgress: tasksByCategory.inProgress || [],
      late: tasksByCategory.late || []
    };
  };

  return (
    <>
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="app">
          <header className="header">
            <div className="header-content">
              <div>
                <h1>Hệ Thống Quản Lý Công Việc</h1>
                <p>Kiến Trúc Microservice với React, Java Spring, MySQL & Docker</p>
              </div>
              <div className="user-info">
                <span>Xin chào, <strong>{currentUser?.fullName}</strong>!</span>
                <button onClick={handleLogout} className="btn-logout">Đăng Xuất</button>
              </div>
            </div>
          </header>

          <div className="container">
            <div className="board-header">
              <div className="tabs">
                <button 
                  className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tasks')}
                >
                  Công Việc
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActiveTab('history')}
                >
                  Lịch Sử
                </button>
              </div>
              {activeTab === 'tasks' && (
                <button 
                  onClick={() => setShowAddTaskModal(true)} 
                  className="btn-add-task-header"
                >
                  Thêm Công Việc Mới
                </button>
              )}
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="list-section">
              {activeTab === 'tasks' ? (
                // TASKS TAB
                loading ? (
                  <p>Đang tải công việc...</p>
                ) : (
                  <div className="kanban-board">
                      {/* PENDING Column */}
                      <div className="kanban-column">
                        <div className="column-header pending">
                          <h3>Chưa Bắt Đầu</h3>
                          <span className="count">{getTasksByTimeCategory().pending.length}</span>
                        </div>
                        <div className="tasks-column">
                          {getTasksByTimeCategory().pending.length === 0 ? (
                            <p className="empty-state">Không có công việc chưa bắt đầu</p>
                          ) : (
                            getTasksByTimeCategory().pending.map(task => (
                              <div key={task.id} className="task-card">
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <div className="task-meta">
                                  <span className="status pending">
                                    PENDING
                                  </span>
                                </div>
                                <div className="task-time">
                                  <small>Bắt đầu: {new Date(task.startDate).toLocaleString('vi-VN')}</small>
                                  <small>Kết thúc: {new Date(task.endDate).toLocaleString('vi-VN')}</small>
                                </div>
                                <div className="task-actions">
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="btn-delete"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* IN_PROCESS Column */}
                      <div className="kanban-column">
                        <div className="column-header in-process">
                          <h3>Đang Thực Hiện</h3>
                          <span className="count">{getTasksByTimeCategory().inProgress.length}</span>
                        </div>
                        <div className="tasks-column">
                          {getTasksByTimeCategory().inProgress.length === 0 ? (
                            <p className="empty-state">Không có công việc đang thực hiện</p>
                          ) : (
                            getTasksByTimeCategory().inProgress.map(task => (
                              <div key={task.id} className="task-card">
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <div className="task-meta">
                                  <span className="status in_progress">
                                    IN PROGRESS
                                  </span>
                                </div>
                                <div className="task-time">
                                  <small>Kết thúc: {new Date(task.endDate).toLocaleString('vi-VN')}</small>
                                </div>
                                <div className="task-actions">
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                                    className="btn-complete"
                                  >
                                    Hoàn Thành
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* LATE Column */}
                      <div className="kanban-column">
                        <div className="column-header late">
                          <h3>Quá Hạn</h3>
                          <span className="count">{getTasksByTimeCategory().late.length}</span>
                        </div>
                        <div className="tasks-column">
                          {getTasksByTimeCategory().late.length === 0 ? (
                            <p className="empty-state">Không có công việc quá hạn</p>
                          ) : (
                            getTasksByTimeCategory().late.map(task => (
                              <div key={task.id} className="task-card">
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <div className="task-meta">
                                  <span className="status late">
                                    LATE
                                  </span>
                                </div>
                                <div className="task-time">
                                  <small>Hạn dự kiến: {new Date(task.endDate).toLocaleString('vi-VN')}</small>
                                </div>
                                <div className="task-actions">
                                  <button
                                    onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                                    className="btn-complete"
                                  >
                                    Hoàn Thành
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="btn-delete"
                                  >
                                    Xóa
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                  </div>
                )
              ) : (
                // HISTORY TAB
                <div className="history-view">
                  <div className="history-section">
                    <h3>Hoàn Thành Đúng Hạn</h3>
                    <div className="history-column">
                      {completedTasks.onTime.length === 0 ? (
                        <p className="empty-state">Chưa có công việc hoàn thành đúng hạn</p>
                      ) : (
                        completedTasks.onTime.map(task => (
                          <div key={task.id} className="task-card">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <div className="task-time">
                              <small>Kết thúc: {new Date(task.endDate).toLocaleString('vi-VN')}</small>
                              <small>Hoàn thành lúc: {new Date(task.completedAt).toLocaleString('vi-VN')}</small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="history-section">
                    <h3>Hoàn Thành Trễ</h3>
                    <div className="history-column">
                      {completedTasks.late.length === 0 ? (
                        <p className="empty-state">Chưa có công việc hoàn thành trễ</p>
                      ) : (
                        completedTasks.late.map(task => (
                          <div key={task.id} className="task-card">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <div className="task-time">
                              <small>Kết thúc: {new Date(task.endDate).toLocaleString('vi-VN')}</small>
                              <small>Hoàn thành lúc: {new Date(task.completedAt).toLocaleString('vi-VN')}</small>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Add Task */}
            {showAddTaskModal && (
              <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Thêm Công Việc Mới</h2>
                    <button 
                      onClick={() => {
                        setShowAddTaskModal(false);
                        setTaskTitle('');
                        setTaskDescription('');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="btn-modal-close"
                    >
                      X
                    </button>
                  </div>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask(e);
                    setShowAddTaskModal(false);
                  }} className="modal-form">
                    <div className="form-group">
                      <label>Tiêu Đề Công Việc *</label>
                      <input
                        type="text"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="Nhập tiêu đề công việc"
                      />
                    </div>
                    <div className="form-group">
                      <label>Mô Tả</label>
                      <textarea
                        value={taskDescription}
                        onChange={(e) => setTaskDescription(e.target.value)}
                        placeholder="Nhập mô tả công việc"
                      />
                    </div>
                    <div className="form-group">
                      <label>Ngày Bắt Đầu & Thời Gian *</label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Ngày Kết Thúc & Thời Gian *</label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="submit" className="btn-submit">Thêm</button>
                      <button 
                        type="button"
                        onClick={() => setShowAddTaskModal(false)}
                        className="btn-cancel"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
