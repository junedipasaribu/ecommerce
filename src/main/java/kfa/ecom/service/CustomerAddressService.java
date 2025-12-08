package kfa.ecom.service;

import kfa.ecom.entity.CustomerAddress;
import kfa.ecom.entity.User;
import kfa.ecom.repository.CustomerAddressRepository;
import kfa.ecom.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerAddressService {

    private final UserRepository userRepository;
    private final CustomerAddressRepository addressRepository;

    /** Tambah alamat baru */
    public void addAddress(Long userId, CustomerAddress req){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Jika user belum punya alamat → alamat pertama otomatis jadi primary
        boolean isFirstAddress = addressRepository.findByUserOrderByCreatedAtDesc(user).isEmpty();
        if (isFirstAddress) {
            req.setIsPrimary(true);
        }

        req.setUser(user);
        req.setCreatedAt(LocalDateTime.now());
        addressRepository.save(req);
    }

    /** Get semua alamat user */
    public List<CustomerAddress> getMyAddresses(Long userId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return addressRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /** 🔥 Update alamat (A3) */
    public void updateAddress(Long userId, Long addressId, CustomerAddress req) {
        CustomerAddress existing = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Pastikan alamat milik user yang sedang login
        if (!existing.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to update this address");
        }

        // Update field yang boleh diubah
        existing.setLabel(req.getLabel());
        existing.setReceiver(req.getReceiver());
        existing.setPhone(req.getPhone());
        existing.setFullAddress(req.getFullAddress());
        existing.setCity(req.getCity());
        existing.setProvince(req.getProvince());
        existing.setPostalCode(req.getPostalCode());
        // isPrimary & createdAt & user TIDAK diubah di sini

        addressRepository.save(existing);
    }

    /** Set alamat utama (A4) */
    public void setPrimary(Long userId, Long addressId){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Matikan primary lama
        addressRepository.findByUserAndIsPrimaryTrue(user)
                .ifPresent(old -> {
                    old.setIsPrimary(false);
                    addressRepository.save(old);
                });

        // Nyalakan primary baru
        CustomerAddress newPrimary = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!newPrimary.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to update this address");
        }

        newPrimary.setIsPrimary(true);
        addressRepository.save(newPrimary);
    }

    /** Hapus alamat (A5) */
    public void delete(Long userId, Long addressId){
        CustomerAddress addr = addressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (!addr.getUser().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to delete this address");
        }

        // Prevent: alamat primary tidak boleh langsung dihapus
        if (Boolean.TRUE.equals(addr.getIsPrimary())) {
            throw new RuntimeException("Primary address cannot be deleted. Set another address as primary first.");
        }

        addressRepository.delete(addr);
    }
}
