import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompanyChart } from "./CompanyChart";

const mockMixedData = [
  { date: "20260610", company_id: "005930", quantity: -50000, amount: -3500 },
  { date: "20260611", company_id: "005930", quantity: -20000, amount: -1400 },
  { date: "20260612", company_id: "005930", quantity: 30000, amount: 2100 },
  { date: "20260613", company_id: "005930", quantity: 80000, amount: 5600 },
  { date: "20260614", company_id: "005930", quantity: 45000, amount: 3150 },
  { date: "20260615", company_id: "005930", quantity: -10000, amount: -700 },
  { date: "20260616", company_id: "005930", quantity: 60000, amount: 4200 },
  { date: "20260617", company_id: "005930", quantity: 120000, amount: 8400 },
  { date: "20260618", company_id: "005930", quantity: -40000, amount: -2800 },
  { date: "20260619", company_id: "005930", quantity: 95000, amount: 6650 },
];

const mockBuyingData = mockMixedData.map((d) => ({
  ...d,
  quantity: Math.abs(d.quantity) + 10000,
  amount: Math.abs(d.amount) + 700,
}));

const mockSellingData = mockMixedData.map((d) => ({
  ...d,
  quantity: -Math.abs(d.quantity) - 10000,
  amount: -Math.abs(d.amount) - 700,
}));

const meta: Meta<typeof CompanyChart> = {
  title: "Dashboard/Company/CompanyChart",
  component: CompanyChart,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CompanyChart>;

export const MixedTrend: Story = {
  args: {
    chronologicalData: mockMixedData,
  },
};

export const PureBuyingTrend: Story = {
  args: {
    chronologicalData: mockBuyingData,
  },
};

export const PureSellingTrend: Story = {
  args: {
    chronologicalData: mockSellingData,
  },
};

export const EmptyData: Story = {
  args: {
    chronologicalData: [],
  },
};
