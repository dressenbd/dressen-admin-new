import React from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const orderSources = [
  { value: "phone", label: "📞 Phone Order", color: "bg-blue-100 text-blue-800" },
  { value: "walk-in", label: "🚶 Walk-in Customer", color: "bg-green-100 text-green-800" },
  { value: "whatsapp", label: "💬 WhatsApp", color: "bg-green-100 text-green-800" },
  { value: "facebook", label: "📘 Facebook", color: "bg-blue-100 text-blue-800" },
  { value: "online", label: "🌐 Online", color: "bg-purple-100 text-purple-800" }
];

interface OrderSourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  showBadge?: boolean;
}

const OrderSourceSelector: React.FC<OrderSourceSelectorProps> = ({ 
  value, 
  onChange, 
  showBadge = false 
}) => {
  const selectedSource = orderSources.find(source => source.value === value);

  return (
    <div className="space-y-2">
      <Label>Order Source *</Label>
      <div className="flex items-center gap-3">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select order source" />
          </SelectTrigger>
          <SelectContent>
            {orderSources.map(source => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {showBadge && selectedSource && (
          <Badge className={selectedSource.color}>
            {selectedSource.label}
          </Badge>
        )}
      </div>
      
      {value === "walk-in" && (
        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          🚶 Walk-in orders will be created with pending status. Update status after payment confirmation.
        </p>
      )}
      
      {value === "phone" && (
        <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          📞 Phone orders default to pending status. Remember to collect callback information.
        </p>
      )}
      
      {(value === "whatsapp" || value === "facebook") && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
          💬 Social media orders may require SR assignment for commission tracking.
        </p>
      )}
    </div>
  );
};

export default OrderSourceSelector;