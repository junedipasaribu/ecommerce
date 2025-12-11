package kfa.ecom.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String name;
    private String phone;
    private String address;
    // Note: email dan password tidak bisa diubah melalui endpoint ini
    // untuk security reasons
}