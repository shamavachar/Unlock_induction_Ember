import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginStudentThunk, clearAuthError } from "../../../store/slices/authSlice";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";

export const StudentLoginForm = () => {
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
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(loginStudentThunk(data));
    if (loginStudentThunk.fulfilled.match(result)) {
      const from = location.state?.from?.pathname || "/menu";
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        label="College Email Address"
        type="email"
        placeholder="rahul@college.edu"
        {...register("email", {
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: "Enter a valid email address",
          },
        })}
        error={errors.email?.message}
      />

      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        {...register("password", {
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        })}
        error={errors.password?.message}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        style={{ width: "100%", marginTop: "0.5rem" }}
      >
        Sign In to Order
      </Button>

      <div
        style={{
          marginTop: "1.25rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        New student?{" "}
        <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Create an Account
        </Link>
      </div>

      <div
        style={{
          marginTop: "0.75rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        Are you Canteen Staff?{" "}
        <Link to="/admin/login" style={{ color: "var(--color-text-main)", fontWeight: 500 }}>
          Staff Login →
        </Link>
      </div>
    </form>
  );
};
