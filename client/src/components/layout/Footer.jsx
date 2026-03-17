import React from 'react';
import { Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background mt-auto">
      <div className="container py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-5 w-5" />
          <span className="font-display font-medium">RentShield</span>
          <span className="text-sm">© {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">DAO Governance</a>
        </div>
      </div>
    </footer>
  );
};
