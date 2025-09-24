package my_financial_app.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import my_financial_app.demo.Controller.ContentController;
import my_financial_app.demo.Entity.Role;
import my_financial_app.demo.Entity.User;
import my_financial_app.demo.Repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc(addFilters = false)
@WebMvcTest(ContentController.class)
class ContentControllerTest {

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper om;

    @MockBean UserRepository userRepository;

    // -------- helper: set field via reflection (id / role) --------
    private User mkUser(Long id, String username, String email) {
        User u = new User();
        try {
            Field fid = User.class.getDeclaredField("id");
            fid.setAccessible(true);
            fid.set(u, id);
        } catch (Exception ignore) {}
        try {
            Field frole = User.class.getDeclaredField("role");
            frole.setAccessible(true);
            frole.set(u, Role.USER); // กัน NPE ใน controller ที่เรียก getRole().toString()
        } catch (Exception ignore) {}
        u.setUsername(username);
        u.setEmail(email);
        u.setPassword("secret");
        return u;
    }

    // ---------- GET /api/user/profile/{id} ----------
    @Test
    void getUserProfile_found_returnsOk() throws Exception {
        var user = mkUser(5L, "alice", "alice@ex.com");
        Mockito.when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        mvc.perform(get("/api/user/profile/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.username").value("alice"))
                .andExpect(jsonPath("$.email").value("alice@ex.com"));
        // ไม่ assert role/วันที่ เพื่อกันความแตกต่างในอนาคต
    }

    @Test
    void getUserProfile_notFound_returns404() throws Exception {
        Mockito.when(userRepository.findById(999L)).thenReturn(Optional.empty());

        mvc.perform(get("/api/user/profile/999"))
                .andExpect(status().isNotFound());
    }

    // ---------- GET /api/dashboard/stats ----------
    @Test
    void getDashboardStats_ok_includesKeyNumbers() throws Exception {
        Mockito.when(userRepository.count()).thenReturn(100L);
        Mockito.when(userRepository.countActiveUsersToday()).thenReturn(7L);

        mvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(100))
                .andExpect(jsonPath("$.activeUsers").value(7))
                // ค่าอื่นเป็นสุ่ม: ตรวจว่าเป็น number/มีอยู่พอ
                .andExpect(jsonPath("$.totalOrders").exists())
                .andExpect(jsonPath("$.revenue").exists())
                .andExpect(jsonPath("$.userGrowth").exists());
    }

    // ---------- GET /api/users/list ----------
    @Test
    void getUsersList_ok_returnsUsersAndPagingEcho() throws Exception {
        var u1 = mkUser(1L, "bob", "bob@ex.com");
        var u2 = mkUser(2L, "cate", "cate@ex.com");
        Mockito.when(userRepository.findAll()).thenReturn(List.of(u1, u2));

        mvc.perform(get("/api/users/list")
                        .param("page", "2")
                        .param("size", "5")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(2))
                .andExpect(jsonPath("$.page").value(2))
                .andExpect(jsonPath("$.size").value(5))
                .andExpect(jsonPath("$.users[0].id").value(1))
                .andExpect(jsonPath("$.users[0].username").value("bob"))
                .andExpect(jsonPath("$.users[1].id").value(2))
                .andExpect(jsonPath("$.users[1].username").value("cate"));
    }

    // ---------- GET /api/public/health ----------
    @Test
    void healthCheck_ok_returnsStatusAndUserCount() throws Exception {
        Mockito.when(userRepository.count()).thenReturn(42L);

        mvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OK"))
                .andExpect(jsonPath("$.userCount").value(42))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
