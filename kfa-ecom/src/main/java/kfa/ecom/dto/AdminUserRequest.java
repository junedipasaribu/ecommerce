package kfa.ecom.dto;

import lombok.Data;

@Data
public class AdminUserRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String role; // USER, ADMIN
    private String password; // Only for create user
}