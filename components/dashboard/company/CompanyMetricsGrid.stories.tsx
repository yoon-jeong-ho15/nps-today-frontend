import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompanyMetricsGrid } from "./CompanyMetricsGrid";

const meta: Meta<typeof CompanyMetricsGrid> = {
  title: "Dashboard/Company/CompanyMetricsGrid",
  component: CompanyMetricsGrid,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CompanyMetricsGrid>;

export const NetBuying: Story = {
  args: {
    metrics: {
      totalAmount: 145000,
      totalQuantity: 2800000,
      totalDays: 30,
    },
  },
};

export const NetSelling: Story = {
  args: {
    metrics: {
      totalAmount: -89400,
      totalQuantity: -1250000,
      totalDays: 90,
    },
  },
};

export const Neutral: Story = {
  args: {
    metrics: {
      totalAmount: 0,
      totalQuantity: 0,
      totalDays: 30,
    },
  },
};
