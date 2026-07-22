import type { Meta, StoryObj } from "@storybook/react-vite";
import Header from "./header";
import { MemoryRouter } from "react-router";
import React from "react";

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
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
type Story = StoryObj<typeof Header>;

export const Default: Story = {};
