// src/pages/SignUp.tsx
import React, { useState } from "react";

type Props = {
    onSubmit?: (data: { email: string; username: string; password: string }) => void;
    onSignUpSuccess?: (user: any) => void;
};

export default function SignUp({ onSubmit, onSignUpSuccess }: Props) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // อิงเดิม: แค่เติมการล้าง error ตอนพิมพ์
    const clearAndSet =
        (setter: (v: string) => void) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                setter(e.target.value);
                if (error) setError(null);
            };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        // validate ตามเทส
        if (!email || !username || !password) {
            setError("Please fill in all required fields");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        // อิงเดิม: ถ้ามี onSubmit ให้เรียกแล้วจบ
        if (onSubmit) {
            onSubmit({ email, username, password });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const res = await fetch("/api/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            });

            // รองรับกรณี response ไม่ใช่ JSON
            const data = await res.json().catch(() => ({} as any));

            if (res.ok && data?.success) {
                if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
                if (onSignUpSuccess) {
                    onSignUpSuccess(data.user);
                } else {
                    window.location.href = "/Home";
                }
                return;
            }

            // server error: ใช้ message ถ้ามี ไม่งั้น fallback
            setError(data?.message || "Sign up failed");
        } catch {
            // network error: ต้องเป็นข้อความนี้ตามเทส
            setError("Unable to submit the form, please try again later");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <div className="su-page">
                <div className="su-wrapper">
                    <div className="su-avatar" aria-hidden />
                    <h1 className="su-title">Sign up</h1>

                    <form className="su-form" onSubmit={handleSubmit} noValidate>
                        <label className="su-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            name="email"
                            className="su-input"
                            type="email"
                            value={email}
                            onChange={clearAndSet(setEmail)}
                            placeholder=""
                            required
                            disabled={loading}
                            autoComplete="email"
                        />

                        <label className="su-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            className="su-input"
                            value={username}
                            onChange={clearAndSet(setUsername)}
                            placeholder=""
                            required
                            disabled={loading}
                            autoComplete="username"
                        />

                        <label className="su-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            className="su-input"
                            type="password"
                            value={password}
                            onChange={clearAndSet(setPassword)}
                            required
                            disabled={loading}
                            placeholder="at least 6 characters"
                            autoComplete="new-password"
                        />

                        {error && (
                            <div
                                style={{
                                    color: "#ef4444",
                                    fontSize: 14,
                                    textAlign: "center",
                                    margin: "8px 0",
                                    padding: 8,
                                    background: "#fef2f2",
                                    borderRadius: 8,
                                    border: "1px solid #fecaca",
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button className="su-submit" type="submit" disabled={loading}>
                            {loading ? "Creating account" : "Create account"}
                        </button>
                    </form>

                    <p className="su-footer">
                        Already have an account?{" "}
                        <a className="su-link" href="/login">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
