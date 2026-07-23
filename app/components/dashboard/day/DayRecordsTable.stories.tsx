import type { Meta, StoryObj } from "@storybook/react-vite";
import { DayRecordsTable } from "./DayRecordsTable";
import { MemoryRouter } from "react-router";
import React from "react";

const mockRecords = [
  { date: "20260619", company_id: "005930", quantity: 95000, amount: 6650, company_name: "삼성전자" },
  { date: "20260619", company_id: "000660", quantity: -40000, amount: -2800, company_name: "SK하이닉스" },
  { date: "20260619", company_id: "035420", quantity: 12000, amount: 840, company_name: "NAVER" },
  { date: "20260619", company_id: "035720", quantity: 60000, amount: 4200, company_name: "카카오" },
  { date: "20260619", company_id: "005380", quantity: 0, amount: 0, company_name: "현대차" },
];

const meta: Meta<typeof DayRecordsTable> = {
  title: "Dashboard/Day/DayRecordsTable",
  component: DayRecordsTable,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof DayRecordsTable>;

export const Default: Story = {
  args: {
    selectedRecords: mockRecords,
  },
};

export const Empty: Story = {
  args: {
    selectedRecords: [],
  },
};
