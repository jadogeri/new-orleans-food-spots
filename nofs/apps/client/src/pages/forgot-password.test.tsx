import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockMutate = jest.fn();
const mockToast = jest.fn();

jest.mock('@repo/api-client-react', () => ({
  useForgotPassword: () => ({
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
  }),
}));

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

jest.mock('wouter', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useLocation: () => ['/', jest.fn()],
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('lucide-react', () => ({
  Mail: () => <svg data-testid="mail-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
  CheckCircle: () => <svg data-testid="check-icon" />,
  KeyRound: () => <svg data-testid="key-icon" />,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
    className,
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type={type} onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  FormControl: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  FormField: ({ render: renderFn }: { render: (args: { field: object }) => React.ReactNode }) =>
    renderFn({ field: { value: '', onChange: jest.fn(), onBlur: jest.fn(), name: 'email', ref: jest.fn() } }),
  FormItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormLabel: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  FormMessage: () => null,
}));

import ForgotPassword from './forgot-password';

describe('ForgotPassword page', () => {
  beforeEach(() => {
    mockMutate.mockClear();
    mockToast.mockClear();
  });

  it('renders the heading', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
  });

  it('renders the email input', () => {
    render(<ForgotPassword />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<ForgotPassword />);
    expect(
      screen.getByRole('button', { name: /send temporary password/i }),
    ).toBeInTheDocument();
  });

  it('renders the "Back to Sign In" link', () => {
    render(<ForgotPassword />);
    expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
  });

  it('renders "Already have a temporary password?" link', () => {
    render(<ForgotPassword />);
    expect(
      screen.getByText(/Already have a temporary password\?/i),
    ).toBeInTheDocument();
  });
});
