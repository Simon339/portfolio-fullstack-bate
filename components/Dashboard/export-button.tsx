/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileJson, FileSpreadsheet, FileText, ChevronDown, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import type { Project } from "./ProjectTable"
import { exportProjects } from "@/server/data/projectactions"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface ExportButtonProps {
  projects: Project[]
  selectedProjects?: Project[]
}

export default function ExportButton({ projects, selectedProjects }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: "csv" | "json" | "pdf") => {
    try {
      setIsExporting(true)
      const dataToExport = selectedProjects && selectedProjects.length > 0 ? selectedProjects : projects

      if (dataToExport.length === 0) {
        toast.error("No projects to export")
        return
      }

      // Transform the data to match the exact structure expected by exportProjects
      const transformedProjects = dataToExport.map(project => ({
        id: project.id,
        name: project.name,
        image: project.image,
        category: project.category || { id: "", name: "Uncategorized" },
        techstacks: project.techstacks || [],
        description: project.description || "",
        features: project.features || [],
        demo: project.demo || "",
        status: project.status || "draft"
      }))

      toast.info(`Exporting ${dataToExport.length} project(s)...`)

      const result = await exportProjects(transformedProjects, format)

      if (!result.success) {
        toast.error(result.error || "Failed to export projects")
        return
      }

      // Handle different export formats
      if (format === "pdf") {
        let pdfData
        try {
          pdfData = typeof result.data === 'string'
            ? JSON.parse(result.data)
            : result.data
        } catch (parseError) {
          toast.error("Failed to generate PDF: Invalid data format")
          return
        }

        generatePDF(pdfData, result.filename || "projects-export.pdf")
      } else if (format === "json") {
        const blob = new Blob([result.data], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = result.filename || "projects-export.json"
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      } else if (format === "csv") {
        // Add BOM for UTF-8 to handle special characters
        const bom = "\uFEFF"
        const blob = new Blob([bom + result.data], { type: "text/csv;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = result.filename || "projects-export.csv"
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(url)
      }

      toast.success(`Successfully exported ${dataToExport.length} project(s) as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error("An error occurred during export")
    } finally {
      setIsExporting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  MS PORTFOLIO — Premium PDF Generator
  //  Design language: Luxury editorial · Controlled density · Authoritative type
  //  import { jsPDF } from "jspdf";
  // ─────────────────────────────────────────────────────────────────────────────

  const generatePDF = async (data: any, filename: string): Promise<void> => {
    const { timestamp, projects = [] } = data;

    // ═══════════════════════════════════════════════════════════════════════════
    //  0  IMAGE PRE-FETCH
    // ═══════════════════════════════════════════════════════════════════════════
    const fetchB64 = async (url: string): Promise<string | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch { return null; }
    };

    const LOGO_URL = "https://m-s-portfolio.vercel.app/logo.png";

    const [logoB64, ...projectImages] = await Promise.all([
      fetchB64(LOGO_URL),
      ...projects.map((p: any) =>
        fetchB64(p.image ?? `https://placehold.co/1200x675/000B58/ACC2EF?text=${encodeURIComponent(p.name ?? "Preview")}`)
      ),
    ]);

    // ═══════════════════════════════════════════════════════════════════════════
    //  1  DOCUMENT INITIALISATION
    // ═══════════════════════════════════════════════════════════════════════════
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Page dimensions
    const PW = 210;
    const PH = 297;

    // ─── Grid System ───────────────────────────────────────────────────────────
    // All content snaps to this 14-column grid (each column = ~13mm)
    const MARGIN = 16;          // L + R margin
    const COL_GAP = 5;           // gutter between columns
    const CW = PW - MARGIN * 2;  // 178 mm usable width
    const HDR_H = 9;           // running header height
    const FTR_Y = 283;         // footer baseline
    const BODY_TOP = HDR_H + 8;   // first content Y on interior pages

    // ─── Spacing Scale (mm) ────────────────────────────────────────────────────
    // Never use raw numbers — always reference this scale
    const S = {
      "2": 2,
      "3": 3,
      "4": 4,
      "6": 6,
      "8": 8,
      "10": 10,
      "14": 14,
      "20": 20,
    };

    // ─── Typography Scale ──────────────────────────────────────────────────────
    // All sizes in pt. Line height = size * 1.45 converted to mm
    const mmPerPt = 0.3528;
    const lh = (pt: number) => pt * mmPerPt * 1.45;

    // ─── Colour Palette ────────────────────────────────────────────────────────
    type RGB = [number, number, number];
    const T = {
      navy: [0, 11, 88] as RGB,   // Brand primary
      navyDeep: [0, 6, 55] as RGB,   // Darker navy (shadows)
      navyMid: [0, 28, 115] as RGB,   // Mid navy (circles)
      gold: [197, 157, 39] as RGB,   // Prestige accent — used sparingly
      goldPale: [240, 225, 170] as RGB,   // Pale gold for pill text
      steel: [162, 185, 232] as RGB,   // #ACC2EF muted
      steelPale: [232, 240, 253] as RGB,   // Pill background
      ink: [22, 34, 57] as RGB,   // Body text
      slate: [90, 105, 130] as RGB,   // Labels, captions
      rule: [214, 221, 232] as RGB,   // Hairlines
      snow: [248, 250, 253] as RGB,   // Card/row backgrounds
      white: [255, 255, 255] as RGB,
    };

    // ─── Shorthand drawing utilities ───────────────────────────────────────────
    const fc = (c: RGB) => doc.setFillColor(...c);
    const dc = (c: RGB) => doc.setDrawColor(...c);
    const tc = (c: RGB) => doc.setTextColor(...c);
    const lw = (n: number) => doc.setLineWidth(n);
    const fnt = (w: "normal" | "bold" | "italic", sz: number) => {
      doc.setFont("helvetica", w);
      doc.setFontSize(sz);
    };

    // Page counter (mutable ref shared across builders)
    const pg = { n: 1 };

    // ═══════════════════════════════════════════════════════════════════════════
    //  2  CHROME — RUNNING HEADER & FOOTER
    // ═══════════════════════════════════════════════════════════════════════════

    const drawHeader = (section: string) => {
      if (pg.n === 1) return;

      // Navy band
      fc(T.navy); doc.rect(0, 0, PW, HDR_H, "F");

      // Gold hairline beneath header
      fc(T.gold); doc.rect(0, HDR_H, PW, 0.5, "F");

      // Brand name — left
      fnt("bold", 6); tc(T.steel);
      doc.text("MALESELA  PORTFOLIO", MARGIN, 6.2);

      // Section — centred
      fnt("normal", 5.8); tc([200, 210, 230] as RGB);
      doc.text(section.toUpperCase(), PW / 2, 6.2, { align: "center" });

      // Page — right
      fnt("bold", 6); tc(T.steel);
      doc.text(`${pg.n}`, PW - MARGIN, 6.2, { align: "right" });
    };

    const drawFooter = (total = 999) => {
      // Wipe any stale footer
      fc(T.white); doc.rect(0, FTR_Y - 6, PW, PH - FTR_Y + 8, "F");

      // Hairline rule
      dc(T.rule); lw(0.22);
      doc.line(MARGIN, FTR_Y - 3.5, PW - MARGIN, FTR_Y - 3.5);

      fnt("normal", 6.8); tc(T.slate);
      doc.text(
        "m-s-portfolio.vercel.app  ·  simonmalapane018@protonmail.com",
        MARGIN, FTR_Y
      );
      doc.text(`${pg.n} of ${total}`, PW - MARGIN, FTR_Y, { align: "right" });
    };

    // Corner accent — top-right geometric mark on interior pages
    const drawCorner = () => {
      fc(T.steel);
      doc.triangle(PW - 16, 0, PW, 0, PW, 16, "F");
      fc(T.gold);
      doc.triangle(PW - 7, 0, PW, 0, PW, 7, "F");
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  3  LAYOUT ENGINE
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Checks whether `needed` mm fit before the footer.
     * If not: adds a new page, draws chrome, returns fresh Y.
     */
    const guard = (y: number, needed: number, section: string): number => {
      if (y + needed > FTR_Y - 10) {
        pg.n++;
        doc.addPage();
        drawHeader(section);
        drawCorner();
        drawFooter();
        return BODY_TOP;
      }
      return y;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  4  TYPOGRAPHY COMPONENTS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * SECTION LABEL — all-caps small label above a full rule.
     * Used for top-level divisions (Description, Features, etc.)
     * Returns Y after the component.
     */
    const SectionLabel = (text: string, y: number): number => {
      fnt("bold", 7); tc(T.slate);
      doc.text(text.toUpperCase(), MARGIN, y);
      dc(T.rule); lw(0.22);
      doc.line(MARGIN, y + 1.8, PW - MARGIN, y + 1.8);
      return y + S["6"];
    };

    /**
     * DISPLAY LABEL — coloured block heading with left gold bar.
     * Used for section openers inside a page.
     * Returns Y after the component.
     */
    const DisplayLabel = (text: string, y: number): number => {
      const H = 9;
      fc(T.navy); doc.rect(MARGIN, y, CW, H, "F");
      fc(T.gold); doc.rect(MARGIN, y, 2.2, H, "F");
      fnt("bold", 8.5); tc(T.white);
      doc.text(text.toUpperCase(), MARGIN + 7, y + H - 2.8);
      return y + H + S["4"];
    };

    /**
     * BODY — left-aligned paragraph at 8.8pt.
     * Returns Y after the last line.
     */
    const Body = (text: string, y: number, indent = 0, width?: number): number => {
      fnt("normal", 8.8); tc(T.ink);
      const w = (width ?? CW) - indent;
      const lines = doc.splitTextToSize(text, w);
      doc.text(lines, MARGIN + indent, y);
      return y + lines.length * lh(8.8);
    };

    /**
     * CAPTION — 7pt slate label.
     * Returns Y after the line.
     */
    const Caption = (text: string, y: number, indent = 0, align: "left" | "right" | "center" = "left"): number => {
      fnt("normal", 7); tc(T.slate);
      const x = align === "right" ? PW - MARGIN - indent
        : align === "center" ? PW / 2
          : MARGIN + indent;
      doc.text(text, x, y, { align });
      return y + lh(7);
    };

    /**
     * META ROW — bold label + normal value on one baseline.
     * All labels snap to `labelW` so values align in a column.
     */
    const MetaRow = (label: string, value: string, y: number, labelW = 44): number => {
      fnt("bold", 8); tc(T.slate);
      doc.text(label, MARGIN, y);
      fnt("normal", 8); tc(T.ink);
      doc.text(value, MARGIN + labelW, y);
      return y + lh(8) + S["2"];
    };

    /**
     * FEATURE BULLET — numbered badge + bold name + indented body.
     * Returns Y after the block.
     */
    const FeatureBullet = (
      index: number,
      name: string,
      description: string,
      y: number,
      section: string
    ): number => {
      const BADGE_R = 3.2;
      const BADGE_CX = MARGIN + BADGE_R;
      const TEXT_X = MARGIN + BADGE_R * 2 + 3.5;
      const TEXT_W = CW - BADGE_R * 2 - 3.5;

      // Badge
      fc(T.navy); doc.circle(BADGE_CX, y + 0.2, BADGE_R, "F");
      fnt("bold", 6.5); tc(T.white);
      doc.text(String(index), BADGE_CX, y + 1.6, { align: "center" });

      // Feature name
      fnt("bold", 9); tc(T.navy);
      doc.text(name, TEXT_X, y + 1.6);

      // Description — 1mm below name baseline
      const descY = y + lh(9) + S["2"];
      const descLines = doc.splitTextToSize(description, TEXT_W);
      fnt("normal", 8.5); tc(T.ink);
      doc.text(descLines, TEXT_X, descY);

      return descY + descLines.length * lh(8.5);
    };

    /**
     * TECH PILLS — inline wrap.
     * Returns Y after last row of pills.
     */
    const TechPills = (techs: string[], y: number, indent = 0): number => {
      if (!techs.length) return Body("None specified.", y, indent);

      const PAD_H = 3;    // horizontal padding inside pill
      const PAD_V = 1.8;  // vertical padding
      const PILL_H = 5.8;
      const GAP_H = 2.5;
      const GAP_V = 3;

      let px = MARGIN + indent;
      let rowY = y;

      fnt("normal", 7.2); tc(T.navy);

      techs.forEach((tech) => {
        const tw = (doc.getStringUnitWidth(tech) * 7.2) / doc.internal.scaleFactor;
        const pw = tw + PAD_H * 2;

        if (px + pw > PW - MARGIN) {
          px = MARGIN + indent;
          rowY += PILL_H + GAP_V;
        }

        // Pill background
        fc(T.steelPale); dc(T.steel); lw(0.25);
        doc.roundedRect(px, rowY - PAD_V - 1, pw, PILL_H, 1.5, 1.5, "FD");

        // Pill text
        tc(T.navy);
        doc.text(tech, px + PAD_H, rowY + PAD_V - 0.5);

        px += pw + GAP_H;
      });

      return rowY + PILL_H + S["2"];
    };

    /**
     * IMAGE FRAME — embeds image or draws a branded placeholder.
     */
    const ImageFrame = (
      b64: string | null,
      x: number, y: number, w: number, h: number,
      label = "Project Preview"
    ) => {
      // Shadow
      fc([210, 218, 230] as RGB); doc.roundedRect(x + 1.5, y + 1.5, w, h, 2.5, 2.5, "F");

      // Frame
      fc(T.snow); dc(T.rule); lw(0.22);
      doc.roundedRect(x, y, w, h, 2.5, 2.5, "FD");

      if (b64) {
        try {
          doc.addImage(b64, "JPEG", x + 1, y + 1, w - 2, h - 2, undefined, "FAST");
          return;
        } catch { /* fall through to placeholder */ }
      }

      // Branded placeholder
      fc(T.navy); doc.roundedRect(x, y, w, h * 0.42, 2.5, 2.5, "F");
      fc(T.navy); doc.rect(x, y + h * 0.3, w, h * 0.12, "F"); // square bottom of header
      fc(T.steelPale); doc.circle(x + w / 2, y + h * 0.65, 8, "F");
      fnt("normal", 7); tc(T.slate);
      doc.text(label, x + w / 2, y + h * 0.85, { align: "center" });
    };

    /**
     * KPI CARD — metric value + label.
     */
    const KpiCard = (value: string, label: string, x: number, y: number, w: number, h: number) => {
      // Shadow
      fc([210, 218, 230] as RGB); doc.roundedRect(x + 1, y + 1, w, h, 2, 2, "F");

      // Card
      fc(T.snow); dc(T.rule); lw(0.22);
      doc.roundedRect(x, y, w, h, 2, 2, "FD");

      // Top accent bar
      fc(T.navy); doc.roundedRect(x, y, w, 1.8, 1.2, 1.2, "F");
      doc.rect(x, y + 0.9, w, 0.9, "F"); // square bottom of bar

      // Value
      fnt("bold", 22); tc(T.navy);
      doc.text(value, x + w / 2, y + h * 0.6, { align: "center" });

      // Label
      fnt("normal", 6); tc(T.slate);
      doc.text(label.toUpperCase(), x + w / 2, y + h - 3.5, { align: "center" });
    };

    /**
     * TOC ROW — label · dot leader · page number.
     */
    const TocRow = (label: string, pg: number, y: number, indent = 0, bold = false) => {
      fnt(bold ? "bold" : "normal", 9); tc(T.ink);
      doc.text(label, MARGIN + indent, y);

      const labelW = (doc.getStringUnitWidth(label) * 9) / doc.internal.scaleFactor;
      const dotX = MARGIN + indent + labelW + 2;
      const dotEnd = PW - MARGIN - 14;
      fnt("normal", 7); tc(T.rule);
      const dots = ". ".repeat(Math.max(0, Math.floor((dotEnd - dotX) / 2)));
      doc.text(dots, dotX, y);

      fnt(bold ? "bold" : "normal", 9); tc(T.navy);
      doc.text(String(pg), PW - MARGIN, y, { align: "right" });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  5  COVER PAGE
    // ═══════════════════════════════════════════════════════════════════════════
    const buildCover = () => {
      // ── Hero band ──────────────────────────────────────────────────────────
      const HERO_H = 130;
      fc(T.navyDeep); doc.rect(0, 0, PW, HERO_H, "F");

      // Depth spheres — subtle, large, mostly off-page
      fc(T.navyMid); doc.circle(PW * 0.88, HERO_H * 0.22, 54, "F");
      fc(T.navy); doc.circle(PW * 0.88, HERO_H * 0.22, 38, "F");
      fc(T.navyDeep); doc.circle(PW * 0.88, HERO_H * 0.22, 24, "F");
      fc(T.navyMid); doc.circle(-14, HERO_H * 0.85, 36, "F");
      fc(T.navyDeep); doc.circle(-14, HERO_H * 0.85, 22, "F");

      // Gold accent bar at base of hero
      fc(T.gold); doc.rect(0, HERO_H - 1.2, PW, 1.2, "F");

      // ── Logo + brand wordmark ──────────────────────────────────────────────
      const LOGO_SZ = 20;
      const LOGO_X = MARGIN;
      const LOGO_Y = MARGIN + 2;

      if (logoB64) {
        try {
          doc.addImage(logoB64, "PNG", LOGO_X, LOGO_Y, LOGO_SZ, LOGO_SZ, undefined, "FAST");
        } catch {
          // Text fallback
          fc(T.steel);
          doc.circle(LOGO_X + LOGO_SZ / 2, LOGO_Y + LOGO_SZ / 2, LOGO_SZ / 2, "F");
          fnt("bold", 12); tc(T.navy);
          doc.text("MS", LOGO_X + LOGO_SZ / 2, LOGO_Y + LOGO_SZ / 2 + 4, { align: "center" });
        }
      } else {
        fc(T.steel); doc.circle(LOGO_X + LOGO_SZ / 2, LOGO_Y + LOGO_SZ / 2, LOGO_SZ / 2, "F");
        fnt("bold", 12); tc(T.navy);
        doc.text("MS", LOGO_X + LOGO_SZ / 2, LOGO_Y + LOGO_SZ / 2 + 4, { align: "center" });
      }

      fnt("bold", 9.5); tc(T.white);
      doc.text("MALESELA PORTFOLIO", LOGO_X + LOGO_SZ + 5, LOGO_Y + 9);
      fnt("normal", 6.5); tc(T.steel);
      doc.text("Engineering  ·  Design  ·  Innovation", LOGO_X + LOGO_SZ + 5, LOGO_Y + 16);

      // ── Main headline ──────────────────────────────────────────────────────
      const HEAD_Y = 66;
      fnt("bold", 34); tc(T.white);
      doc.text("PROJECT", MARGIN, HEAD_Y);

      // "PORTFOLIO" with gold accent on first letter
      fnt("bold", 34); tc(T.gold);
      doc.text("P", MARGIN, HEAD_Y + 20);
      const pW = (doc.getStringUnitWidth("P") * 34) / doc.internal.scaleFactor;
      fnt("bold", 34); tc(T.white);
      doc.text("ORTFOLIO", MARGIN + pW, HEAD_Y + 20);

      // Subtitle
      fnt("normal", 8.5); tc(T.steel);
      doc.text("Comprehensive Technical Documentation", MARGIN, HEAD_Y + 31);

      // Gold rule
      dc(T.gold); lw(0.8);
      doc.line(MARGIN, HEAD_Y + 36, MARGIN + 68, HEAD_Y + 36);

      // Issue date badge
      const dateStr = new Date(timestamp ?? Date.now()).toLocaleDateString("en-ZA", {
        year: "numeric", month: "long", day: "numeric",
      });
      fc(T.navyMid); doc.roundedRect(MARGIN, HEAD_Y + 40, 82, 8, 1.8, 1.8, "F");
      fnt("normal", 7); tc(T.steel);
      doc.text(`Issued  ${dateStr}`, MARGIN + 4, HEAD_Y + 46);

      // ── Metadata block (below hero) ────────────────────────────────────────
      const LIST = projects;
      const CATS = [...new Set(LIST.map((p: any) => p.category))] as string[];
      const META: [string, string][] = [
        ["Client", "Valued Client"],
        ["Prepared by", "Malesela Simonmalapane"],
        ["Role", "Founder & CEO"],
        ["Reference", LIST[0]?.id ?? "N/A"],
        ["Total Projects", String(data.count ?? LIST.length)],
        ["Classification", "Confidential — Do Not Distribute"],
      ];

      let my = HERO_H + 14;
      META.forEach(([k, v], i) => {
        if (i > 0) {
          dc(T.rule); lw(0.18);
          doc.line(MARGIN, my - S["3"], PW - MARGIN, my - S["3"]);
        }
        fnt("bold", 7.8); tc(T.slate); doc.text(k, MARGIN, my);
        fnt("normal", 7.8); tc(T.ink); doc.text(v, MARGIN + 46, my);
        my += 8.5;
      });

      // ── Bottom bar ─────────────────────────────────────────────────────────
      fc(T.navyDeep); doc.rect(0, PH - 18, PW, 18, "F");
      fc(T.gold); doc.rect(0, PH - 18, PW, 0.8, "F");
      fnt("normal", 7); tc(T.steel);
      doc.text(
        "m-s-portfolio.vercel.app  ·  simonmalapane018@protonmail.com",
        PW / 2, PH - 10, { align: "center" }
      );
      fnt("bold", 7); tc(T.steel);
      doc.text("Page 1", PW - MARGIN, PH - 10, { align: "right" });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  6  TABLE OF CONTENTS
    // ═══════════════════════════════════════════════════════════════════════════
    const buildTOC = (pageMap: Record<string, number>) => {
      pg.n++;
      doc.addPage();
      drawHeader("Table of Contents");
      drawCorner();
      drawFooter();

      let y = BODY_TOP;
      y = DisplayLabel("Table of Contents", y);

      // Intro sentence
      fnt("normal", 8.5); tc(T.slate);
      const intro = "This document is structured for executive review. Each section below links to its corresponding page.";
      const introLines = doc.splitTextToSize(intro, CW);
      doc.text(introLines, MARGIN, y);
      y += introLines.length * lh(8.5) + S["8"];

      // Rows
      const rows: Array<{ label: string; page: number; bold: boolean; indent: number }> = [
        { label: "Executive Summary", page: 3, bold: true, indent: 0 },
        ...projects.map((p: any, i: number) => ({
          label: `${String(i + 1).padStart(2, "0")}   ${p.name}`,
          page: pageMap[p.id] ?? 4 + i,
          bold: false,
          indent: 3,
        })),
      ];

      rows.forEach(({ label, page, bold, indent }, idx) => {
        // Alternate row background
        if (idx % 2 === 0) {
          fc(T.snow);
          doc.rect(MARGIN, y - 4, CW, 8, "F");
        }
        TocRow(label, page, y, indent, bold);
        y += 8;
      });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  7  EXECUTIVE SUMMARY
    // ═══════════════════════════════════════════════════════════════════════════
    const buildExecSummary = () => {
  pg.n++;
  doc.addPage();
  drawHeader("Executive Summary");
  drawCorner();
  drawFooter();

  const LIST = projects;
  const CATS = [...new Set(LIST.map((p: any) => p.category))] as string[];
  const TECHS = [...new Set(LIST.flatMap((p: any) => p.techStacks ?? []))] as string[];
  const FEATS = LIST.reduce((s: number, p: any) => s + (p.features?.length ?? 0), 0);

  let y = BODY_TOP;
  y = DisplayLabel("Executive Summary", y);

  // Narrative paragraph
  const para =
    `This report presents ${LIST.length} project${LIST.length !== 1 ? "s" : ""} spanning ` +
    `${CATS.length} domain${CATS.length !== 1 ? "s" : ""} — ${CATS.join(", ")}. Collectively, they employ ` +
    `${TECHS.length} distinct technologies and deliver ${FEATS} documented features, each engineered to ` +
    `address measurable user and business objectives. The sections that follow provide full technical ` +
    `specifications, feature narratives, and visual references for each project in the portfolio.`;

  y = Body(para, y, 0);
  y += S["10"];

  // ── KPI Cards ────────────────────────────────────────────────────────────
const CARD_W = (CW - 9) / 4;
const CARD_H = 32; // Changed from 26 to 32 (bigger)

const KPIS: [string, string][] = [
  [String(LIST.length), "Projects"],
  [String(CATS.length), "Categories"],
  [String(TECHS.length), "Technologies"],
  [String(FEATS), "Key Features"],
];

KPIS.forEach(([v, l], i) => {
  KpiCard(v, l, MARGIN + i * (CARD_W + 3), y, CARD_W, CARD_H);
});

y += CARD_H + S["14"];

  // ── Category Breakdown ───────────────────────────────────────────────────
  y = SectionLabel("Category Breakdown", y);

  CATS.forEach((cat, idx) => {
    y = guard(y, 22, "Executive Summary");

    const catProjects = LIST.filter((p: any) => p.category === cat) as any[];
    
    // Join project names
    const projectNamesText = catProjects.map((p) => p.name).join("  ·  ");
    
    // Calculate available width for project names (CW - left margin offset)
    const availableWidth = CW - 7;
    
    // Split text into multiple lines if needed
    const splitNames = doc.splitTextToSize(projectNamesText, availableWidth);
    
    // Calculate required height based on number of lines
    const lineHeight = 4.5;
    const requiredHeight = 8 + (splitNames.length - 1) * lineHeight;
    
    // Adjust y position if needed
    y = guard(y, requiredHeight + 10, "Executive Summary");
    
    // Re-get catProjects after potential page break (data unchanged, but y may have updated)
    const currentCatProjects = LIST.filter((p: any) => p.category === cat) as any[];

    // Row background (alternating)
    if (idx % 2 === 0) {
      fc(T.snow); doc.rect(MARGIN, y - 3, CW, requiredHeight + 2, "F");
    }

    // Left accent bar
    fc(T.gold); doc.rect(MARGIN, y - 3, 2, requiredHeight + 2, "F");

    // Category name
    fnt("bold", 9); tc(T.navy);
    doc.text(cat, MARGIN + 7, y + 1.5);

    // Project count — right aligned
    fnt("normal", 8); tc(T.slate);
    doc.text(
      `${currentCatProjects.length} project${currentCatProjects.length !== 1 ? "s" : ""}`,
      PW - MARGIN, y + 1.5, { align: "right" }
    );

    // Project name list - multi-line
    fnt("normal", 7.5); tc(T.slate);
    for (let i = 0; i < splitNames.length; i++) {
      doc.text(splitNames[i], MARGIN + 7, y + 8 + (i * lineHeight));
    }

    y += requiredHeight + 5;
  });
};
    // ═══════════════════════════════════════════════════════════════════════════
    //  8  PROJECT DETAIL PAGE
    // ═══════════════════════════════════════════════════════════════════════════
    const buildProject = (project: any, imgB64: string | null) => {
  pg.n++;
  doc.addPage();
  drawHeader(project.name);
  drawCorner();
  drawFooter();

  let y = BODY_TOP;

  // ── Project Title Bar ────────────────────────────────────────────────────
  const BAR_H = 14;
  fc(T.navyDeep); doc.rect(MARGIN, y, CW, BAR_H, "F");
  fc(T.gold); doc.rect(MARGIN, y, 2.5, BAR_H, "F");

  if (logoB64) {
    try {
      doc.addImage(logoB64, "PNG", PW - MARGIN - 12, y + 2, 10, 10, undefined, "FAST");
    } catch { /* skip */ }
  }

  fnt("bold", 14); tc(T.white);
  doc.text(project.name, MARGIN + 8, y + BAR_H - 4);
  y += BAR_H + S["4"];

  // ── Info strip: category · demo ──────────────────────────────────────────
  const stripH = 6.5;
  fc(T.snow); doc.rect(MARGIN, y, CW, stripH, "F");
  dc(T.rule); lw(0.18);
  doc.line(MARGIN, y + stripH, PW - MARGIN, y + stripH);

  fnt("bold", 7.5); tc(T.slate);
  doc.text("CATEGORY", MARGIN + 3, y + 4.5);
  fnt("normal", 7.5); tc(T.ink);
  doc.text(project.category ?? "—", MARGIN + 26, y + 4.5);

  if (project.demoUrl) {
    fnt("bold", 7.5); tc(T.slate);
    doc.text("DEMO", PW / 2 + 4, y + 4.5);
    fnt("normal", 7.5); tc(T.navy);
    doc.textWithLink(project.demoUrl, PW / 2 + 18, y + 4.5, { url: project.demoUrl });
  }
  y += stripH + S["6"];

  // ── Two-column layout ────────────────────────────────────────────────────
  const IMG_W = 84;
  const IMG_H = 54;
  const COL_X = MARGIN + IMG_W + COL_GAP;
  const COL_W = CW - IMG_W - COL_GAP;

  ImageFrame(imgB64, MARGIN, y, IMG_W, IMG_H, project.name);

  let ry = y;

  fnt("bold", 7); tc(T.slate);
  doc.text("DESCRIPTION", COL_X, ry);
  dc(T.steel); lw(0.3);
  doc.line(COL_X, ry + 2, COL_X + COL_W, ry + 2);
  ry += S["6"];

  fnt("normal", 8.5); tc(T.ink);
  const descLines = doc.splitTextToSize(project.description ?? "No description provided.", COL_W);
  doc.text(descLines, COL_X, ry);
  ry += descLines.length * lh(8.5) + S["6"];

  fnt("bold", 7); tc(T.slate);
  doc.text("TECHNOLOGIES", COL_X, ry);
  dc(T.steel); lw(0.3);
  doc.line(COL_X, ry + 2, COL_X + COL_W, ry + 2);
  ry += S["6"];

  if ((project.techStacks ?? []).length) {
    let px = COL_X;
    let pillY = ry;

    fnt("normal", 7.2); tc(T.navy);
    (project.techStacks as string[]).forEach((tech) => {
      const tw = (doc.getStringUnitWidth(tech) * 7.2) / doc.internal.scaleFactor;
      const pw = tw + 6;
      if (px + pw > PW - MARGIN) { px = COL_X; pillY += 8.8; }
      fc(T.steelPale); dc(T.steel); lw(0.22);
      doc.roundedRect(px, pillY - 4, pw, 5.8, 1.5, 1.5, "FD");
      tc(T.navy);
      doc.text(tech, px + 3, pillY);
      px += pw + 2;
    });
    ry = pillY + 5.8 + S["2"];
  } else {
    fnt("normal", 8); tc(T.slate);
    doc.text("None specified.", COL_X, ry);
    ry += lh(8);
  }

  y = Math.max(y + IMG_H, ry) + S["8"];

 // ── Key Features ─────────────────────────────────────────────────────────
y = guard(y, 22, project.name);
y = SectionLabel("Key Features", y);

const features = project.features ?? [];
if (!features.length) {
  y = Body("No features specified.", y, 0);
} else {
  features.forEach((feat: any, fi: number) => {
    const descLines = doc.splitTextToSize(feat.description ?? "", CW - 12);
    const blockNeeded = lh(9) + S["2"] + descLines.length * lh(8.5) + S["6"] + 2;

    y = guard(y, blockNeeded, `${project.name} · continued`);

    // Feature bullet
    fc(T.navy); doc.circle(MARGIN + 4, y + 1, 4, "F");
    fc(T.gold); doc.circle(MARGIN + 4, y + 1, 2, "F");
    fnt("bold", 6.5); tc(T.navy);
    doc.text(String(fi + 1), MARGIN + 4, y + 3.5, { align: "center" });

    fnt("bold", 9); tc(T.navy);
    doc.text(feat.name, MARGIN + 11, y + 2);
    y += 8;

    fnt("normal", 8.5); tc(T.ink);
    doc.text(descLines, MARGIN + 11, y);
    y += descLines.length * lh(8.5) + S["6"];

    if (fi < features.length - 1) {
      dc(T.rule); lw(0.18);
      doc.line(MARGIN + 11, y, PW - MARGIN, y);
      y += S["4"];
    }
  });
}
};

    // ═══════════════════════════════════════════════════════════════════════════
    //  9  CLOSING PAGE
    // ═══════════════════════════════════════════════════════════════════════════
    const buildClosing = () => {
      pg.n++;
      doc.addPage();

      // Full-page navy background
      fc(T.navyDeep); doc.rect(0, 0, PW, PH, "F");

      // Ambient depth circles
      fc(T.navyMid); doc.circle(PW + 10, -10, 72, "F");
      fc(T.navyDeep); doc.circle(PW + 10, -10, 50, "F");
      fc(T.navyMid); doc.circle(-16, PH + 14, 80, "F");
      fc(T.navyDeep); doc.circle(-16, PH + 14, 56, "F");



      // Logo
      if (logoB64) {
        try {
          doc.addImage(logoB64, "PNG", PW / 2 - 16, PH / 2 - 56, 32, 32, undefined, "FAST");
        } catch { /* skip */ }
      }

      // Headline
      fnt("bold", 26); tc(T.white);
      doc.text("Thank You", PW / 2, PH / 2 - 10, { align: "center" });

      fnt("normal", 9.5); tc(T.steel);
      doc.text("for reviewing this portfolio.", PW / 2, PH / 2 + 1.5, { align: "center" });

      // Gold rule
      dc(T.gold); lw(0.8);
      doc.line(PW / 2 - 24, PH / 2 + 9, PW / 2 + 24, PH / 2 + 9);

      // Contact
      fnt("normal", 8); tc(T.steel);
      doc.text("m-s-portfolio.vercel.app", PW / 2, PH / 2 + 20, { align: "center" });
      doc.text("simonmalapane018@protonmail.com", PW / 2, PH / 2 + 29, { align: "center" });

      // Copyright
      fnt("normal", 6.5); tc([90, 110, 160] as RGB);
      doc.text(
        `© ${new Date().getFullYear()} Malesela Portfolio. All rights reserved.`,
        PW / 2, PH - 14, { align: "center" }
      );
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  10  ORCHESTRATE BUILD
    // ═══════════════════════════════════════════════════════════════════════════

    // Pre-compute page numbers before TOC is drawn
    const pageMap: Record<string, number> = {};
    projects.forEach((p: any, i: number) => { pageMap[p.id] = 4 + i; });

    buildCover();                                               // pg 1
    buildTOC(pageMap);                                          // pg 2
    buildExecSummary();                                         // pg 3
    projects.forEach((p: any, i: number) => buildProject(p, projectImages[i] ?? null)); // pg 4+
    buildClosing();                                             // last pg

    // ── Final pass: correct page totals in all footers ───────────────────────
    const total = doc.getNumberOfPages();
    const closingPageNumber = total; // Closing is always the last page

    for (let i = 1; i <= total; i++) {
      doc.setPage(i);

      // Skip footer on the closing page
      if (i !== closingPageNumber) {
        drawFooter(total);
      }
    }


    doc.save(filename);
    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob)
  };

  // Add preview function
  const handlePreview = async () => {
    try {
      setIsExporting(true)
      const dataToExport = selectedProjects && selectedProjects.length > 0 ? selectedProjects : projects

      if (dataToExport.length === 0) {
        toast.error("No projects to preview")
        return
      }

      // Transform the data
      const transformedProjects = dataToExport.map(project => ({
        id: project.id,
        name: project.name,
        image: project.image,
        category: project.category || { id: "", name: "Uncategorized" },
        techstacks: project.techstacks || [],
        description: project.description || "",
        features: project.features || [],
        demo: project.demo || "",
        status: (project.status === "published" ? "published" : "draft") as "draft" | "published"
      }))

      toast.info("Generating preview...")

      const result = await exportProjects(transformedProjects, "pdf")

      if (!result.success) {
        toast.error(result.error || "Failed to generate preview")
        return
      }

      let pdfData
      try {
        pdfData = typeof result.data === 'string'
          ? JSON.parse(result.data)
          : result.data
      } catch (parseError) {
        toast.error("Failed to generate preview: Invalid data format")
        return
      }

      // Generate PDF and get blob URL
      const blobUrl = await generatePDF(pdfData, "preview.pdf")


      // Open in new tab
      window.open(blobUrl, '_blank')

      // Clean up after a delay to allow the tab to load
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)

      toast.success("Preview opened in new tab")
    } catch (error) {
      toast.error("An error occurred during preview generation")
    } finally {
      setIsExporting(false)
    }
  }
  // Determine button text based on selection
  const getButtonText = () => {
    if (isExporting) {
      return (
        <>
          <div className="size-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          Exporting...
        </>
      )
    }

    if (selectedProjects && selectedProjects.length > 0) {
      return (
        <>
          <Download className="size-4 mr-2" />
          Export Selected ({selectedProjects.length})
          <ChevronDown className="ml-2 h-4 w-4" />
        </>
      )
    }

    return (
      <>
        <Download className="size-4 mr-2" />
        Export All
        <ChevronDown className="ml-2 h-4 w-4" />
      </>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-[#acc2ef] bg-white hover:bg-muted/10"
          disabled={isExporting}
        >
          {getButtonText()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuItem onClick={() => handlePreview()} className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          <span>Preview</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer">
          <FileJson className="mr-2 h-4 w-4" />
          <span>Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}