package kfa.ecom.controller;

import kfa.ecom.entity.CustomerAddress;
import kfa.ecom.service.CustomerAddressService;
import kfa.ecom.util.JwtUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final CustomerAddressService service;
    private final JwtUser jwtUser;

    // A1 - Tambah alamat
    @PostMapping
    public ResponseEntity<?> addAddress(@RequestBody CustomerAddress req){
        service.addAddress(jwtUser.getUserId(), req);
        return ResponseEntity.ok("Address added");
    }

    // A2 - Lihat semua alamat saya
    @GetMapping
    public ResponseEntity<List<CustomerAddress>> myAddresses(){
        return ResponseEntity.ok(service.getMyAddresses(jwtUser.getUserId()));
    }

    // 🔥 A3 - Ubah alamat
    @PutMapping("/{addressId}")
    public ResponseEntity<?> updateAddress(@PathVariable Long addressId,
                                           @RequestBody CustomerAddress req) {
        service.updateAddress(jwtUser.getUserId(), addressId, req);
        return ResponseEntity.ok("Address updated");
    }

    // A4 - Set primary address
    @PatchMapping("/{addressId}/primary")
    public ResponseEntity<?> setPrimary(@PathVariable Long addressId){
        service.setPrimary(jwtUser.getUserId(), addressId);
        return ResponseEntity.ok("Primary address updated");
    }

    // A5 - Hapus alamat
    @DeleteMapping("/{addressId}")
    public ResponseEntity<?> delete(@PathVariable Long addressId){
        service.delete(jwtUser.getUserId(), addressId);
        return ResponseEntity.ok("Address deleted");
    }
}
