/**
 * KINLOOP Onboarding — Add your first child
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useChild } from "@/contexts/ChildContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Baby, ArrowRight, Sparkles } from "lucide-react";

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { refetch } = useChild();
  const createChild = trpc.children.create.useMutation();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [allergies, setAllergies] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [pediatricianName, setPediatricianName] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) {
      toast.error("Name and date of birth are required");
      return;
    }
    try {
      await createChild.mutateAsync({
        name,
        dob,
        gender: gender || undefined,
        allergies: allergies ? allergies.split(",").map((s) => s.trim()) : [],
        schoolName: schoolName || undefined,
        teacherName: teacherName || undefined,
        pediatricianName: pediatricianName || undefined,
        notes: notes || undefined,
      });
      toast.success(`${name} has been added!`);
      refetch();
      navigate("/");
    } catch (err) {
      toast.error("Failed to add child");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-purple-light flex items-center justify-center mx-auto mb-4">
            <Baby className="h-8 w-8 text-purple" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            Welcome to KIN<span className="text-purple">LOOP</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Let's set up your child's profile to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Child's name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mia" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of birth *</Label>
              <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g. female" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies (comma-separated)</Label>
            <Input id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. Tree nuts, Dairy" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school">School</Label>
              <Input id="school" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Bright Horizons" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <Input id="teacher" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="e.g. Ms. Rodriguez" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pediatrician">Pediatrician</Label>
            <Input id="pediatrician" value={pediatricianName} onChange={(e) => setPediatricianName(e.target.value)} placeholder="e.g. Dr. Sarah Chen" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes about your child</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Loves dinosaurs and painting. Working on letter recognition."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-purple hover:bg-purple/90 text-white" disabled={createChild.isPending}>
            {createChild.isPending ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Get started
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
