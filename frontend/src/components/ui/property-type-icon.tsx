import { Box, Calendar, LucideBinary, LucideText, ToggleLeft } from "lucide-react";
interface PropertyTypeIconProps {
  type: string;
}

const PropertyTypeIcon = ({ type }: PropertyTypeIconProps) => {
  switch (type) {
    case "text":
      return <LucideText size={18} />;
    case "number":
      return <LucideBinary size={18} />;
    case "date":
      return <Calendar size={18} />;
    case "boolean":
      return <ToggleLeft size={18} />;
    default:
      return <Box size={18} />;
  }
};

export default PropertyTypeIcon;
