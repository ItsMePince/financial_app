package my_financial_app.demo;

import my_financial_app.demo.Entity.User;
import my_financial_app.demo.Repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;

import org.springframework.http.*;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class AuthControllerIT {

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void register_then_login_success() {
        // ---------- REGISTER ----------
        Map<String, Object> registerBody = Map.of(
                "username", "alice",
                "password", "123456",
                "email", "alice@example.com"
        );

        ResponseEntity<Map> regRes = rest.exchange(
                "/api/auth/register",
                HttpMethod.POST,
                json(registerBody),
                Map.class
        );

        assertThat(regRes.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(regRes.getBody()).isNotNull();
        assertThat(regRes.getBody().get("success")).isEqualTo(true);
        assertThat(userRepository.existsByUsername("alice")).isTrue();

        // ---------- LOGIN ----------
        Map<String, Object> loginBody = Map.of(
                "username", "alice",
                "password", "123456"
        );

        ResponseEntity<Map> loginRes = rest.exchange(
                "/api/auth/login",
                HttpMethod.POST,
                json(loginBody),
                Map.class
        );

        assertThat(loginRes.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(loginRes.getBody()).isNotNull();
        assertThat(loginRes.getBody().get("success")).isEqualTo(true);

        Map<?, ?> user = (Map<?, ?>) loginRes.getBody().get("user");
        assertThat(user.get("username")).isEqualTo("alice");
        assertThat(user.get("email")).isEqualTo("alice@example.com");
    }

    @Test
    void register_duplicate_username_should_fail() {
        userRepository.save(new User("bob", "secret123", "bob@example.com"));

        Map<String, Object> body = Map.of(
                "username", "bob",
                "password", "another",
                "email", "bob2@example.com"
        );

        ResponseEntity<Map> res = rest.exchange(
                "/api/auth/register",
                HttpMethod.POST,
                json(body),
                Map.class
        );

        assertThat(res.getStatusCode().is4xxClientError()).isTrue();
        assertThat(res.getBody()).isNotNull();
        assertThat(res.getBody().get("success")).isEqualTo(false);
        assertThat(res.getBody().get("message").toString().toLowerCase()).contains("username");
    }

    // ---------- Helper ----------
    private static HttpEntity<Map<String, Object>> json(Map<String, Object> body) {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(body, h);
    }
}
