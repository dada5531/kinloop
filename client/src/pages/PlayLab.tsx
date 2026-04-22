/**
 * KINLOOP Play Lab (Quadrant 3) — Coral accent
 * Real AI extraction from social media URLs → structured activity plans
 */
import AppShell from "@/components/AppShell";
import { useChild } from "@/contexts/ChildContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import {
  Palette,
  Link2,
  Clock,
  ShoppingCart,
  AlertTriangle,
  Sparkles,
  Loader2,
  Plus,
  ExternalLink,
  Droplets,
  Sun,
  Home,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Youtube,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function MessinessBar({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Droplets className="h-3.5 w-3.5 text-coral" />
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 w-4 rounded-sm ${i <= level ? "bg-coral" : "bg-muted"}`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground ml-1">
        {level <= 2 ? "Low mess" : level <= 3 ? "Medium" : "Messy!"}
      </span>
    </div>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "youtube") return <Youtube className="h-4 w-4" />;
  if (platform === "instagram") return <Instagram className="h-4 w-4" />;
  return <Link2 className="h-4 w-4" />;
}

type ExtractedActivity = {
  title: string;
  ageMin: number;
  ageMax: number;
  durationMinutes: number;
  skills: string[];
  materials: Array<{ name: string; qty: string; whereToBuy: string }>;
  steps: string[];
  safetyNotes: string[];
  messiness: number;
  indoorOutdoor: string;
  platform: string;
  ageWarning: string | null;
  sourceUrl: string;
};

export default function PlayLab() {
  const { selectedChild } = useChild();
  const childId = selectedChild?.id ?? 0;

  const { data: activities, refetch } = trpc.playLab.activities.useQuery(
    { childId },
    { enabled: !!childId, staleTime: 10_000 }
  );

  const extractMutation = trpc.playLab.extractFromUrl.useMutation();
  const saveMutation = trpc.playLab.save.useMutation();

  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractedActivity, setExtractedActivity] = useState<ExtractedActivity | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const activityList = activities ?? [];

  const handleExtract = async () => {
    if (!childId || !urlInput.trim()) return;
    setExtracting(true);
    try {
      const result = await extractMutation.mutateAsync({ childId, url: urlInput });
      setExtractedActivity(result as ExtractedActivity);
      setShowUrlDialog(false);
      setUrlInput("");
      toast.success("Activity extracted — review below");
    } catch (err) {
      toast.error("Could not extract activity from this URL. Try a different link.");
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!childId || !extractedActivity) return;
    try {
      await saveMutation.mutateAsync({
        childId,
        sourceUrl: extractedActivity.sourceUrl,
        sourcePlatform: extractedActivity.platform,
        title: extractedActivity.title,
        materials: extractedActivity.materials,
        durationMinutes: extractedActivity.durationMinutes,
        ageMin: extractedActivity.ageMin,
        ageMax: extractedActivity.ageMax,
        skills: extractedActivity.skills,
        steps: extractedActivity.steps,
        safetyNotes: extractedActivity.safetyNotes,
        messiness: extractedActivity.messiness,
        indoorOutdoor: extractedActivity.indoorOutdoor,
      });
      toast.success(`"${extractedActivity.title}" saved to your library`);
      setExtractedActivity(null);
      refetch();
    } catch (err) {
      toast.error("Failed to save activity");
    }
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-coral-light flex items-center justify-center">
                <Palette className="h-4.5 w-4.5 text-coral" />
              </div>
              Play Lab
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Paste a YouTube, TikTok, or Pinterest link — AI creates an activity plan
            </p>
          </div>
          <Button
            size="sm"
            className="bg-coral hover:bg-coral/90 text-white text-xs"
            onClick={() => setShowUrlDialog(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add link
          </Button>
        </div>

        {/* URL input inline */}
        <div className="mb-8 p-5 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="Paste a YouTube, TikTok, Instagram, or Pinterest link..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-coral/30"
              />
            </div>
            <Button
              className="bg-coral hover:bg-coral/90 text-white px-6"
              onClick={handleExtract}
              disabled={extracting}
            >
              {extracting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Extracting...
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

        {/* Extracted activity preview */}
        <AnimatePresence>
          {extractedActivity && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 bg-card rounded-2xl border-2 border-coral/20 shadow-sm overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-coral" />
                      <span className="text-xs font-medium text-coral">AI-Generated Activity Plan</span>
                    </div>
                    <h2 className="font-heading text-lg font-bold text-foreground">{extractedActivity.title}</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setExtractedActivity(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Age warning */}
                {extractedActivity.ageWarning && (
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800">{extractedActivity.ageWarning}</p>
                  </div>
                )}

                {/* Quick stats */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {extractedActivity.durationMinutes} min
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Ages {extractedActivity.ageMin}-{extractedActivity.ageMax}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {extractedActivity.indoorOutdoor === "indoor" ? (
                      <Home className="h-3 w-3 mr-1" />
                    ) : (
                      <Sun className="h-3 w-3 mr-1" />
                    )}
                    {extractedActivity.indoorOutdoor}
                  </Badge>
                </div>

                <MessinessBar level={extractedActivity.messiness} />

                {/* Skills */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-foreground mb-2">Skills developed</p>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedActivity.skills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-coral/20 text-coral">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-foreground mb-2">Materials needed</p>
                  <div className="space-y-2">
                    {extractedActivity.materials.map((mat, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">{mat.name}</span>
                          <span className="text-xs text-muted-foreground">({mat.qty})</span>
                        </div>
                        <a
                          href={mat.whereToBuy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-coral hover:underline flex items-center gap-1"
                        >
                          <ShoppingCart className="h-3 w-3" /> Buy
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Steps */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-foreground mb-2">Steps</p>
                  <ol className="space-y-2">
                    {extractedActivity.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="h-5 w-5 rounded-full bg-coral-light text-coral text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Safety notes */}
                {extractedActivity.safetyNotes.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                    <p className="text-xs font-medium text-amber-800 mb-1">Safety notes</p>
                    <ul className="space-y-1">
                      {extractedActivity.safetyNotes.map((note, i) => (
                        <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 mt-5">
                  <Button
                    className="flex-1 bg-coral hover:bg-coral/90 text-white"
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save to library
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={extractedActivity.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Source
                    </a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved activities */}
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground mb-4">
            {selectedChild?.name}'s play library ({activityList.length})
          </h2>

          {activityList.length > 0 ? (
            <div className="space-y-4">
              {activityList.map((activity: any) => {
                const isExpanded = expandedId === activity.id;
                return (
                  <div
                    key={activity.id}
                    className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
                  >
                    {/* Card header */}
                    <button
                      className="w-full text-left p-4 md:p-5 hover:bg-muted/20 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-lg bg-coral-light flex items-center justify-center flex-shrink-0">
                          <PlatformIcon platform={activity.sourcePlatform ?? "other"} />
                        </div>
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
                            {activity.sourcePlatform && (
                              <Badge variant="secondary" className="text-xs capitalize">
                                {activity.sourcePlatform}
                              </Badge>
                            )}
                            {activity.durationMinutes && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {activity.durationMinutes} min
                              </span>
                            )}
                            {activity.indoorOutdoor && (
                              <span className="text-xs text-muted-foreground capitalize">
                                {activity.indoorOutdoor}
                              </span>
                            )}
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
                          <div className="px-4 md:px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                            {/* Skills */}
                            {activity.skills && (activity.skills as string[]).length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Skills developed
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {(activity.skills as string[]).map((skill: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs border-coral/20 text-coral">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Steps */}
                            {activity.steps && (activity.steps as string[]).length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Steps
                                </h4>
                                <ol className="space-y-2">
                                  {(activity.steps as string[]).map((step: string, i: number) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-foreground">
                                      <span className="h-5 w-5 rounded-full bg-coral-light text-coral text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                                        {i + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Materials */}
                            {activity.materials && (activity.materials as any[]).length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                  Materials
                                </h4>
                                <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                                  {(activity.materials as any[]).map((mat: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                      <span className="text-foreground">
                                        {mat.name} ({mat.qty})
                                      </span>
                                      <a
                                        href={mat.whereToBuy}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-coral hover:underline flex items-center gap-1"
                                      >
                                        <ShoppingCart className="h-3 w-3" /> Buy
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Safety notes */}
                            {activity.safetyNotes && (activity.safetyNotes as string[]).length > 0 && (
                              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                                <p className="text-xs font-medium text-amber-800 mb-1">Safety notes</p>
                                <ul className="space-y-1">
                                  {(activity.safetyNotes as string[]).map((note: string, i: number) => (
                                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                                      <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                      {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {activity.messiness != null && <MessinessBar level={activity.messiness} />}

                            {activity.sourceUrl && (
                              <a
                                href={activity.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-coral hover:underline flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" /> View original
                              </a>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-xl bg-coral-light flex items-center justify-center mx-auto mb-3">
                <Palette className="h-6 w-6 text-coral" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No activities yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Paste a YouTube, TikTok, or Pinterest link to generate an activity plan
              </p>
              <Button
                size="sm"
                className="bg-coral hover:bg-coral/90 text-white text-xs"
                onClick={() => setShowUrlDialog(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add a link
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* URL Dialog (alternative to inline) */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Link2 className="h-5 w-5 text-coral" />
              Paste a link
            </DialogTitle>
            <DialogDescription>
              Paste a YouTube, TikTok, Instagram, or Pinterest URL to generate an activity plan
            </DialogDescription>
          </DialogHeader>
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            onKeyDown={(e) => e.key === "Enter" && handleExtract()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUrlDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-coral hover:bg-coral/90 text-white"
              onClick={handleExtract}
              disabled={extracting || !urlInput.trim()}
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Extract activity
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
