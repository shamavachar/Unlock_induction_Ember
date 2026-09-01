import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerStudentThunk, clearAuthError } from "../../../store/slices/authSlice";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";

export const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      rollNumber: "",
    },
  });

  const onSubmit = async (data) => {
    dispatch(clearAuthError());
    const result = await dispatch(registerStudentThunk(data));
    if (registerStudentThunk.fulfilled.match(result)) {
      navigate("/menu", { replace: true });
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
        label="Full Name *"
        placeholder="Rahul Sharma"
        {...register("name", { required: "Name is required" })}
        error={errors.name?.message}
      />

      <Input
        label="College Email *"
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
        label="Password *"
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <Input
          label="Phone Number"
          placeholder="9876543210"
          {...register("phone")}
          error={errors.phone?.message}
        />

        <Input
          label="Roll Number"
          placeholder="CS-2024-042"
          {...register("rollNumber")}
          error={errors.rollNumber?.message}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        style={{ width: "100%", marginTop: "0.5rem" }}
      >
        Register & Start Ordering
      </Button>

      <div
        style={{
          marginTop: "1.25rem",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
        }}
      >
        Already registered?{" "}
        <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
          Sign In
        </Link>
      </div>
    </form>
  );
};
