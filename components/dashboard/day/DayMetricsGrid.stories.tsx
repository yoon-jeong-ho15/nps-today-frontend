import type { Meta, StoryObj } from "@storybook/react-vite";
import { DayMetricsGrid } from "./DayMetricsGrid";

const meta: Meta<typeof DayMetricsGrid> = {
  title: "Dashboard/Day/DayMetricsGrid",
  component: DayMetricsGrid,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof DayMetricsGrid>;

export const NetBuyingDay: Story = {
  args: {
    metrics: {
      totalBuyAmount: 320000,
      totalSellAmount: -180000,
      netAmount: 140000,
      buyCount: 15,
      sellCount: 8,
    },
  },
};

export const NetSellingDay: Story = {
  args: {
    metrics: {
      totalBuyAmount: 95000,
      totalSellAmount: -245000,
      netAmount: -150000,
      buyCount: 5,
      sellCount: 17,
    },
  },
};

export const NeutralDay: Story = {
  args: {
    metrics: {
      totalBuyAmount: 0,
      totalSellAmount: 0,
      netAmount: 0,
      buyCount: 0,
      sellCount: 0,
    },
  },
};
