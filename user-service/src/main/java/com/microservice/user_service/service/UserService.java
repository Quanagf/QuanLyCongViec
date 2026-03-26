package com.microservice.user_service.service;

import com.microservice.user_service.dto.UserDTO;
import com.microservice.user_service.entity.User;
import com.microservice.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Get all users
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    // Get user by ID
    public UserDTO getUserById(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    // Get user by username
    public UserDTO getUserByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    // Get user by email
    public UserDTO getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(this::convertToDTO).orElse(null);
    }
    
    // Create user
    public UserDTO createUser(UserDTO userDTO) {
        User user = convertToEntity(userDTO);
        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }
    
    // Update user
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setUsername(userDTO.getUsername());
            user.setEmail(userDTO.getEmail());
            user.setFullName(userDTO.getFullName());
            user.setPassword(userDTO.getPassword());
            User updatedUser = userRepository.save(user);
            return convertToDTO(updatedUser);
        }
        return null;
    }
    
    // Delete user
    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    // Utility methods for DTO conversion
    private UserDTO convertToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPassword()
        );
    }
    
    private User convertToEntity(UserDTO userDTO) {
        return new User(
                userDTO.getId(),
                userDTO.getUsername(),
                userDTO.getEmail(),
                userDTO.getFullName(),
                userDTO.getPassword()
        );
    }
}
