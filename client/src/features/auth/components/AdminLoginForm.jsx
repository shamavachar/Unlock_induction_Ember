import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginAdminThunk, clearAuthError } from "../../../store/slices/authSlice";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

export const AdminLoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "canteen_admin",
      password: "admin@canteen123",
    },
  });

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(loginAdminThunk(data));
    if (loginAdminThunk.fulfilled.match(result)) {
      const from = location.state?.from?.pathname || "/staff/kitchen";
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem",
          background: "var(--color-bg-subtle)",
          borderRadius: "var(--radius-md)",
          marginBottom: "1.25rem",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        <ShieldCheck size={20} color="var(--color-primary)" />
        <span>Authorized Kitchen & Canteen Staff portal only.</span>
      </div>

      {error && (
        <div
          style={{
            background: "var(--color-cancelled-bg)",
            color: "var(--color-cancelled-text)",
            padding: "0.6rem 0.8rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <Input
        label="Staff Username"
        placeholder="canteen_admin"
        {...register("username", { required: "Staff username is required" })}
        error={errors.username?.message}
      />

      <Input
        label="Staff Password"
        type="password"
        placeholder="••••••••••••"
        {...register("password", { required: "Password is required" })}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        style={{ width: "100%", marginTop: "0.5rem" }}
      >
        Access Staff Dashboard
      </Button>

      <div
        style={{
          marginTop: "1.25rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        Student?{" "}
        <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Switch to Student Login →
        </Link>
      </div>
    </form>
  );
};
