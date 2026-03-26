import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!username || !password) {
      setError('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    try {
      setLoading(true);
      // Get all users and find matching username
      const response = await axios.get(`${apiBaseUrl}/api/users`);
      const user = response.data.find(u => u.username === username);
      
      if (!user) {
        setError('Tên người dùng không tìm thấy');
        return;
      }

      // Simple password check (in production, use proper authentication API)
      if (user.password !== password) {
        setError('Mật khẩu không chính xác');
        return;
      }

      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }));
      localStorage.setItem('isLoggedIn', 'true');

      setSuccess('Đăng nhập thành công!');
      setTimeout(() => {
        onLoginSuccess(user);
      }, 500);
    } catch (err) {
      setError('Đăng nhập thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !fullName || !password) {
      setError('Vui lòng điền đầy đủ tất cả các trường');
      return;
    }

    try {
      setLoading(true);
      const newUser = {
        username,
        email,
        fullName,
        password
      };
      await axios.post(`${apiBaseUrl}/api/users`, newUser);
      
      setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.');
      setTimeout(() => {
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setEmail('');
        setFullName('');
      }, 2000);
    } catch (err) {
      setError('Đăng ký thất bại: ' + (err.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Hệ Thống Quản Lý Công Việc</h1>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!isRegistering ? (
          <form onSubmit={handleLogin}>
            <h2>Đăng Nhập</h2>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập của bạn"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
            <p className="toggle-form">
              Chưa có tài khoản? 
              <a onClick={() => {
                setIsRegistering(true);
                setError('');
                setSuccess('');
              }}>Đăng ký ở đây</a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Đăng Ký</h2>
            <div className="form-group">
              <label>ᵰÔn Đầy Đủ</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên đầy đủ của bạn"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Chọn một tên đăng nhập"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
            </button>
            <p className="toggle-form">
              Đã có tài khoản? 
              <a onClick={() => {
                setIsRegistering(false);
                setError('');
                setSuccess('');
                setUsername('');
                setPassword('');
              }}>Đăng nhập ở đây</a>
            </p>
          </form>
        )}}
      </div>
    </div>
  );
}

export default Login;
