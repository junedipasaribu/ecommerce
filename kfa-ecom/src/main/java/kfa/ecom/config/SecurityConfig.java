package kfa.ecom.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // ✅ Tambahkan ini untuk @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // 🔒 PERBAIKI CORS: Lebih secure
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        // Public area — tidak perlu token
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ Products endpoints - GET public, POST/PUT/DELETE untuk admin
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products/**").permitAll() // Temporary for testing
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").permitAll() // Temporary for testing
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").permitAll() // Temporary for testing
                        
                        // ✅ Categories endpoints
                        .requestMatchers("/api/categories/**").permitAll()

                        // ✅ Swagger hanya di development (bisa dihandle dengan profile)
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // ✅ Endpoint untuk testing/development saja
                        .requestMatchers("/error", "/actuator/health").permitAll()

                        // User role endpoints
                        // ✅ Gunakan pattern yang lebih umum, detail di controller
                        .requestMatchers("/api/cart/**").authenticated() // ✅ Ubah ke authenticated()
                        .requestMatchers("/api/addresses/**").authenticated()
                        .requestMatchers("/api/orders/**").authenticated()
                        .requestMatchers("/api/payments/**").authenticated()
                        .requestMatchers("/api/shipping/my/**").authenticated()

                        // User profile endpoints
                        .requestMatchers("/api/users/profile/**").authenticated()
                        .requestMatchers("/api/users/test").permitAll()

                        // Admin role endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/orders/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/shipping/**").hasRole("ADMIN")
                        .requestMatchers("/api/dashboard/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/admin/**").hasRole("ADMIN")

                        // ✅ Tambah endpoint umum untuk user
                        .requestMatchers("/api/user/**").authenticated()
                        .requestMatchers("/api/profile/**").authenticated()

                        // Other endpoints → butuh login
                        .anyRequest().authenticated()
                )

                // ✅ Tambah exception handling
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(401);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}"
                            );
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(403);
                            response.setContentType("application/json");
                            response.getWriter().write(
                                    "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Insufficient permissions\"}"
                            );
                        })
                );

        // 🔥 Masukkan JwtFilter sebagai pengganti session login
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // ✅ Allowed origins yang lebih spesifik
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "http://192.168.*.*:*",
                "https://*.ecom-app.com" // Ganti dengan domain production
        ));

        // ✅ Allowed methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"
        ));

        // ✅ Allowed headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "Accept",
                "Origin",
                "X-Requested-With",
                "Cache-Control"
        ));

        // ✅ Exposed headers
        configuration.setExposedHeaders(List.of(
                "Authorization",
                "X-Total-Count"
        ));

        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L); // 1 hour cache

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}