import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompanyHistoryTable } from "./CompanyHistoryTable";

const mockRecords = [
  { date: "20260619", company_id: "005930", quantity: 95000, amount: 6650 },
  { date: "20260618", company_id: "005930", quantity: -40000, amount: -2800 },
  { date: "20260617", company_id: "005930", quantity: 120000, amount: 8400 },
  { date: "20260616", company_id: "005930", quantity: 60000, amount: 4200 },
  { date: "20260615", company_id: "005930", quantity: -10000, amount: -700 },
  { date: "20260614", company_id: "005930", quantity: 45000, amount: 3150 },
  { date: "20260613", company_id: "005930", quantity: 80000, amount: 5600 },
];

const meta: Meta<typeof CompanyHistoryTable> = {
  title: "Dashboard/Company/CompanyHistoryTable",
  component: CompanyHistoryTable,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CompanyHistoryTable>;

export const Default: Story = {
  args: {
    data: mockRecords,
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
