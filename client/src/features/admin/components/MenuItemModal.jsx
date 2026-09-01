import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  createMenuItemThunk,
  updateMenuItemThunk,
} from "../../../store/slices/menuSlice";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";
import { Button } from "../../../components/common/Button";
import { CATEGORIES } from "../../../constants";

export const MenuItemModal = ({ isOpen, onClose, editingItem = null }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: 50,
      category: "Snacks",
      isVeg: true,
      stockQuantity: 50,
      preparationTimeMinutes: 5,
      image: "",
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        name: editingItem.name,
        description: editingItem.description || "",
        price: editingItem.price,
        category: editingItem.category || "Snacks",
        isVeg: editingItem.isVeg ?? true,
        stockQuantity: editingItem.stockQuantity ?? 50,
        preparationTimeMinutes: editingItem.preparationTimeMinutes ?? 5,
        image: editingItem.image || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 50,
        category: "Snacks",
        isVeg: true,
        stockQuantity: 50,
        preparationTimeMinutes: 5,
        image: "",
      });
    }
  }, [editingItem, reset, isOpen]);

  const onSubmit = async (data) => {
    const formattedData = {
      ...data,
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      preparationTimeMinutes: Number(data.preparationTimeMinutes),
      isVeg: Boolean(data.isVeg),
    };

    if (editingItem) {
      await dispatch(updateMenuItemThunk({ id: editingItem._id, itemData: formattedData }));
    } else {
      await dispatch(createMenuItemThunk(formattedData));
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "Edit Food Item" : "Add New Food Item"}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Food Item Name *"
          placeholder="e.g. Masala Dosa"
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Crispy crepe served with coconut chutney & sambar"
            {...register("description")}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input
            label="Price (₹) *"
            type="number"
            {...register("price", { required: "Price is required", min: 1 })}
            error={errors.price?.message}
          />

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className="form-select" {...register("category")}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Input
            label="Stock Quantity *"
            type="number"
            {...register("stockQuantity", { required: "Stock is required", min: 0 })}
            error={errors.stockQuantity?.message}
          />

          <Input
            label="Prep Time (Minutes) *"
            type="number"
            {...register("preparationTimeMinutes", { min: 1 })}
            error={errors.preparationTimeMinutes?.message}
          />
        </div>

        <Input
          label="Image URL (Optional)"
          placeholder="https://images.unsplash.com/..."
          {...register("image")}
        />

        <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <input type="checkbox" id="isVeg" {...register("isVeg")} style={{ width: "16px", height: "16px" }} />
          <label htmlFor="isVeg" style={{ fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>
            Is Vegetarian (Veg)
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.25rem" }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {editingItem ? "Save Changes" : "Create Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
