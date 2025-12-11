package kfa.ecom.dto;

import lombok.Data;

/**
 * DTO untuk request login.
 */
@Data
public class LoginRequest {
    private String email;
    private String password;
}
