import React from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let displayMessage = "Er is iets misgegaan.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error.includes("Missing or insufficient permissions")) {
          displayMessage = "U heeft onvoldoende rechten om deze actie uit te voeren.";
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="h-screen flex items-center justify-center bg-zinc-50 p-6">
          <Card className="max-w-md w-full p-8 text-center border-red-100">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Oeps!</h2>
            <p className="text-zinc-500 mb-8">{displayMessage}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Opnieuw proberen
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
