---
name: Protte Odonto
description: A ficha ortodôntica da Dra. Samanta Protte, preenchida para o paciente, em formas macias.
colors:
  paper: "#fdfaf4"
  paper-2: "#f8f1e5"
  sheet: "#fffefb"
  ink: "#14233f"
  ink-em: "#4a5a7d"
  ink-2: "#4f5870"
  ink-3: "#5f6678"
  rule: "#ece4d6"
  rule-2: "#cdbfa6"
  stamp: "#1d3a7a"
  gold: "#e8b44f"
  mark: "#f2c14e"
  mark-hover: "#f6cd68"
  highlighter: "#f7d77f"
  ink-hover: "#1e3157"
  night: "#0e1a31"
  night-glow: "#243b68"
  on-night: "#eef2f8"
  on-night-2: "#aab5c9"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(3rem, 1.5rem + 4.4vw, 5.5rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.015em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.4rem, 1.55rem + 2.7vw, 3.9rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.6rem, 1.3rem + 0.9vw, 2.1rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "normal"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  lead:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  button:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "normal"
  wordmark:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
rounded:
  hairline: "2px"
  sm: "14px"
  md: "22px"
  lg: "32px"
  xl: "48px"
  leaf: "220px"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  section: "clamp(4.5rem, 9vw, 8rem)"
  wrap: "1240px"
  header: "76px"
components:
  button-primary:
    backgroundColor: "{colors.mark}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "8px 8px 8px 25.6px"
    height: "56px"
  button-primary-hover:
    backgroundColor: "{colors.mark-hover}"
  button-primary-icon:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mark}"
    rounded: "{rounded.pill}"
    size: "40px"
  button-ink:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.pill}"
    height: "44px"
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.xl}"
    padding: "56px"
  faq-card:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.md}"
  appointment-card:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "30px"
  stamp:
    textColor: "{colors.stamp}"
    size: "172px"
---

# Design System: Protte Odonto

## Overview

The site reads as the clinical record of an orthodontic specialist, filled in for the visitor, drawn with soft edges on the light beige paper of the original site. The record's furniture stays (odontogram with FDI numbers, ruled table, carimbo, return-appointment card), while every container is rounded: the hero photo is an arch (the logo's smile turned over), sheets have 48px corners, buttons and chips are pills, the dark scan room opens to full width as you scroll into it and closes again on the way out.

The client asked to bring back the original logo (PROTTE in Manrope with the gold smile under the O and "ODONTOLOGIA" spaced below), the light beige page and the moving band they call the "fly", and the original typefaces: Cormorant Garamond for every heading, with italic for the phrase that matters, and Manrope for text and interface. That pairing is a brand commitment, not a default.

Signature moments: two crossed bands (navy with Cormorant italic treatments, gold with spaced capitals) that drift on their own, speed up and lean with the scroll and reverse when the visitor scrolls up; the hero words rising line by line with a yellow highlighter swiped under the italic phrase, the arch photo revealing upward while the yellow smile curve draws beneath it, the anatomic odontogram lit column by column by a passing scan beam, the 3D arch aligning through the four aligner stages, and the round carimbo landing beside the doctor's text.

## Colors

### Primary
- **Protte ink** `#12203b`: all text, tooth outlines, the header button and the circle inside the primary button.
- **Smile gold** `#e8b44f`: the logo smile, the hero smile curve, the gold band and the smiles between band items.
- **Button gold** `#f2c14e`: primary button, highlighter (`#f7d77f`) and live states (active step, open question, selected tooth, active nav underline). Same hue as the smile gold, lighter for fills.

### Neutral
- **Light beige paper** `#fdfaf4` for the page; **sheet** `#fffefb` for rounded panels, outlined by a 1px warm ring `#ece4d6`.
- **Secondary ink** `#4f5870` for body, **tertiary** `#5f6678` for labels and captions, **italic ink** `#4a5a7d` for emphasised words in headings on paper.
- **Stamp ink** `#1d3a7a`, only on the carimbo.
- **Night** `#0e1a31` with `#eef2f8` / `#aab5c9` text, only in the aligner section; italic heading words turn yellow there.

### Named Rules
- **One gold.** Gold marks the smile (logo, curve, band separators), the primary action, the highlighted phrase and live states. Nothing else is colored.
- **One dark room.** Only the 3D scan section is dark.

## Typography

Cormorant Garamond 600 for display, headlines, table names, step names, FAQ questions and the appointment card title; its italic 500 carries the emphasised phrase in each heading. Manrope for body (400), labels and links (600 to 700), buttons (700), the band capitals (800, 0.18em) and the PROTTE wordmark (700, 0.06em tracking, gold smile drawn under the O on load, "ODONTOLOGIA" at 0.32em). Tooth numbers use Manrope with tabular figures.

### Hierarchy
- Display up to 88px, line-height 0.98, three short lines allowed on desktop.
- Headline up to 62px.
- Title 26 to 34px.
- Body 17px / 1.65; lead 18px.
- Label 13px Manrope 600, sentence case.

### Named Rules
- **No kickers.** Headings stand alone.
- **Italic plus highlighter.** The phrase that matters in the hero is italic and highlighted; other headings use italic only.

## Layout

1240px wrap, fluid gutter. Each section uses its own family: split hero with an arch photo, rounded odontogram sheet, ruled table inside a rounded sheet, sticky 3D column with a dimming timeline, portrait with leaf corner beside the record copy and a round stamp, two independent columns of FAQ cards, booking copy beside a tilted appointment card. Below 960px everything stacks; the 3D arch pins under the header; below 680px the table becomes one record per treatment. Every section clips horizontal overflow so animated transforms never widen the page on phones.

## Elevation & Depth

Sheets and FAQ cards use a 1px inset ring, no shadow. Photos and the appointment card use one soft navy-tinted drop shadow. An open FAQ card gains a faint lift. No glass, no glow, no offset shadows.

## Shapes

Nothing has a sharp corner. Pills for buttons, chips, icon circles and the readout; 22px FAQ cards; 32px photos and the appointment card; 48px sheets and the dark room; the hero photo is an arch (pill top, 32px bottom); the doctor's portrait has one wide 220px corner (140px on phones). Teeth are anatomic crowns with roots, drawn as SVG symbols with non-scaling 1.4px strokes.

## Components

### Buttons
- Primary: yellow pill, ink text, an ink circle holding a yellow arrow. Hover lifts 2px, slides the circle 4px and turns the arrow 45 degrees toward the top right; press scales to 0.97.
- Ink pill: header only.
- Text link: 700 weight with a pale underline that fills with ink from the left on hover.

### Cards / Containers
- Appointment card ("Próxima consulta"): white, 32px corners, soft shadow, 1.5deg tilt that straightens on hover, yellow calendar chip, dashed field rules, "a combinar" in Cormorant italic.
- FAQ card: sheet, 22px corners, Cormorant question, round plus icon that turns yellow and rotates on open; height animates with `::details-content` where supported.

### Navigation
Sticky opaque paper header, 76px. Active and hover links get a rounded 3px yellow underline that grows from the left. Under 960px a full-screen paper sheet opens from the toggle with a circular clip and Cormorant links.

### Odontogram (signature)
32 buttons in FDI order with anatomic tooth SVGs (incisor, lateral, canine, premolar, molar), lower row mirrored. A yellow scan beam crosses the chart once; each column lights as it passes (66ms per column). Hover lifts the tooth toward the occlusal plane and fills it yellow; tap pins it; arrow keys move with a roving tabindex; the readout shows the number in a yellow chip and the tooth name.

### Crossed bands ("fly")
Two full-bleed bands between the hero and the odontogram, crossing in an X: navy (-2.6deg, 5deg on phones) over gold (2.4deg, 5.5deg on phones). Content is one repeated unit, cloned by JS until it covers the band, looped by translate3d. Base speed 34px/s in opposite directions; scroll velocity adds speed, the scroll direction sets the sense, the text leans up to 9deg with the scroll, and a mouse over the bands slows them to 20%. With view timelines they arrive opened wider (8deg, offset) and settle as they enter. The loop runs only while the bands are on screen; reduced motion keeps them still. Decorative, `aria-hidden`.

### Carimbo
Round 172px stamp: double outer ring, name and title on a circular path, "Especialista em Ortodontia" in Cormorant italic, the smile curve, the registration. Rotated -10deg, multiplied onto the paper, lands once with a short blur-to-sharp scale-down.

## Do's and Don'ts

### Do:
- Keep every container rounded and every live state yellow.
- Animate from content that is visible without JS: hidden states live only under `.js` with motion allowed, and the `.no-motion` safety net reveals everything if the script fails.
- Write in Dra. Samanta's first person, in plain Brazilian Portuguese.

### Don't:
- Don't add sharp-cornered boxes, eyebrow labels, a second marquee or a second accent color.
- Don't invent testimonials, prices, patient counts, an address or a phone number.
- Don't animate layout properties; motion uses transform, opacity, clip-path and filter.
