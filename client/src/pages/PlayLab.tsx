/**
 * KINLOOP Play Lab (Quadrant 3) — Coral accent
 * Paste social links → get structured activity plans with materials
 */
import AppShell from "@/components/AppShell";
import { demoActivities, demoChildren, type Activity } from "@/lib/demo-data";
import { useState } from "react";
import {
  Palette,
  Link2,
  Clock,
  ShoppingCart,
  Calendar,
  Star,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Check,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function MessinessIndicator({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Droplets
          key={i}
          className={`h-3 w-3 ${i < score ? 'text-coral' : 'text-muted-foreground/20'}`}
        />
      ))}
    </div>
  );
}

function AgeCheck({ ageMin, ageMax, childAge }: { ageMin: number; ageMax: number; childAge: number }) {
  const inRange = childAge >= ageMin && childAge <= ageMax;
  return (
    <Badge
      variant={inRange ? "secondary" : "destructive"}
      className={`text-xs ${inRange ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
    >
      {inRange ? <Check className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
      Ages {ageMin}–{ageMax}
      {!inRange && ' (check suitability)'}
    </Badge>
  );
}

export default function PlayLab() {
  const child = demoChildren[0];
  const childAgeYears = 4;
  const [urlInput, setUrlInput] = useState("");
  const [activities, setActivities] = useState(demoActivities);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtract = () => {
    if (!urlInput.trim()) return;
    setIsExtracting(true);
    toast("Extracting activity from link...");

    setTimeout(() => {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        childId: child.id,
        sourceUrl: urlInput,
        sourcePlatform: urlInput.includes('youtube') ? 'youtube' : urlInput.includes('tiktok') ? 'tiktok' : 'instagram',
        title: 'Homemade Bubble Painting',
        materials: [
          { name: 'Dish soap', qty: 1, estPrice: 2.99 },
          { name: 'Washable paint (set)', qty: 1, estPrice: 8.99 },
          { name: 'Straws', qty: 1, estPrice: 3.49 },
          { name: 'White cardstock paper', qty: 1, estPrice: 5.99 },
        ],
        durationMinutes: 30,
        ageMin: 3,
        ageMax: 8,
        skillsDeveloped: ['Creativity', 'Oral motor skills', 'Color mixing', 'Cause and effect'],
        steps: [
          'Mix dish soap, water, and washable paint in small cups (one color per cup)',
          'Give child a straw and show them how to blow bubbles in the paint mixture',
          'Once bubbles rise above the cup rim, press paper on top to capture the print',
          'Repeat with different colors, layering prints on the same paper',
          'Let dry completely — frame as art!',
        ],
        safetyNotes: ['Teach child to blow OUT through straw, not suck in', 'Use washable paint only'],
        messinessScore: 3,
        saved: false,
        thumbnailUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop',
      };
      setActivities((prev) => [newActivity, ...prev]);
      setUrlInput("");
      setIsExtracting(false);
      setExpandedId(newActivity.id);
      toast.success("Activity extracted successfully!");
    }, 2000);
  };

  const totalCartPrice = (materials: Activity['materials']) =>
    materials.reduce((sum, m) => sum + m.estPrice * m.qty, 0).toFixed(2);

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-coral-light flex items-center justify-center">
              <Palette className="h-4.5 w-4.5 text-coral" />
            </div>
            Play Lab
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a link, get a structured activity plan with materials
          </p>
        </div>

        {/* URL input */}
        <div className="mb-8 p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
                placeholder="Paste a YouTube, TikTok, Instagram, or Pinterest link..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
              />
            </div>
            <Button
              className="bg-coral hover:bg-coral/90 text-white px-6"
              onClick={handleExtract}
              disabled={isExtracting}
            >
              {isExtracting ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" /> Extracting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Extract
                </span>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            AI will extract the activity, materials list, age check, and prep steps
          </p>
        </div>

        {/* Activity library */}
        <h2 className="font-heading text-base font-semibold text-foreground mb-4">
          {child.name}'s play library
        </h2>

        <div className="space-y-4">
          <AnimatePresence>
            {activities.map((activity) => {
              const isExpanded = expandedId === activity.id;
              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
                >
                  {/* Card header */}
                  <button
                    className="w-full text-left p-4 md:p-5 hover:bg-muted/20 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      {activity.thumbnailUrl && (
                        <div className="h-16 w-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <img
                            src={activity.thumbnailUrl}
                            alt={activity.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-foreground">{activity.title}</h3>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {activity.sourcePlatform}
                          </Badge>
                          <AgeCheck ageMin={activity.ageMin} ageMax={activity.ageMax} childAge={childAgeYears} />
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {activity.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 md:px-5 pb-5 border-t border-border/50 pt-4">
                          {/* Skills */}
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Skills developed</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {activity.skillsDeveloped.map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs border-coral/20 text-coral">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Steps */}
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Steps</h4>
                            <ol className="space-y-2">
                              {activity.steps.map((step, i) => (
                                <li key={i} className="flex gap-2.5 text-sm text-foreground">
                                  <span className="h-5 w-5 rounded-full bg-coral-light text-coral text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>

                          {/* Materials */}
                          <div className="mb-4">
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Materials</h4>
                            <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                              {activity.materials.map((mat, i) => (
                                <div key={i} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" className="rounded border-border" />
                                    <span className="text-foreground">{mat.name}</span>
                                    {mat.qty > 1 && <span className="text-xs text-muted-foreground">x{mat.qty}</span>}
                                  </div>
                                  <span className="text-xs text-muted-foreground">${mat.estPrice.toFixed(2)}</span>
                                </div>
                              ))}
                              <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground">Estimated total</span>
                                <span className="text-sm font-semibold text-coral">${totalCartPrice(activity.materials)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Messiness + safety */}
                          <div className="flex flex-wrap gap-6 mb-4">
                            <div>
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Messiness</h4>
                              <MessinessIndicator score={activity.messinessScore} />
                            </div>
                            {activity.safetyNotes.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Safety notes</h4>
                                <ul className="space-y-1">
                                  {activity.safetyNotes.map((note, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              className="bg-coral hover:bg-coral/90 text-white text-xs"
                              onClick={() => toast("Opening Amazon cart with materials...")}
                            >
                              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                              Add to cart — ${totalCartPrice(activity.materials)}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => toast("Scheduled for Saturday 10:00 AM")}
                            >
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />
                              Schedule for Saturday
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs"
                              onClick={() => window.open(activity.sourceUrl, '_blank')}
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              View original
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </AppShell>
  );
}
