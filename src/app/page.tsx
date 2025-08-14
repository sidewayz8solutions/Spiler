'use client';

import React from 'react';

import { Button } from '../components/shared/Button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/shared/Card';
import {
  LoadingBar,
  LoadingDots,
  LoadingSpinner,
  Skeleton,
} from '../components/shared/Loading';
import {
  CallStatus,
  StatusIndicator,
} from '../components/shared/StatusIndicator';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-pattern p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <h1 className="text-6xl font-bold gradient-text">
            Welcome to Spiler
          </h1>
          <p className="text-xl text-spiler-text-muted max-w-2xl mx-auto">
            State-of-the-art campaign fundraising auto-dialer that uses YOUR phone
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="primary" size="lg" glow>
              Start Dialing
            </Button>
            <Button variant="secondary" size="lg">
              View Analytics
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-up">
          <Card glow>
            <CardHeader>
              <CardTitle gradient>Active Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-spiler-success">24</div>
              <div className="flex items-center mt-2">
                <StatusIndicator status="online" showLabel />
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Total Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-spiler-text">1,247</div>
              <div className="text-sm text-spiler-text-muted">+12% this week</div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Funds Raised</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-spiler-accent">$45,230</div>
              <div className="text-sm text-spiler-text-muted">+8% this month</div>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-spiler-warning">68%</div>
              <LoadingBar progress={68} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Demo Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Call Status Demo */}
          <Card glass>
            <CardHeader>
              <CardTitle>Call Status Demo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CallStatus status="connected" duration="02:34" />
              <CallStatus status="dialing" />
              <CallStatus status="on-hold" duration="00:45" />
            </CardContent>
          </Card>

          {/* Loading States Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Loading States</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-spiler-text">Spinners</h4>
                <div className="flex space-x-4 items-center">
                  <LoadingSpinner size="sm" />
                  <LoadingSpinner size="md" />
                  <LoadingSpinner size="lg" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-spiler-text">Dots</h4>
                <LoadingDots />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-spiler-text">Progress Bar</h4>
                <LoadingBar progress={75} />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-spiler-text">Skeleton</h4>
                <Skeleton lines={3} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Button Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>Button Showcase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="mt-6 space-y-4">
              <Button variant="primary" loading className="w-full">
                Loading Button
              </Button>
              <Button variant="primary" glow className="w-full">
                Glowing Button
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}