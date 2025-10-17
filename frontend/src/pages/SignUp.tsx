import React, { useState, ChangeEvent, FormEvent } from "react";
import { UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import "./SignUp.css";
import { api } from "../api";

type SignUpValues = {
    email: string;
    username: string;
    password: string;
};

interface SignUpResponse {
    success: boolean;
    message: string;
    user?: {
        username: string;
        email: string;
        role: string;
    };
}

interface SignUpProps {
    onSubmit?: (values: SignUpValues) => void;
    onSignUpSuccess?: (user: any) => void;
    onSwitchToLogin?: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSubmit, onSignUpSuccess }) => {
    const [form, setForm] = useState<SignUpValues>({
        email: "",
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.email || !form.username || !form.password) {
            setError("Please fill in all fields.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            if (onSubmit) {
                onSubmit(form);
                return;
            }

            const data: SignUpResponse = await api.post("/auth/signup", {
                email: form.email,
                username: form.username,
                password: form.password,
            });

            if (data.success && data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));
                if (onSignUpSuccess) {
                    onSignUpSuccess(data.user);
                } else {
                    window.location.href = "/";
                }
            } else {
                setError(data.message || "Sign up failed.");
            }
        } catch (err: any) {
            console.error("Signup error:", err);
            setError(err?.message || "Unable to connect. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-page">
            <div className="su-wrapper">
                <div className="su-avatar" aria-hidden="true">
                    <UserRound size={36} />
                </div>

                <h1 className="su-title">Sign up</h1>

                <form className="su-form" onSubmit={handleSubmit} noValidate>
                    <label htmlFor="email" className="su-label">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="su-input"
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <label htmlFor="username" className="su-label">Username</label>
                    <input
                        id="username"
                        name="username"
                        className="su-input"
                        placeholder=""
                        autoComplete="username"
                        required
                        value={form.username}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <label htmlFor="password" className="su-label">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="su-input"
                        placeholder="at least 6 characters"
                        autoComplete="new-password"
                        required
                        value={form.password}
                        onChange={handleChange}
                        disabled={loading}
                    />

                    {error && (
                        <div
                            style={{
                                color: "#ef4444",
                                fontSize: "14px",
                                textAlign: "center",
                                margin: "8px 0",
                                padding: "8px",
                                background: "#fef2f2",
                                borderRadius: "8px",
                                border: "1px solid #fecaca",
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <button type="submit" className="su-submit" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>
                </form>

                <p className="su-footer">
                    Already have an account?{" "}
                    <Link className="su-link" to="/login">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
