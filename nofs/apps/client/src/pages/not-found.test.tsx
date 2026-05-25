import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

jest.mock('lucide-react', () => ({
  AlertCircle: ({ className }: { className?: string }) => (
    <svg data-testid="alert-icon" className={className} />
  ),
}));

import NotFound from './not-found';

describe('NotFound page', () => {
  it('renders the 404 heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
  });

  it('renders a helpful message', () => {
    render(<NotFound />);
    expect(
      screen.getByText(/Did you forget to add the page to the router\?/i),
    ).toBeInTheDocument();
  });

  it('renders the alert icon', () => {
    render(<NotFound />);
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('renders the card wrapper', () => {
    render(<NotFound />);
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });
});
