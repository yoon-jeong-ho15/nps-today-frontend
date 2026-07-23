import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { Search, ChevronRight } from "lucide-react";
import React from "react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Button",
    variant: "default",
    size: "default",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button {...args} variant="default">Default</Button>
      <Button {...args} variant="outline">Outline</Button>
      <Button {...args} variant="secondary">Secondary</Button>
      <Button {...args} variant="ghost">Ghost</Button>
      <Button {...args} variant="destructive">Destructive</Button>
      <Button {...args} variant="link">Link</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button {...args} size="xs">XS Size</Button>
      <Button {...args} size="sm">SM Size</Button>
      <Button {...args} size="default">Default Size</Button>
      <Button {...args} size="lg">LG Size</Button>
    </div>
  ),
};

export const Icons: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button {...args} size="default">
        <Search className="size-4" />
        Search
      </Button>
      <Button {...args} size="default" variant="outline">
        Next
        <ChevronRight className="size-4" />
      </Button>
      <Button {...args} size="icon" aria-label="Search Only">
        <Search className="size-4" />
      </Button>
      <Button {...args} size="icon-sm" variant="outline" aria-label="Search SM">
        <Search className="size-3.5" />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};