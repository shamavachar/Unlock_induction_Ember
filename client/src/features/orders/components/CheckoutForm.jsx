import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { placeOrderThunk } from "../../../store/slices/orderSlice";
import { clearCart } from "../../../store/slices/cartSlice";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { PAYMENT_METHODS } from "../../../constants";
import { useNavigate } from "react-router-dom";
import { QrCode, Banknote, CreditCard, Wallet, CheckCircle2 } from "lucide-react";

export const CheckoutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { items, notes, totalAmount, estimatedPrepTime } = useSelector((state) => state.cart);
  const { isPlacingOrder, error } = useSelector((state) => state.orders);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      studentName: user?.name || "",
      studentPhone: user?.phone || "",
      studentRollNumber: user?.rollNumber || "",
      paymentMethod: "Cash",
    },
  });

  const selectedPayment = watch("paymentMethod");

  const getPaymentIcon = (id) => {
    switch (id) {
      case "UPI": return <QrCode size={18} />;
      case "Card": return <CreditCard size={18} />;
      case "Wallet": return <Wallet size={18} />;
      default: return <Banknote size={18} />;
    }
  };

  const onSubmit = async (data) => {
    if (items.length === 0) return;

    const payload = {
      studentName: data.studentName,
      studentPhone: data.studentPhone,
      studentRollNumber: data.studentRollNumber,
      paymentMethod: data.paymentMethod,
      notes: notes,
      items: items.map((item) => ({
        menuItem: item.menuItemId,
        quantity: item.quantity,
      })),
    };

    const result = await dispatch(placeOrderThunk(payload));
    if (placeOrderThunk.fulfilled.match(result)) {
      const order = result.payload;
      dispatch(clearCart());
      navigate(`/track/${order.tokenNumber}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <div
          style={{
            background: "var(--color-cancelled-bg)",
            color: "var(--color-cancelled-text)",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Student Details */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Student Pickup Details
        </h3>

        <Input
          label="Student Full Name *"
          placeholder="e.g. Rahul Sharma"
          {...register("studentName", { required: "Name is required" })}
          error={errors.studentName?.message}
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input
            label="Phone Number"
            placeholder="9876543210"
            {...register("studentPhone")}
            error={errors.studentPhone?.message}
          />
          <Input
            label="Roll / ID Number"
            placeholder="CS-2024-042"
            {...register("studentRollNumber")}
            error={errors.studentRollNumber?.message}
          />
        </div>
      </div>

      {/* Payment Selection */}
      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>
          Select Payment Mode
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPayment === method.id;
            return (
              <label
                key={method.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: isSelected ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                  background: isSelected ? "var(--color-primary-light)" : "var(--color-bg-surface)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <input
                  type="radio"
                  value={method.id}
                  {...register("paymentMethod")}
                  style={{ display: "none" }}
                />
                <div style={{ color: isSelected ? "var(--color-primary)" : "var(--color-text-muted)" }}>
                  {getPaymentIcon(method.id)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: isSelected ? "var(--color-primary)" : "var(--color-text-main)" }}>
                    {method.label}
                  </p>
                </div>
                {isSelected && <CheckCircle2 size={16} color="var(--color-primary)" />}
              </label>
            );
          })}
        </div>
      </div>

      {/* Place Order CTA */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPlacingOrder}
        style={{ width: "100%" }}
      >
        Confirm Order & Generate Token (₹{totalAmount})
      </Button>
    </form>
  );
};
