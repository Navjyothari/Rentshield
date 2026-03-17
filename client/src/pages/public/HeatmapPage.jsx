import React from 'react';
import { HeatmapView } from '@/components/map/HeatmapView';
import { Card, CardContent } from '@/components/ui/Card';
import { Map, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';

export const HeatmapPage = () => {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header Bar */}
      <div className="border-b border-border/50 bg-secondary/30 px-6 py-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-display font-bold flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Live Issue Transparency Map
          </h1>
          <p className="text-sm text-muted-foreground hidden md:block">
            Real-time visualization of reported housing violations and concerns.
          </p>
        </div>

        {/* Mock Filters for UI completeness */}
        <div className="flex items-center gap-4 hidden sm:flex">
          <div className="flex items-center gap-2 border bg-background rounded-md px-3 py-1.5 text-sm cursor-not-allowed opacity-50">
            <Filter className="w-4 h-4" />
            Filters (Coming Soon)
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar Overlay (Desktop Only) */}
        <div className="absolute top-4 left-4 z-10 w-64 hidden xl:block">
          <Card className="bg-background/95 backdrop-blur shadow-xl border-border/50">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Map Legend</h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" /> Resolved
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500" /> Under Review
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500" /> Reported (Pending)
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-red-500" /> Dismissed
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Heatmap density represents severity weight combined with concentration. Points are dynamically clustered at high zoom layers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full screen map */}
        <div className="flex-1 relative">
          <HeatmapView />
        </div>
      </div>
    </div>
  );
};
