"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { CheckCircle2, XCircle, FileText, Loader2 } from "lucide-react";
import type { Contract } from "@/types/booking";

export default function ContractPageClient({ contract }: { contract: Contract | null }) {
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = useCallback((e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set up canvas for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDraw);
    canvas.addEventListener("mouseleave", endDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", endDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDraw);
      canvas.removeEventListener("mouseleave", endDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", endDraw);
    };
  }, [startDraw, draw, endDraw]);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const submitSignature = async () => {
    if (!contract || !canvasRef.current || !hasDrawn) return;
    setSigning(true);
    setError("");

    try {
      const signatureDataUrl = canvasRef.current.toDataURL("image/png");
      const res = await fetch(`/api/contracts/${contract.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signatureDataUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit signature");
      }

      setSigned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit signature");
    } finally {
      setSigning(false);
    }
  };

  if (!contract) {
    return (
      <main className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6">
        <div className="text-center">
          <FileText className="w-16 h-16 text-[#D4A853]/30 mx-auto mb-4" />
          <h1 className="text-2xl font-light text-white mb-2">Contract Not Found</h1>
          <p className="text-white/40">This contract may have been removed or the link is invalid.</p>
        </div>
      </main>
    );
  }

  const isSigned = contract.status === "signed" || signed;
  const isVoided = contract.status === "voided";

  return (
    <main className="min-h-screen bg-[#0B0F1A]">
      {/* Gold top bar */}
      <div className="h-[3px] bg-[#D4A853]" />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/gc-logo-white.png"
            alt="G|C Premier Property Group"
            width={600}
            height={305}
            className="mx-auto"
            style={{ width: "200px", height: "auto" }}
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white tracking-wide font-serif mb-2">
            {contract.title}
          </h1>
          <p className="text-white/50 text-sm">
            Prepared for <span className="text-[#D4A853]">{contract.recipientName}</span>
            {contract.recipientPhone && (
              <span className="text-white/30"> · {contract.recipientPhone}</span>
            )}
          </p>
        </div>

        {/* Status banner */}
        {isSigned && (
          <div className="mb-8 p-4 rounded-lg bg-green-500/10 border border-green-500/25 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />
            <div>
              <p className="text-green-400 font-semibold">Contract Signed</p>
              <p className="text-green-400/60 text-sm">
                Signed on {new Date(contract.signedAt || new Date().toISOString()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        )}

        {isVoided && (
          <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Contract Voided</p>
              <p className="text-red-400/60 text-sm">This contract has been voided and is no longer valid.</p>
            </div>
          </div>
        )}

        {/* Contract body */}
        <div className="bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-white/[0.08]">
            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#D4A853]">
              Agreement
            </p>
          </div>
          <div className="px-6 py-6">
            {contract.body.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-white/70 text-sm leading-relaxed mb-4 last:mb-0 whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Notes */}
        {contract.notes && (
          <div className="mb-8 p-5 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/25">
            <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#D4A853] mb-2">Notes</p>
            <p className="text-white/60 text-sm leading-relaxed">{contract.notes}</p>
          </div>
        )}

        {/* Signature section */}
        {!isSigned && !isVoided && (
          <div className="bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.08]">
              <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#D4A853]">
                Your Signature
              </p>
            </div>
            <div className="p-6">
              <p className="text-white/50 text-sm mb-4">
                Draw your signature below to sign this contract electronically.
              </p>

              <div className="relative bg-white rounded-lg mb-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-[150px] cursor-crosshair rounded-lg"
                  style={{ touchAction: "none" }}
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-gray-400 text-sm">Sign here</p>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition"
                >
                  Clear
                </button>
                <button
                  onClick={submitSignature}
                  disabled={!hasDrawn || signing}
                  className="flex-1 px-6 py-3 bg-[#D4A853] hover:bg-[#c49943] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-lg transition flex items-center justify-center gap-2"
                >
                  {signing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Sign Contract"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signed signature display */}
        {isSigned && contract.signature && (
          <div className="bg-[#111827] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.08]">
              <p className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#D4A853]">
                Signature
              </p>
            </div>
            <div className="p-6 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={contract.signature.signatureDataUrl}
                alt="Signature"
                className="max-h-[120px] mx-auto"
              />
              <p className="text-white/30 text-xs mt-3">
                Electronically signed on {new Date(contract.signature.signedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-block w-[50px] h-px bg-[#D4A853]/25 mb-6" />
          <p className="text-white/20 text-xs mb-1">Questions about this contract?</p>
          <p className="text-sm">
            <a href="mailto:contactus@gcpremierproperties.com" className="text-[#D4A853] hover:underline">
              contactus@gcpremierproperties.com
            </a>
            <span className="text-white/10 mx-2">|</span>
            <a href="tel:+16019668308" className="text-[#D4A853] hover:underline">
              (601) 966-8308
            </a>
          </p>
          <p className="text-white/10 text-[11px] mt-4">
            &copy; {new Date().getFullYear()} G|C Premier Property Group. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
