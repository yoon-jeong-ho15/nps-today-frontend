import type { Meta, StoryObj } from "@storybook/react-vite";
import Footer from "./footer";
import { MemoryRouter } from "react-router";
import React from "react";

const meta: Meta<typeof Footer> = {
  title: "Layout/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
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
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
