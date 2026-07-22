import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompanyDashboardHeader } from "./CompanyDashboardHeader";

const mockCompanies = [
  { id: "005930", name: "삼성전자" },
  { id: "000660", name: "SK하이닉스" },
  { id: "035420", name: "NAVER" },
  { id: "035720", name: "카카오" },
  { id: "005380", name: "현대차" },
];

const meta: Meta<typeof CompanyDashboardHeader> = {
  title: "Dashboard/Company/CompanyDashboardHeader",
  component: CompanyDashboardHeader,
  parameters: {
    layout: "padded",
  },
  args: {
    companyId: "005930",
    companyName: "삼성전자",
    sortedCompanies: mockCompanies,
    rangeDays: 30,
    onRangeChange: () => {},
    onCompanyChange: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof CompanyDashboardHeader>;

export const Default: Story = {};

export const Range90DaysSelected: Story = {
  args: {
    rangeDays: 90,
  },
};

export const Range365DaysSelected: Story = {
  args: {
    rangeDays: 365,
  },
};

export const LongCompanyName: Story = {
  args: {
    companyName: "에이치디현대인프라코어주식회사",
    companyId: "042670",
  },
};
