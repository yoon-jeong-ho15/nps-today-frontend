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
      buyDays: 22,
      sellDays: 8,
      buyRatio: 73.3,
      avgAmount: 4833.33,
    },
  },
};

export const NetSelling: Story = {
  args: {
    metrics: {
      totalAmount: -89400,
      totalQuantity: -1250000,
      totalDays: 90,
      buyDays: 25,
      sellDays: 65,
      buyRatio: 27.7,
      avgAmount: -993.33,
    },
  },
};

export const Neutral: Story = {
  args: {
    metrics: {
      totalAmount: 0,
      totalQuantity: 0,
      totalDays: 30,
      buyDays: 15,
      sellDays: 15,
      buyRatio: 50.0,
      avgAmount: 0,
    },
  },
};
