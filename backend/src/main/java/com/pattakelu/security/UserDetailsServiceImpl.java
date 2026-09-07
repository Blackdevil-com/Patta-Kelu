package com.pattakelu.security;

import com.pattakelu.entity.User;
import com.pattakelu.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByUsername(identifier));

        if (userOpt.isEmpty()) {
            try {
                UUID uuid = UUID.fromString(identifier);
                userOpt = userRepository.findById(uuid);
            } catch (IllegalArgumentException ignored) {}
        }

        User user = userOpt.orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        return toUserDetails(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId));

        return toUserDetails(user);
    }

    private UserDetails toUserDetails(User user) {
        return new org.springframework.security.core.userdetails.User(
                user.getId().toString(),
                user.getPasswordHash() != null ? user.getPasswordHash() : "",
                user.getEnabled(),
                true,
                true,
                true,
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList())
        );
    }
}
