package kfa.ecom.dto;

import lombok.Data;

/**
 * DTO untuk request registrasi user baru.
 */
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
    private String pin;
}
