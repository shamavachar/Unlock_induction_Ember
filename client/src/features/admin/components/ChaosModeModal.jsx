import React, { useState } from "react";
import { menuService } from "../../../services/menuService";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { AlertTriangle, Zap } from "lucide-react";

export const ChaosModeModal = ({ isOpen, onClose }) => {
  const [stockPerItem, setStockPerItem] = useState(10);
  const [customMessage, setCustomMessage] = useState("🔥 CANTEEN RUSH HOUR! Limited stock remaining on top items.");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTrigger = async () => {
    try {
      setIsLoading(true);
      await menuService.triggerChaosMode({
        stockPerItem: Number(stockPerItem),
        message: customMessage,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      alert("Failed to trigger chaos mode: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Activate Canteen Chaos / Rush Mode">
      <div>
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fee2e2",
            color: "#991b1b",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <AlertTriangle size={20} flexShrink={0} />
          <div>
            <strong>Warning:</strong> Activating Rush Mode will mark non-popular items as out of stock, cap remaining items to limited quantities, and broadcast a live alert to all students in real-time.
          </div>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#16a34a", fontWeight: 700 }}>
            ⚡ Rush Mode Triggered & Broadcasted!
          </div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Stock per remaining item:</label>
              <input
                type="number"
                value={stockPerItem}
                onChange={(e) => setStockPerItem(e.target.value)}
                className="form-input"
                min={1}
                max={50}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Broadcast Alert Message:</label>
              <input
                type="text"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="form-input"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleTrigger}
                isLoading={isLoading}
                icon={<Zap size={16} />}
              >
                Trigger Rush Hour Now
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
