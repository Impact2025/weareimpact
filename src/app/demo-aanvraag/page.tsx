"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, CheckCircle, Loader2, AlertCircle, Zap, Target, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trackEvents } from "@/components/analytics";

type FormStatus = "idle" | "loading" | "success" | "error";

interface DemoFormData {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  teamSize: string;
  challenge: string;
  desiredDate: string;
}

const CHALLENGE_OPTIONS = [
  "Vrijwilligers vinden & behouden",
  "Digitalisering proces bij sterkstilte",
  "Team motivatie & cultuur",
  "Data-driven besluitvorming",
  "AI-implementatie in organisatie",
  "Financiering & subsidieaanvragen",
  "Anders (zie beschrijving)",
];

export default function DemoAanvraagPage() {
  const [formData, setFormData] = useState<DemoFormData>({
    name: "",
    email: "",
    phone: "",
    organisation: "",
    teamSize: "",
    challenge: "",
    desiredDate: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    trackEvents.ctaClick("demo_request_submit", "demo_page");

    if (honeypot) {
      setStatus("success");
      return;
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus("error");
      setErrorMessage("Vul een geldig e-mailadres in");
      return;
    }

    try {
      const response = await fetch("/api/demo-aanvraag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, honeypot }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Er is iets misgegaan");
      }

      setStatus("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        organisation: "",
        teamSize: "",
        challenge: "",
        desiredDate: "",
      });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Er is iets misgegaan");
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7]">
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-6">
              <Zap size={16} className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">30 minuten impact</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
              Demo aanvragen
              <span className="text-orange-600 block mt-2">Zonder poespas</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Vertel waar je hulp bij nodig hebt. Ik stuur een datum voordat je klaar bent.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 pb-28">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl border border-slate-100">
              {status === "success" ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-5 bg-green-100 rounded-full mb-6">
                    <CheckCircle size={48} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    Aanvraag verzonden!
                  </h3>
                  <p className="text-slate-600 mb-8 max-w-sm mx-auto">
                    Ik neem binnen enkele uren contact met je op. Check ook je spam folder.
                  </p>
                  <Button
                    onClick={() => setStatus("idle")}
                    variant="outline"
                    className="rounded-full"
                  >
                    Nog een aanvraag sturen
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Honeypot */}
                  <div className="hidden" aria-hidden="true">
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  {/* Naam & E-mail */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                        Naam <span className="text-orange-500">*</span>
                      </label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Je naam"
                        required
                        className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        disabled={status === "loading"}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                        E-mail <span className="text-orange-500">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="jouw@email.nl"
                        required
                        className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        disabled={status === "loading"}
                      />
                    </div>
                  </div>

                  {/* Telefoon & Organisatie */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                        Telefoon <span className="text-slate-400">(optioneel)</span>
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="06 12 34 56 78"
                        className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        disabled={status === "loading"}
                      />
                    </div>
                    <div>
                      <label htmlFor="organisation" className="block text-sm font-semibold text-slate-700 mb-2">
                        Organisatie <span className="text-orange-500">*</span>
                      </label>
                      <Input
                        id="organisation"
                        type="text"
                        value={formData.organisation}
                        onChange={(e) => setFormData(prev => ({ ...prev, organisation: e.target.value }))}
                        placeholder="Naam organisatie"
                        required
                        className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                        disabled={status === "loading"}
                      />
                    </div>
                  </div>

                  {/* Team grootte */}
                  <div>
                    <label htmlFor="teamSize" className="block text-sm font-semibold text-slate-700 mb-2">
                      Team grootte
                    </label>
                    <Input
                      id="teamSize"
                      type="number"
                      min="1"
                      max="500"
                      value={formData.teamSize}
                      onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                      placeholder="Aantal medewerkers (inclusief vrijwilligers)"
                      className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                      disabled={status === "loading"}
                    />
                  </div>

                  {/* Uitdaging */}
                  <div>
                    <label htmlFor="challenge" className="block text-sm font-semibold text-slate-700 mb-2">
                      Wat is jullie uitdaging? <span className="text-orange-500">*</span>
                    </label>
                    <select
                      id="challenge"
                      value={formData.challenge}
                      onChange={(e) => setFormData(prev => ({ ...prev, challenge: e.target.value }))}
                      required
                      className="w-full h-12 rounded-xl border border-slate-200 px-3 focus:border-orange-500 focus:ring-orange-500 bg-white"
                      disabled={status === "loading"}
                    >
                      <option value="">Selecteer een uitdaging...</option>
                      {CHALLENGE_OPTIONS.map(optie => (
                        <option key={optie} value={optie}>{optie}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gewenste datum */}
                  <div>
                    <label htmlFor="desiredDate" className="block text-sm font-semibold text-slate-700 mb-2">
                      Gewenste datum
                    </label>
                    <Input
                      id="desiredDate"
                      type="date"
                      value={formData.desiredDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, desiredDate: e.target.value }))}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                      disabled={status === "loading"}
                    />
                  </div>

                  {/* Error message */}
                  {status === "error" && errorMessage && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      <AlertCircle size={18} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 disabled:opacity-50"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 size={20} className="animate-spin mr-2" />
                        Verzenden...
                      </>
                    ) : (
                      <>
                        <Calendar size={20} className="mr-2" />
                        Demo aanvragen
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-slate-400">
                    Door te verzenden ga je akkoord met de{" "}
                    <Link href="/privacy" className="text-orange-600 hover:underline">
                      privacyverklaring
                    </Link>
                  </p>
                </form>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange-500" />
                <span>Reactie {"<"}4 uur</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-orange-500" />
                <span>100% vertrouwelijk</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-2">
                <Target size={16} className="text-orange-500" />
                <span>Geen standaardpraat</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}