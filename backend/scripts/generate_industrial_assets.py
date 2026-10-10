"""Comprehensive Synthetic Industrial Asset Generator for FORGE Control Plane.

Generates engineering-grade CAD drawings, P&ID schematics, photorealistic gauge photos,
NDT ultrasonic scans, multi-page ASME inspection PDFs, and authentic SOPs.
All generated data is strictly on-premise and air-gapped compliant.
"""

import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DEMO_DIR = BASE_DIR / "data" / "demo"
IMAGES_DIR = DEMO_DIR / "images"
KNOWLEDGE_DIR = DEMO_DIR / "knowledge"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)
KNOWLEDGE_DIR.mkdir(parents=True, exist_ok=True)

# Try loading standard Windows TrueType fonts
def get_font(size: int, bold: bool = False, mono: bool = False):
    font_paths = []
    if mono:
        font_paths = ["C:/Windows/Fonts/consola.ttf", "C:/Windows/Fonts/lucon.ttf"]
    elif bold:
        font_paths = ["C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/calibrib.ttf", "C:/Windows/Fonts/seguisb.ttf"]
    else:
        font_paths = ["C:/Windows/Fonts/arial.ttf", "C:/Windows/Fonts/calibri.ttf", "C:/Windows/Fonts/segoeui.ttf"]
    
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()

def get_indic_font(size: int):
    fp = "C:/Windows/Fonts/Nirmala.ttc"
    if os.path.exists(fp):
        try:
            return ImageFont.truetype(fp, size)
        except Exception:
            pass
    return get_font(size)


# =========================================================================
# 1. GENERATE P&ID SCHEMATIC (CAD BLUEPRINT & LIGHT VERSIONS)
# =========================================================================
def generate_pid_diagram(dark_theme: bool = True):
    """Draws a professional, high-resolution CAD Piping & Instrumentation Diagram (P&ID)
    for Reaction Loop 200 (Hydrocracker Unit 24).
    """
    width, height = 2400, 1600
    
    # Palette
    if dark_theme:
        bg_color = (10, 18, 32)         # Deep CAD navy
        grid_color = (18, 30, 52)       # Subtle grid
        line_color = (230, 240, 255)     # Primary process line
        stream_color = (0, 210, 255)    # Hydrocracker flow (Cyan)
        quench_color = (100, 255, 100)  # Quench H2 (Green)
        flare_color = (255, 140, 40)    # Flare line (Orange)
        inst_color = (255, 220, 100)    # Instrument signal (Gold)
        vessel_color = (200, 220, 245)  # Equipment vessels
        text_color = (240, 245, 255)
        text_dim = (140, 170, 205)
        border_color = (70, 110, 170)
    else:
        bg_color = (255, 255, 255)      # Engineering White
        grid_color = (242, 244, 248)
        line_color = (20, 30, 45)
        stream_color = (0, 102, 204)
        quench_color = (16, 140, 60)
        flare_color = (210, 80, 20)
        inst_color = (150, 100, 20)
        vessel_color = (30, 45, 65)
        text_color = (15, 23, 42)
        text_dim = (90, 105, 130)
        border_color = (40, 60, 90)

    img = Image.new("RGB", (width, height), bg_color)
    d = ImageDraw.Draw(img)

    # 1. CAD Grid
    grid_spacing = 50
    for x in range(0, width, grid_spacing):
        d.line([(x, 0), (x, height)], fill=grid_color, width=1)
    for y in range(0, height, grid_spacing):
        d.line([(0, y), (width, y)], fill=grid_color, width=1)

    # Fonts
    f_title = get_font(32, bold=True)
    f_header = get_font(24, bold=True)
    f_tag = get_font(18, bold=True, mono=True)
    f_small = get_font(14, mono=True)
    f_tiny = get_font(12, mono=True)

    # Border & Margins
    d.rectangle([(30, 30), (width - 30, height - 30)], outline=border_color, width=4)
    d.rectangle([(36, 36), (width - 36, height - 36)], outline=border_color, width=1)

    # Top Banner
    d.rectangle([(36, 36), (width - 36, 90)], fill=grid_color, outline=border_color, width=2)
    d.text((50, 48), "MAHARASHTRA ADVANCED PETROCHEMICAL COMPLEX · SECTOR 4 · UNIT 24 HYDROPROCESSING", fill=text_color, font=f_header)
    d.text((width - 450, 52), "SOVEREIGN AIR-GAPPED CONTROL SYSTEM", fill=inst_color, font=f_tag)

    # Equipment Coordinates
    # 1. T-102 Feed Storage Tank
    t102_box = (120, 500, 260, 850)
    d.rectangle(t102_box, outline=vessel_color, width=4)
    # Dished heads
    d.arc((120, 450, 260, 550), 180, 360, fill=vessel_color, width=4)
    d.arc((120, 800, 260, 900), 0, 180, fill=vessel_color, width=4)
    d.text((150, 640), "T-102", fill=text_color, font=f_header)
    d.text((135, 680), "FEED SURGE", fill=text_dim, font=f_small)
    d.text((140, 700), "TANK (30m³)", fill=text_dim, font=f_small)

    # 2. P-201A / P-201B Slurry Feed Pumps
    # Pump A
    p201a_center = (460, 740)
    d.ellipse((p201a_center[0] - 40, p201a_center[1] - 40, p201a_center[0] + 40, p201a_center[1] + 40), outline=vessel_color, width=4)
    d.polygon([(p201a_center[0] + 20, p201a_center[1] - 35), (p201a_center[0] + 50, p201a_center[1] - 35), (p201a_center[0] + 20, p201a_center[1] - 5)], fill=vessel_color)
    d.text((p201a_center[0] - 32, p201a_center[1] - 10), "P-201A", fill=text_color, font=f_tag)
    d.text((p201a_center[0] - 35, p201a_center[1] + 50), "DUTY PUMP", fill=quench_color, font=f_small)

    # Pump B (Standby)
    p201b_center = (460, 920)
    d.ellipse((p201b_center[0] - 40, p201b_center[1] - 40, p201b_center[0] + 40, p201b_center[1] + 40), outline=vessel_color, width=4)
    d.polygon([(p201b_center[0] + 20, p201b_center[1] - 35), (p201b_center[0] + 50, p201b_center[1] - 35), (p201b_center[0] + 20, p201b_center[1] - 5)], fill=vessel_color)
    d.text((p201b_center[0] - 32, p201b_center[1] - 10), "P-201B", fill=text_color, font=f_tag)
    d.text((p201b_center[0] - 45, p201b_center[1] + 50), "AUTO-STANDBY", fill=text_dim, font=f_small)

    # 3. E-301 Shell & Tube Exchanger
    e301_box = (720, 650, 920, 830)
    d.rectangle(e301_box, outline=vessel_color, width=4)
    # Tube baffle internal lines
    for bx in range(760, 890, 30):
        d.line([(bx, 665), (bx, 815)], fill=text_dim, width=2)
    d.text((785, 720), "E-301", fill=text_color, font=f_header)
    d.text((750, 755), "EFFLUENT COOLER", fill=text_dim, font=f_small)
    d.text((760, 775), "DUTY: 8.4 MW", fill=text_dim, font=f_small)

    # 4. R-204 Catalytic Hydrocracker Reactor (Central centerpiece)
    r204_box = (1120, 320, 1380, 1100)
    # Reactor Vessel Shell
    d.rectangle(r204_box, outline=vessel_color, width=5)
    # Dished Top Head (Hemispherical)
    d.arc((1120, 220, 1380, 420), 180, 360, fill=vessel_color, width=5)
    # Dished Bottom Head
    d.arc((1120, 1000, 1380, 1200), 0, 180, fill=vessel_color, width=5)
    
    # Internal Catalyst Bed 1 & 2
    d.rectangle([(1140, 480), (1360, 640)], fill=grid_color, outline=text_dim, width=2)
    d.text((1185, 545), "CATALYST BED 1", fill=text_color, font=f_tag)
    d.text((1205, 575), "CoMo / Al2O3", fill=text_dim, font=f_small)

    d.rectangle([(1140, 760), (1360, 920)], fill=grid_color, outline=text_dim, width=2)
    d.text((1185, 825), "CATALYST BED 2", fill=text_color, font=f_tag)
    d.text((1205, 855), "NiMo / Zeolite", fill=text_dim, font=f_small)

    # Agitator Shaft & Motor AG-204
    d.rectangle([(1230, 150), (1270, 240)], outline=vessel_color, width=3)
    d.text((1220, 120), "M", fill=quench_color, font=f_header)
    d.circle((1232, 132), 18, outline=quench_color, width=2)
    d.line([(1250, 240), (1250, 470)], fill=vessel_color, width=4)
    # Agitator impellers
    d.line([(1210, 450), (1290, 450)], fill=vessel_color, width=5)

    # Reactor Labels
    d.text((1195, 360), "R-204", fill=text_color, font=f_title)
    d.text((1150, 400), "HYDROCRACKER REACTOR", fill=text_dim, font=f_small)
    d.text((1170, 420), "MAWP: 42.5 BAR @ 450°C", fill=inst_color, font=f_small)

    # 5. V-102 High Pressure Separator Flash Drum
    v102_box = (1620, 520, 1780, 900)
    d.rectangle(v102_box, outline=vessel_color, width=4)
    d.arc((1620, 460, 1780, 580), 180, 360, fill=vessel_color, width=4)
    d.arc((1620, 840, 1780, 960), 0, 180, fill=vessel_color, width=4)
    d.text((1660, 680), "V-102", fill=text_color, font=f_header)
    d.text((1635, 720), "HP FLASH DRUM", fill=text_dim, font=f_small)
    d.text((1645, 740), "GAS/LIQUID SEP", fill=text_dim, font=f_small)

    # 6. PRV-204 Safety Relief Valve & Rupture Disc PSE-204
    prv_x, prv_y = 1250, 230
    d.line([(prv_x, prv_y), (prv_x, 150)], fill=stream_color, width=4)
    d.line([(prv_x, 150), (1450, 150)], fill=stream_color, width=4)
    
    # Valve Bowtie Symbol
    d.polygon([(1450, 135), (1480, 165), (1450, 165), (1480, 135)], outline=flare_color, fill=flare_color)
    d.line([(1465, 135), (1465, 105)], fill=flare_color, width=2)
    d.polygon([(1455, 105), (1475, 105), (1465, 120)], fill=flare_color)
    d.text((1440, 75), "PRV-204", fill=flare_color, font=f_tag)
    d.text((1420, 95), "SET: 42.5 BAR", fill=text_dim, font=f_tiny)
    # Line to Flare
    d.line([(1480, 150), (1700, 150)], fill=flare_color, width=4)
    d.polygon([(1690, 140), (1715, 150), (1690, 160)], fill=flare_color)
    d.text((1725, 142), "TO FLARE HEADER (FL-01)", fill=flare_color, font=f_tag)

    # Process Piping Streams
    # Line 1: T-102 to Pump Suction
    d.line([(260, 760), (360, 760)], fill=stream_color, width=5)
    d.line([(360, 740), (420, 740)], fill=stream_color, width=5)
    d.line([(360, 740), (360, 920)], fill=stream_color, width=5)
    d.line([(360, 920), (420, 920)], fill=stream_color, width=5)
    d.text((280, 735), "6\"-HC-20401-CS", fill=stream_color, font=f_tiny)

    # Line 2: Pump Discharge to E-301
    d.line([(500, 740), (600, 740)], fill=stream_color, width=5)
    d.line([(500, 920), (600, 920)], fill=stream_color, width=5)
    d.line([(600, 740), (600, 920)], fill=stream_color, width=5)
    d.line([(600, 740), (720, 740)], fill=stream_color, width=5)
    d.text((520, 715), "4\"-HC-20402-CS", fill=stream_color, font=f_tiny)

    # Line 3: E-301 Discharge to R-204 Top Inlet
    d.line([(920, 740), (1020, 740)], fill=stream_color, width=5)
    d.line([(1020, 740), (1020, 360)], fill=stream_color, width=5)
    d.line([(1020, 360), (1120, 360)], fill=stream_color, width=5)
    d.polygon([(1105, 350), (1120, 360), (1105, 370)], fill=stream_color)
    d.text((950, 715), "FEED PREHEAT", fill=stream_color, font=f_tiny)
    d.text((1025, 450), "6\"-HC-20403-SS347-1500#", fill=stream_color, font=f_tiny)

    # Line 4: H2 Quench Injection Lines (Green)
    d.line([(1050, 200), (1050, 680)], fill=quench_color, width=3)
    d.line([(1050, 680), (1120, 680)], fill=quench_color, width=3)
    d.polygon([(1105, 672), (1120, 680), (1105, 688)], fill=quench_color)
    d.text((980, 180), "H2 QUENCH HEADER (280 L/min)", fill=quench_color, font=f_tag)
    d.text((980, 660), "QCV-204A", fill=quench_color, font=f_tiny)

    # Line 5: R-204 Bottom Effluent to V-102 Separator
    d.line([(1250, 1140), (1250, 1260)], fill=stream_color, width=6)
    d.line([(1250, 1260), (1700, 1260)], fill=stream_color, width=6)
    d.line([(1700, 1260), (1700, 940)], fill=stream_color, width=6)
    d.polygon([(1692, 955), (1700, 940), (1708, 955)], fill=stream_color)
    d.text((1350, 1235), "8\"-EF-20404-SS347-1500# (REACTOR EFFLUENT 412°C)", fill=stream_color, font=f_small)

    # Line 6: V-102 Overhead Gas to Recycle & Bottoms to Fractionator
    d.line([(1700, 480), (1700, 400)], fill=quench_color, width=4)
    d.line([(1700, 400), (1950, 400)], fill=quench_color, width=4)
    d.polygon([(1935, 392), (1950, 400), (1935, 408)], fill=quench_color)
    d.text((1750, 380), "H2 RECYCLE GAS TO C-201", fill=quench_color, font=f_tag)

    d.line([(1700, 900), (1700, 1020)], fill=stream_color, width=4)
    d.line([(1700, 1020), (1950, 1020)], fill=stream_color, width=4)
    d.polygon([(1935, 1012), (1950, 1020), (1935, 1028)], fill=stream_color)
    d.text((1750, 1000), "LIQUID HC TO C-401 COLUMN", fill=stream_color, font=f_tag)

    # =========================================================================
    # ISA-5.1 INSTRUMENT BALLOONS
    # =========================================================================
    def draw_balloon(cx, cy, label_top, label_bottom, is_dcs=True, lead_line=None):
        if lead_line:
            d.line([(lead_line[0], lead_line[1]), (cx, cy)], fill=inst_color, width=2)
        r = 26
        if is_dcs:
            # DCS symbol: Square enclosing circle
            d.rectangle([(cx - r - 3, cy - r - 3), (cx + r + 3, cy + r + 3)], outline=inst_color, width=2)
        d.ellipse([(cx - r, cy - r), (cx + r, cy + r)], fill=bg_color, outline=inst_color, width=2)
        d.line([(cx - r, cy), (cx + r, cy)], fill=inst_color, width=2)
        d.text((cx - 16, cy - 19), label_top, fill=text_color, font=f_small)
        d.text((cx - 16, cy + 3), label_bottom, fill=text_color, font=f_small)

    # 1. PT-204A & PT-204B (Head Pressure Transmitters - 2oo3 Voting)
    draw_balloon(1030, 260, "PT", "204A", is_dcs=True, lead_line=(1160, 260))
    draw_balloon(1030, 330, "PT", "204B", is_dcs=True, lead_line=(1180, 280))

    # 2. PI-204 (Local Analog Dial Bourdon Gauge)
    draw_balloon(1440, 310, "PI", "204", is_dcs=False, lead_line=(1360, 290))
    d.text((1480, 305), "LOCAL GAUGE (33.0 BAR)", fill=inst_color, font=f_small)

    # 3. TT-204A, B, C (Multi-point Thermocouple Array)
    draw_balloon(1440, 540, "TT", "204A", is_dcs=True, lead_line=(1360, 540))
    draw_balloon(1440, 680, "TT", "204B", is_dcs=True, lead_line=(1360, 680))
    draw_balloon(1440, 840, "TT", "204C", is_dcs=True, lead_line=(1360, 840))
    d.text((1480, 675), "BED DELTA-T: 32.4°C (LIMIT: 38°C)", fill=quench_color, font=f_small)

    # 4. FT-204 (Quench Coriolis Flow Transmitter)
    draw_balloon(950, 480, "FT", "204", is_dcs=True, lead_line=(1050, 480))
    d.text((820, 510), "RATE: 294 L/min", fill=quench_color, font=f_small)

    # 5. LT-204 (Reactor Bottom Level Transmitter)
    draw_balloon(1030, 960, "LT", "204", is_dcs=True, lead_line=(1160, 960))

    # 6. DPT-201 (Pump Differential Pressure)
    draw_balloon(560, 640, "PDT", "201", is_dcs=True, lead_line=(500, 740))

    # 7. TT-301 (Exchanger E-301 Effluent Temp)
    draw_balloon(820, 560, "TT", "301", is_dcs=True, lead_line=(820, 650))

    # =========================================================================
    # TITLE BLOCK (ASME / ISO STANDARD)
    # =========================================================================
    tb_x1, tb_y1, tb_x2, tb_y2 = width - 680, height - 260, width - 40, height - 40
    d.rectangle([(tb_x1, tb_y1), (tb_x2, tb_y2)], fill=grid_color, outline=border_color, width=3)
    d.line([(tb_x1, tb_y1 + 45), (tb_x2, tb_y1 + 45)], fill=border_color, width=2)
    d.line([(tb_x1, tb_y1 + 95), (tb_x2, tb_y1 + 95)], fill=border_color, width=2)
    d.line([(tb_x1, tb_y1 + 155), (tb_x2, tb_y1 + 155)], fill=border_color, width=2)
    d.line([(tb_x1 + 320, tb_y1), (tb_x1 + 320, tb_y2)], fill=border_color, width=2)

    d.text((tb_x1 + 15, tb_y1 + 12), "BHARAT PETROCHEMICAL COMPLEX", fill=text_color, font=f_header)
    d.text((tb_x1 + 335, tb_y1 + 15), "UNIT 24 · LOOP 200", fill=inst_color, font=f_tag)

    d.text((tb_x1 + 15, tb_y1 + 55), "TITLE: PIPING & INSTRUMENTATION DIAGRAM", fill=text_color, font=f_tag)
    d.text((tb_x1 + 15, tb_y1 + 72), "SYSTEM: HYDROCRACKER REACTION LOOP R-204", fill=text_dim, font=f_small)

    d.text((tb_x1 + 335, tb_y1 + 55), "DWG NO: PID-204-REV-C", fill=text_color, font=f_tag)
    d.text((tb_x1 + 335, tb_y1 + 72), "SCALE: NONE | SHT 1 OF 1", fill=text_dim, font=f_small)

    d.text((tb_x1 + 15, tb_y1 + 105), "DESIGNED: K. SHARMA, PE", fill=text_dim, font=f_small)
    d.text((tb_x1 + 15, tb_y1 + 125), "CHECKED:  D. MHATRE, LEAD", fill=text_dim, font=f_small)
    d.text((tb_x1 + 335, tb_y1 + 105), "APPROVED: V. RAJAN, DIR", fill=text_dim, font=f_small)
    d.text((tb_x1 + 335, tb_y1 + 125), "DATE:     2026-08-15", fill=text_dim, font=f_small)

    # Sovereign Verification Seal
    d.rectangle([(tb_x1 + 15, tb_y1 + 165), (tb_x2 - 15, tb_y2 - 10)], fill=bg_color, outline=quench_color, width=2)
    d.text((tb_x1 + 25, tb_y1 + 172), "FORGE AIR-GAPPED VERIFICATION ENCLAVE · CRYPTOGRAPHIC AUDIT PASSED", fill=quench_color, font=f_tag)
    d.text((tb_x1 + 25, tb_y1 + 195), "SECURITY LEVEL: CONFIDENTIAL · GOVERNANCE: DEFAULT-DENY ENFORCED", fill=text_dim, font=f_small)

    # Save PNG
    filename = "pid_reactor_r204_loop.png" if dark_theme else "pid_reactor_r204_loop_light.png"
    out_path = IMAGES_DIR / filename
    img.save(out_path, format="PNG", optimize=True)
    print(f"Generated P&ID: {out_path} ({width}x{height})")
    return img


# =========================================================================
# 2. GENERATE HIGH-DPI PHOTOREALISTIC ANALOG PRESSURE GAUGE
# =========================================================================
def generate_pressure_gauge(pressure_bar: float = 33.0):
    """Renders a razor-sharp, photorealistic 1200x1200px analog Bourdon tube pressure gauge
    displaying Reactor R-204 pressure (Tag: PI-204) with ASME B40.100 markings.
    """
    size = 1200
    img = Image.new("RGB", (size, size), (240, 243, 248))
    d = ImageDraw.Draw(img)

    cx, cy = size // 2, size // 2
    r_outer = 560
    r_dial = 510

    # Fonts
    f_brand = get_font(28, bold=True)
    f_tag = get_font(36, bold=True, mono=True)
    f_unit = get_font(26, bold=True)
    f_num = get_font(24, bold=True)
    f_small = get_font(18, bold=False)
    f_cal = get_font(15, mono=True)

    # 1. Stainless Steel Bezel (concentric metallic rings)
    d.ellipse([(cx - r_outer, cy - r_outer), (cx + r_outer, cy + r_outer)], fill=(180, 186, 196), outline=(130, 136, 148), width=8)
    d.ellipse([(cx - r_outer + 20, cy - r_outer + 20), (cx + r_outer - 20, cy + r_outer - 20)], fill=(215, 220, 228), outline=(160, 168, 180), width=4)
    d.ellipse([(cx - r_outer + 35, cy - r_outer + 35), (cx + r_outer - 35, cy + r_outer - 35)], fill=(120, 126, 136), outline=(90, 96, 106), width=3)
    # Dial Face (Matte White)
    d.ellipse([(cx - r_dial, cy - r_dial), (cx + r_dial, cy + r_dial)], fill=(255, 255, 255), outline=(100, 105, 115), width=3)

    # Mounting screws on bezel
    for deg in [45, 135, 225, 315]:
        sx = cx + int((r_outer - 18) * math.cos(math.radians(deg)))
        sy = cy + int((r_outer - 18) * math.sin(math.radians(deg)))
        d.circle((sx, sy), 10, fill=(160, 165, 175), outline=(100, 105, 115), width=2)
        d.line([(sx - 7, sy), (sx + 7, sy)], fill=(80, 85, 95), width=2)

    # Scale Geometry:
    # 0 to 60 BAR over 270 degrees sweep
    # Angle start = 135 deg (bottom left), Angle end = 405 deg (bottom right, 45 deg)
    start_angle = 135.0
    sweep_angle = 270.0
    max_scale = 60.0

    def val_to_angle(v):
        return start_angle + (v / max_scale) * sweep_angle

    # Colored Sectors on Dial Arc
    # Normal Green Sector: 28 to 32.5 BAR
    # Warning Amber Sector: 32.5 to 35.0 BAR
    # Hazard Red Sector: 35.0 to 60.0 BAR
    r_sector = 460
    for deg_step in range(int(val_to_angle(28.0)), int(val_to_angle(32.5))):
        rad = math.radians(deg_step)
        p1 = (cx + int((r_sector - 20) * math.cos(rad)), cy + int((r_sector - 20) * math.sin(rad)))
        p2 = (cx + int(r_sector * math.cos(rad)), cy + int(r_sector * math.sin(rad)))
        d.line([p1, p2], fill=(46, 184, 92), width=3)

    for deg_step in range(int(val_to_angle(32.5)), int(val_to_angle(35.0))):
        rad = math.radians(deg_step)
        p1 = (cx + int((r_sector - 20) * math.cos(rad)), cy + int((r_sector - 20) * math.sin(rad)))
        p2 = (cx + int(r_sector * math.cos(rad)), cy + int(r_sector * math.sin(rad)))
        d.line([p1, p2], fill=(245, 158, 11), width=3)

    for deg_step in range(int(val_to_angle(35.0)), int(val_to_angle(60.0))):
        rad = math.radians(deg_step)
        p1 = (cx + int((r_sector - 20) * math.cos(rad)), cy + int((r_sector - 20) * math.sin(rad)))
        p2 = (cx + int(r_sector * math.cos(rad)), cy + int(r_sector * math.sin(rad)))
        d.line([p1, p2], fill=(239, 68, 68), width=3)

    # Dial Graduations & Numerals (0 to 60 BAR)
    r_tick_outer = 480
    for v in range(0, 61):
        ang = val_to_angle(v)
        rad = math.radians(ang)
        if v % 5 == 0:
            # Major tick
            r_tick_inner = 430
            p1 = (cx + int(r_tick_inner * math.cos(rad)), cy + int(r_tick_inner * math.sin(rad)))
            p2 = (cx + int(r_tick_outer * math.cos(rad)), cy + int(r_tick_outer * math.sin(rad)))
            d.line([p1, p2], fill=(20, 25, 35), width=4)
            # Numeral
            r_num = 390
            nx = cx + int(r_num * math.cos(rad)) - 14
            ny = cy + int(r_num * math.sin(rad)) - 14
            d.text((nx, ny), str(v), fill=(15, 20, 30), font=f_num)
        elif v % 1 == 0:
            # Minor tick
            r_tick_inner = 455
            p1 = (cx + int(r_tick_inner * math.cos(rad)), cy + int(r_tick_inner * math.sin(rad)))
            p2 = (cx + int(r_tick_outer * math.cos(rad)), cy + int(r_tick_outer * math.sin(rad)))
            d.line([p1, p2], fill=(60, 65, 75), width=2)

    # Redline Trip Limit Marker at 42.5 BAR
    ang_trip = val_to_angle(42.5)
    rad_trip = math.radians(ang_trip)
    pt1 = (cx + int(420 * math.cos(rad_trip)), cy + int(420 * math.sin(rad_trip)))
    pt2 = (cx + int(495 * math.cos(rad_trip)), cy + int(495 * math.sin(rad_trip)))
    d.line([pt1, pt2], fill=(220, 20, 20), width=6)
    # Trip Triangle Indicator
    d.polygon([(pt2[0] - 6, pt2[1] - 6), (pt2[0] + 6, pt2[1] - 6), (pt2[0], pt2[1] + 8)], fill=(220, 20, 20))

    # Center Branding & Specifications
    d.text((cx - 140, cy - 230), "WIKA", fill=(10, 25, 60), font=get_font(42, bold=True))
    d.text((cx - 150, cy - 180), "MODEL 232.50 · ASME B40.100", fill=(70, 80, 95), font=f_small)
    d.text((cx - 120, cy - 155), "SAFETY GLASS · 316L SS WETTED", fill=(90, 100, 115), font=f_cal)

    # Tag Plate
    d.rectangle([(cx - 180, cy + 90), (cx + 180, cy + 145)], fill=(245, 247, 250), outline=(150, 160, 175), width=2)
    d.text((cx - 145, cy + 100), "TAG: PI-204", fill=(15, 23, 42), font=f_tag)
    d.text((cx - 130, cy + 160), "REACTOR R-204 HEAD PRESSURE", fill=(70, 80, 95), font=f_small)

    d.text((cx - 30, cy + 205), "bar", fill=(15, 23, 42), font=f_unit)
    d.text((cx - 40, cy + 240), "KL. 1.0", fill=(110, 120, 135), font=f_small)

    # Calibration Sticker (at 7 o'clock on bezel)
    cs_x, cs_y = 120, 920
    d.rectangle([(cs_x, cs_y), (cs_x + 320, cs_y + 110)], fill=(254, 249, 195), outline=(202, 138, 4), width=2)
    d.text((cs_x + 10, cs_y + 10), "INSTRUMENT CALIBRATION SEAL", fill=(113, 63, 18), font=get_font(13, bold=True))
    d.text((cs_x + 10, cs_y + 32), "CAL DATE: 2026-06-15", fill=(113, 63, 18), font=f_cal)
    d.text((cs_x + 10, cs_y + 52), "DUE DATE: 2027-06-14", fill=(113, 63, 18), font=f_cal)
    d.text((cs_x + 10, cs_y + 72), "TECH ID: NDT-88 (NIST-TRACE)", fill=(113, 63, 18), font=f_cal)

    # Precision Knife-Edge Needle pointing at pressure_bar
    needle_ang = val_to_angle(pressure_bar)
    needle_rad = math.radians(needle_ang)
    needle_len = 460
    counter_len = 90

    tip = (cx + int(needle_len * math.cos(needle_rad)), cy + int(needle_len * math.sin(needle_rad)))
    counter = (cx - int(counter_len * math.cos(needle_rad)), cy - int(counter_len * math.sin(needle_rad)))
    
    # Perpendicular width for knife-edge taper
    perp_rad = needle_rad + math.pi / 2
    w_base = 12
    b1 = (cx + int(w_base * math.cos(perp_rad)), cy + int(w_base * math.sin(perp_rad)))
    b2 = (cx - int(w_base * math.cos(perp_rad)), cy - int(w_base * math.sin(perp_rad)))

    # Draw needle shadow
    shadow_offset = 6
    s_tip = (tip[0] + shadow_offset, tip[1] + shadow_offset)
    s_counter = (counter[0] + shadow_offset, counter[1] + shadow_offset)
    d.polygon([s_counter, b1, s_tip, b2], fill=(180, 185, 195, 120))

    # Draw crisp needle (Glossy Black)
    d.polygon([counter, b1, tip, b2], fill=(15, 20, 25))

    # Center Needle Cap / Hub
    d.circle((cx, cy), 32, fill=(180, 185, 195), outline=(60, 65, 75), width=3)
    d.circle((cx, cy), 16, fill=(30, 35, 45))
    d.circle((cx - 4, cy - 4), 5, fill=(240, 245, 255))

    # Digital Reading Stamp in top corner for OCR verification
    d.rectangle([(size - 360, 40), (size - 40, 110)], fill=(15, 23, 42), outline=(59, 130, 246), width=2)
    d.text((size - 340, 50), "OBSERVED DIAL READING", fill=(147, 197, 253), font=get_font(12, bold=True))
    d.text((size - 340, 70), f"{pressure_bar:.1f} BAR GAUGE", fill=(255, 255, 255), font=get_font(24, bold=True, mono=True))

    out_path = IMAGES_DIR / "r204_pressure_gauge.png"
    img.save(out_path, format="PNG", optimize=True)
    print(f"Generated Pressure Gauge: {out_path} ({size}x{size})")
    return img


# =========================================================================
# 3. GENERATE NDT ULTRASONIC CORROSION THICKNESS SCAN (PAUT B-SCAN)
# =========================================================================
def generate_ndt_scan():
    """Renders a high-resolution 1200x900px Phased Array Ultrasonic Testing (PAUT)
    wall thickness scan for Reactor R-204 shell course Ring 2 & Nozzle N-2.
    """
    w, h = 1200, 900
    img = Image.new("RGB", (w, h), (10, 16, 26))
    d = ImageDraw.Draw(img)

    f_title = get_font(22, bold=True)
    f_body = get_font(16, bold=True, mono=True)
    f_small = get_font(13, mono=True)

    # Frame & Grid
    d.rectangle([(20, 20), (w - 20, h - 20)], outline=(40, 60, 90), width=3)

    # Instrument Header Bar (Olympus OmniScan SX Style)
    d.rectangle([(20, 20), (w - 20, 75)], fill=(18, 28, 48), outline=(40, 60, 90), width=1)
    d.text((40, 35), "OLYMPUS OMNISCAN SX · PHASED ARRAY UT · FILE: R204_NDT_2026.DAT", fill=(220, 230, 250), font=f_title)
    d.text((w - 380, 38), "CALIBRATION: ASME V / API 510", fill=(0, 210, 255), font=f_body)

    # Scan Display Area
    scan_box = (100, 120, 1050, 650)
    d.rectangle(scan_box, fill=(5, 10, 18), outline=(60, 90, 130), width=2)

    # Grid ticks (Depth 0 to 80 mm on Y, Position 0 to 500 mm on X)
    for x in range(scan_box[0], scan_box[2], 95):
        d.line([(x, scan_box[1]), (x, scan_box[3])], fill=(20, 35, 55), width=1)
        pos_mm = int((x - scan_box[0]) * 500 / (scan_box[2] - scan_box[0]))
        d.text((x - 12, scan_box[3] + 10), f"{pos_mm}mm", fill=(100, 125, 155), font=f_small)

    for y in range(scan_box[1], scan_box[3], 66):
        d.line([(scan_box[0], y), (scan_box[2], y)], fill=(20, 35, 55), width=1)
        depth_mm = int((y - scan_box[1]) * 80 / (scan_box[3] - scan_box[1]))
        d.text((50, y - 8), f"{depth_mm}mm", fill=(100, 125, 155), font=f_small)

    # Synthetic B-Scan Echoes (Thickness layer representation)
    # Nominal thickness: 74.6 mm (Y around depth 74.6 = 600px)
    # Thinning region around X = 650..750 mm (Nozzle N-2 toe): drops to 72.8 mm
    y_front = scan_box[1] + 20
    d.line([(scan_box[0], y_front), (scan_box[2], y_front)], fill=(0, 200, 255), width=4) # Front wall echo

    # Backwall echo across the scan length
    backwall_points = []
    for x in range(scan_box[0], scan_box[2], 4):
        # Calculate thickness
        dist = x - scan_box[0]
        # Simulate local thinning depression at nozzle N-2
        if 480 <= dist <= 700:
            dip = 1.8 * math.sin(math.pi * (dist - 480) / 220)
            thick = 74.64 - dip
        else:
            thick = 74.64 + 0.15 * math.sin(dist / 30.0)
        y_val = scan_box[1] + int(thick * (scan_box[3] - scan_box[1]) / 80.0)
        backwall_points.append((x, y_val))

    # Draw color-coded ultrasonic amplitude wave
    for i in range(len(backwall_points) - 1):
        pt1 = backwall_points[i]
        pt2 = backwall_points[i+1]
        # Color based on thickness: <73.0 mm is Amber/Yellow, >=73.0 mm is Green/Cyan
        val = 80.0 * (pt1[1] - scan_box[1]) / (scan_box[3] - scan_box[1])
        c = (234, 179, 8) if val < 73.0 else (34, 197, 94)
        d.line([pt1, pt2], fill=c, width=5)

    # Gate & Cursor 1 (At minimum thickness spot: 72.8 mm)
    cur1_x = scan_box[0] + 590
    cur1_y = scan_box[1] + int(72.84 * (scan_box[3] - scan_box[1]) / 80.0)
    d.line([(cur1_x, scan_box[1]), (cur1_x, scan_box[3])], fill=(239, 68, 68), width=2)
    d.line([(scan_box[0], cur1_y), (scan_box[2], cur1_y)], fill=(239, 68, 68), width=2)
    d.circle((cur1_x, cur1_y), 8, outline=(255, 255, 255), width=2)

    # Callout Box for Cursor 1
    d.rectangle([(cur1_x + 20, cur1_y - 80), (cur1_x + 360, cur1_y + 10)], fill=(20, 30, 48), outline=(239, 68, 68), width=2)
    d.text((cur1_x + 30, cur1_y - 70), "GATE A PEAK: 72.84 mm (MINIMUM)", fill=(239, 68, 68), font=f_body)
    d.text((cur1_x + 30, cur1_y - 48), "LOCATION: NOZZLE N-2 WELD TOE", fill=(240, 245, 255), font=f_small)
    d.text((cur1_x + 30, cur1_y - 28), "RETIREMENT LIMIT: 68.20 mm [PASS]", fill=(34, 197, 94), font=f_small)

    # Cursor 2 (Nominal Shell: 74.6 mm)
    cur2_x = scan_box[0] + 250
    cur2_y = scan_box[1] + int(74.62 * (scan_box[3] - scan_box[1]) / 80.0)
    d.circle((cur2_x, cur2_y), 6, outline=(34, 197, 94), width=2)
    d.rectangle([(cur2_x - 220, cur2_y - 70), (cur2_x - 10, cur2_y)], fill=(20, 30, 48), outline=(34, 197, 94), width=1)
    d.text((cur2_x - 210, cur2_y - 60), "NOMINAL: 74.62 mm", fill=(34, 197, 94), font=f_body)
    d.text((cur2_x - 210, cur2_y - 38), "COURSE RING 2 SHELL", fill=(200, 215, 235), font=f_small)

    # Bottom Inspection Summary Strip
    d.rectangle([(20, 680), (w - 20, h - 20)], fill=(15, 25, 42), outline=(40, 60, 90), width=2)
    d.text((40, 700), "ASME SECTION VIII DIV 1 ASSESSMENT SUMMARY", fill=(0, 210, 255), font=f_body)
    
    col1 = "NOMINAL DESIGN THICKNESS: 75.00 mm\nNOMINAL CORROSION ALLOWANCE: 4.50 mm\nMEASURED LOCAL T_MIN: 72.84 mm"
    col2 = "RETIREMENT CRITICAL THICKNESS: 68.20 mm\nMEASURED SAFETY MARGIN: +4.64 mm\nANNUAL CORROSION RATE: 0.040 mm/year"
    col3 = "ESTIMATED REMAINING LIFE: 116.0 YEARS\nINTEGRITY STATUS: FIT FOR SERVICE\nNEXT TURNAROUND NDT: 2028-Q2"
    
    d.text((40, 735), col1, fill=(240, 245, 255), font=f_small)
    d.text((420, 735), col2, fill=(240, 245, 255), font=f_small)
    d.text((800, 735), col3, fill=(34, 197, 94), font=f_small)

    out_path = IMAGES_DIR / "r204_inspection_corrosion.png"
    img.save(out_path, format="PNG", optimize=True)
    print(f"Generated NDT Scan: {out_path} ({w}x{h})")
    return img


# =========================================================================
# 4. GENERATE HIGH-FIDELITY SOP MARKDOWN DOCUMENTS
# =========================================================================
def generate_sop_markdowns():
    """Generates authentic, engineering-grade Standard Operating Procedures."""
    
    # 1. SOP-ENG-204-REV-E: Reactor R-204 Startup and Operation
    sop_r204 = """# SOP-ENG-204-REV-E: Standard Operating Procedure for Hydrocracker Reactor R-204

## Document Control & Governance
- **Document Number:** SOP-ENG-204-REV-E
- **Security Classification:** INTERNAL
- **Governing Standard:** OSHA 1910.119 PSM / ASME Section VIII Division 1 / API RP 520
- **Target Assets:** R-204 (CSTR Hydrocracker), P-201A/B (Feed Slurry Pumps), E-301 (Effluent Cooler)
- **Effective Date:** 2026-08-15
- **Next Mandatory Review:** 2028-08-14
- **Approved By:** Dr. V. Rajan, PE (VP Engineering & Reliability)

---

## 1. Operating Envelope & Trip Limits (Safe Operating Limits - SOL)

All operators and automated control loops must maintain operations strictly within the following envelopes:

| Process Parameter | Monitored Tag | Normal Operating Baseline | High Alarm (LAH/PAH/TAH) | Emergency Trip Setpoint (ESD-01) |
|---|---|---|---|---|
| Vessel Head Pressure | PT-204A / PT-204B | 31.2 bar gauge | 33.5 bar gauge | **35.0 bar gauge** |
| Local Bourdon Indication | PI-204 | 31.2 bar gauge | 33.0 bar gauge (Visual) | 35.0 bar gauge |
| Maximum Allowable Working P | R-204 Shell | 42.5 bar gauge (MAWP) | 42.8 bar gauge (Relief Lift) | **43.0 bar gauge** |
| Catalyst Bed 1 Temperature | TT-204A | 398.0 °C | 418.0 °C | 440.0 °C |
| Catalyst Bed 2 Temperature | TT-204B | 412.5 °C | 425.0 °C | 440.0 °C |
| Bed 1 Exotherm Differential | Delta-T (TT-204A) | 32.4 °C | 38.0 °C | 45.0 °C (Quench Trip) |
| Secondary Quench Flow Rate | FT-204 | 294 L/min | 275 L/min (Low Flow) | 260 L/min (Permissive Trip) |
| Thermal Heating/Cooling Ramp | Vessel Skin | < 20.0 °C / hour | 25.0 °C / hour | > 25.0 °C / hour (Cladding Risk) |

---

## 2. Step-by-Step Normal Pressurization & Startup Sequence

### Phase A: Atmospheric Inerting & Leak Tightness Proof
1. Confirm nitrogen (N2) purge loop is active. Verify effluent oxygen content via GC-101 is `< 0.10% by volume`.
2. Confirm dewpoint of vessel atmosphere is below `-40.0 °C`.
3. Pressurize R-204 vessel to `5.0 bar gauge` using dry utility nitrogen. Perform acoustic ultrasonic leak detection on all manway flanges and nozzle N-1/N-2 gasket joints. Zero bubbling or acoustic emission permitted.

### Phase B: Hydrogen Circulation & Warm-Up
4. Align feed effluent path through Shell & Tube Exchanger `E-301`.
5. Establish hydrogen gas circulation loop using Recycle Compressor `C-201` at `15.0 bar gauge`.
6. Initiate preheater firing at a controlled ramp rate strictly below `20.0 °C/hour`.
7. Once reactor bed temperature reaches `320.0 °C`, raise system pressure in 5.0 bar increments to the normal operating baseline of `31.2 bar gauge`.

### Phase C: Hydrocarbon Slurry Introduction
8. Start Slurry Feed Pump `P-201A` on minimum spillback recirculation flow.
9. Open feed block valve `XV-204A` and ramp catalyst feed slurry slowly to design space (240 m³/hr).
10. Confirm quench control valve `QCV-204A` modulates smoothly to maintain secondary quench flow above `280 L/min`.

---

## 3. Emergency Response Protocols

### Condition Alpha: High Pressure Exotherm (>33.5 bar gauge)
1. Verify agreement between redundant pressure transmitters `PT-204A` and `PT-204B`. If variance exceeds `0.5 bar`, flag sensor deviation.
2. Maximize hydrogen quench flow via `QCV-204A` to 350 L/min to quench the exotherm.
3. If pressure exceeds `35.0 bar gauge`, Emergency Shutdown `ESD-01` trips automatically:
   - Trip feed pump `P-201A/B` immediately.
   - Close reactor isolation valves `XV-204A` and `XV-204B`.
   - Modulate blowdown valve `BDV-204` to depressurize reactor to flare header at `2.0 bar/minute`.

### Condition Beta: Multilingual Emergency Directives
- **ENGLISH:** Critical Safety Limit: Do not exceed 42.5 BAR. Immediately isolate valve HV-204 and notify the shift supervisor if pressure exceeds 42.8 BAR.
- **HINDI (हिंदी):** महत्वपूर्ण सुरक्षा सीमा: रिएक्टर परिचालन दबाव 42.5 BAR से अधिक न होने दें। यदि दबाव 42.8 BAR से अधिक हो जाए, तो तुरंत वाल्व HV-204 बंद करें और शिफ्ट सुपरवाइजर को सूचित करें।
- **KANNADA (ಕನ್ನಡ):** ನಿರ್ಣಾಯಕ ಸುರಕ್ಷತಾ ಮಿತಿ: ರಿಯಾಕ್ಟರ್‌ ಕಾರ್ಯಾಚರಣೆಯ ಒತ್ತಡವು 42.5 BAR ಮೀರುವುದನ್ನು ತಡೆಯಿರಿ. ಒತ್ತಡವು 42.8 BAR ಮೀರಿದರೆ, ತಕ್ಷಣ ವಾಲ್ವ್‌ HV-204 ಅನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ಮತ್ತು ಪಾಳಿ ಮೇಲ್ವಿಚಾರಕರಿಗೆ ತಿಳಿಸಿ.
"""
    (KNOWLEDGE_DIR / "sop_r204_reactor_startup.md").write_text(sop_r204, encoding="utf-8")

    # 2. SOP-ROT-201-REV-C: Slurry Feed Pump P-201 Cavitation & Switchover
    sop_p201 = """# SOP-ROT-201-REV-C: Centrifugal Feed Pump P-201A/B Cavitation & Auto-Switchover

## Document Control & Governance
- **Document Number:** SOP-ROT-201-REV-C
- **Security Classification:** INTERNAL
- **Governing Standard:** API 610 (Centrifugal Pumps for Petroleum) / ISO 10816-3 (Vibration Severity)
- **Target Assets:** P-201A (Primary Slurry Feed Pump), P-201B (Standby Slurry Feed Pump)
- **Effective Date:** 2026-09-05

---

## 1. Machinery Baseline & Vibration Envelopes (ISO 10816-3 Group 1)

| Operating Zone | Drive-End Vibration (mm/s RMS) | Bearing Temp (°C) | Suction Strainer DP (bar) | Action Required |
|---|---|---|---|---|
| **Zone A (New/Good)** | 0.0 - 2.80 mm/s | 45.0 - 65.0 °C | < 0.15 bar | Unrestricted continuous operation. |
| **Zone B (Acceptable)**| 2.81 - 4.50 mm/s | 65.1 - 75.0 °C | 0.15 - 0.25 bar | Monitor at 4-hour shift logs. |
| **Zone C (Warning)**   | 4.51 - 7.10 mm/s | 75.1 - 85.0 °C | 0.26 - 0.35 bar | Inspect for cavitation; schedule P-201B switch. |
| **Zone D (Trip/Hazard)**| **> 7.10 mm/s** | **> 85.0 °C** | **> 0.35 bar** | Immediate auto-switchover to P-201B; trip P-201A. |

---

## 2. Cavitation Diagnostic Indicators
- High-frequency metallic cracking acoustics in suction casing (NPSHa < NPSHr).
- Discharge pressure oscillations exceeding `± 1.2 bar`.
- Suction strainer differential pressure `PDT-201` spiking above `0.30 bar` due to catalyst fines accumulation.

---

## 3. Seamless Auto-Switchover Sequence (P-201A to P-201B)
1. Verify Standby Pump `P-201B` seal flush buffer fluid pressure is maintained at `4.0 bar gauge`.
2. Crack open P-201B minimum warm-up recirculation bypass valve `V-201B-W` to equalize thermal casing temperature to within `15.0 °C` of process stream.
3. Start electric motor driver for `P-201B`. Allow discharge pressure to establish at `48.5 bar gauge`.
4. Open P-201B discharge control valve while simultaneously throttling P-201A discharge valve over a synchronized `45-second ramp` to eliminate pressure surges to Reactor R-204.
5. Trip motor on `P-201A`. Apply Lockout/Tagout (LOTO) for mechanical seal and bearing inspection.
"""
    (KNOWLEDGE_DIR / "sop_p201_feed_pump_cavitation.md").write_text(sop_p201, encoding="utf-8")

    # 3. SOP-EXCH-301-REV-D: Effluent Cooler E-301 Loss of Cooling
    sop_e301 = """# SOP-EXCH-301-REV-D: Emergency Protocol for Loss of Effluent Cooling on Exchanger E-301

## Document Control & Governance
- **Document Number:** SOP-EXCH-301-REV-D
- **Security Classification:** INTERNAL
- **Governing Standard:** TEMA Standards Class R / API 660 (Shell-and-Tube Exchangers)
- **Target Assets:** E-301 (Reactor Effluent Shell-and-Tube Exchanger), V-102 (Flash Drum)
- **Effective Date:** 2026-08-01

---

## 1. Thermal Envelope & Heat Duty Specifications
- **Design Thermal Duty:** 8.4 MW
- **Hot Shell-Side Process Stream:** 412.0 °C Inlet / 185.0 °C Outlet (Effluent to Flash Drum V-102)
- **Cold Tube-Side Cooling Water:** 28.0 °C Supply / 42.0 °C Return
- **Design Shell Pressure:** 45.0 bar gauge
- **Normal Operating Efficiency Baseline:** 94.2% of design thermal exchange.

---

## 2. Cooling Water Failure & Exotherm Mitigation
1. If cooling water supply flow `FT-301` drops below `1200 m³/hr` or return temperature `TT-301B` exceeds `55.0 °C`:
   - Sound Plant Sector 4 Acoustic Alarm.
   - Automatically reduce preheater firing on Reactor R-204 by 30%.
   - Open auxiliary emergency cooling valve `CW-EM-301` within 60 seconds.
2. If tube sheet leakage is detected via online conductivity sensor `AT-301` (> 50 µS/cm):
   - Immediate sovereign interlock halts feed pump P-201 to prevent high-pressure flammable hydrocarbon breach into cooling tower.
"""
    (KNOWLEDGE_DIR / "sop_e301_effluent_cooler_loss.md").write_text(sop_e301, encoding="utf-8")

    # 4. SOP-SAF-204-REV-B: Pressure Relief Valve Security & Lockout
    sop_prv204 = """# SOP-SAF-204-REV-B: Pressure Relief Valve PRV-204 Lockout, Actuation Prohibition & Calibration

## Document Control & Governance
- **Document Number:** SOP-SAF-204-REV-B
- **Security Classification:** RESTRICTED
- **Governing Standard:** ASME Section VIII Div 1 UV Stamp / API 526 / ISA-84 (Safety Instrumented Systems)
- **Target Assets:** PRV-204 (Pilot-Operated Safety Relief Valve), PSE-204 (Dual Rupture Discs)
- **Effective Date:** 2026-09-01

---

## 1. Autonomous AI Actuation Prohibition (CRITICAL POLICY BOUNDARY)

> [!CAUTION]
> **STRICT AIR-GAPPED FAIL-CLOSED PROHIBITION:**
> Autonomous AI agents, automated software schedulers, and unauthorized personnel are **ABSOLUTELY PROHIBITED** from actuating, stroking, writing calibration offsets to, or overriding Pressure Relief Valve `PRV-204`.

1. Any tool invocation targeting `pressure_relief_calibration` or pneumatic valve offsets is classified as **CRITICAL RISK**.
2. Execution is intercepted and blocked by the FORGE Policy Gateway under **DEFAULT-DENY** rules unless verified with cryptographic multi-factor approval (`M-of-N`) signed by the Plant Operations Director.
3. In-situ valve testing must occur strictly during turnaround with physical car-seal locks and certified deadweight calibrators.
"""
    (KNOWLEDGE_DIR / "sop_prv204_relief_valve_security.md").write_text(sop_prv204, encoding="utf-8")

    # 5. HAZOP Study for Reaction Loop 200
    hazop_md = """# HAZOP-2026-U24: Hazard and Operability Study — Reaction Loop 200

## Study Identification
- **Study ID:** HAZOP-2026-LOOP200
- **Node 1:** Reactor R-204 Primary Pressure Boundary and Quench Loop
- **Design Intent:** Continuous catalytic hydrocracking of heavy gas oil at 31.2 bar and 410°C.
- **Team Leader:** Dr. P. Mehta, Certified Functional Safety Expert (CFSE #2019-88)

---

## Process Hazard Matrix

| Node / Parameter | Guide Word | Cause | Consequence | Safeguards | Recommendation |
|---|---|---|---|---|---|
| **Pressure** | MORE | Exothermic runaway or loss of H2 quench | Pressure rises above 35.0 bar; catastrophic vessel rupture | Dual PT-204A/B (2oo3), High Trip ESD-01, Dual PRV-204 @ 42.5 bar | Maintain independent hardwired SIS interlock outside DCS. |
| **Pressure** | LESS | Feed pump P-201 trip or feed line blockage | Catalyst bed coking, flow reversal from V-102 | Non-return check valve NRV-204, auto-standby switch to P-201B | Test reverse flow check valve seating during turnaround. |
| **Temperature**| MORE | Failure of preheater temp controller | Thermal embrittlement, vessel cladding disbonding | Multipoint TT-204 array, automated H2 quench deluge via QCV-204A | Verify quench valve stroke time < 1.5 seconds. |
| **Flow** | LESS | P-201 impeller abrasive slurry cavitation | Loss of reactor residence time; localized overheating | Vibration monitor VM-201, auto-switchover SOP-ROT-201 | Replace impeller with tungsten-carbide coated alloy. |
"""
    (KNOWLEDGE_DIR / "hazop_reaction_loop_200.md").write_text(hazop_md, encoding="utf-8")
    print("Generated all authentic SOP and HAZOP markdown documents.")


# =========================================================================
# 5. GENERATE MULTI-PAGE INDUSTRIAL PDFS
# =========================================================================
def generate_industrial_pdfs():
    """Generates multi-page, high-DPI certified industrial engineering PDFs
    using PIL and pypdf (rasterized vector-like document pages).
    """
    page_w, page_h = 2480, 3508  # A4 at 300 DPI

    f_title = get_font(48, bold=True)
    f_sub = get_font(32, bold=True)
    f_header = get_font(28, bold=True)
    f_body = get_font(22, bold=False)
    f_body_b = get_font(22, bold=True)
    f_mono = get_font(20, mono=True)
    f_small = get_font(18, mono=True)
    f_indic = get_indic_font(22)

    # -------------------------------------------------------------------------
    # PDF 1: IR_2026_R204_Ultrasonic_Thickness_Survey.pdf (3 Pages)
    # -------------------------------------------------------------------------
    def draw_pdf_header(draw, title_text, doc_id, page_num, total_pages):
        draw.rectangle([(80, 80), (page_w - 80, 240)], fill=(245, 248, 252), outline=(30, 50, 80), width=4)
        draw.text((110, 105), "BHARAT PETROCHEMICAL COMPLEX · SECTOR 4 RELIABILITY ENCLAVE", fill=(15, 23, 42), font=f_small)
        draw.text((110, 135), title_text, fill=(10, 30, 70), font=f_title)
        draw.text((110, 195), f"DOC ID: {doc_id}  |  CLASSIFICATION: CONFIDENTIAL  |  STD: ASME SEC VIII DIV 1 / API 510", fill=(70, 85, 105), font=f_small)
        draw.text((page_w - 360, 110), f"PAGE {page_num} OF {total_pages}", fill=(10, 30, 70), font=f_header)

    # Page 1: Ultrasonic Thickness Grid Survey
    p1 = Image.new("RGB", (page_w, page_h), "white")
    d1 = ImageDraw.Draw(p1)
    draw_pdf_header(d1, "NON-DESTRUCTIVE TESTING & ULTRASONIC SURVEY DOSSIER", "IR-2026-R204-098", 1, 2)

    y = 300
    d1.text((100, y), "1. ASSET METADATA & INSPECTION OVERVIEW", fill=(10, 30, 70), font=f_header)
    y += 45
    meta_box = [(100, y), (page_w - 100, y + 160)]
    d1.rectangle(meta_box, fill=(250, 252, 255), outline=(180, 195, 215), width=2)
    meta_txt = (
        "Equipment Identifier: REACTOR R-204 (Continuous Catalytic Hydrocracker)\n"
        "Operating Service: Exothermic Slurry Cracking (31.2 bar @ 412°C)\n"
        "Nominal Shell Thickness: 75.00 mm (Design Wall 70.50 mm + 4.50 mm Corrosion Allowance)\n"
        "Minimum Allowable Retirement Wall: 68.20 mm (Per ASME Section VIII Div 1 Calculation)\n"
        "Inspection Instrument: Olympus OmniScan SX Phased Array UT (Calibrated against 1018 Steel Block #CAL-88)"
    )
    d1.text((120, y + 20), meta_txt, fill=(20, 30, 45), font=f_mono)

    y += 210
    d1.text((100, y), "2. 24-POINT ULTRASONIC THICKNESS GRID SURVEY (PAUT & 0° DUAL ELEMENT)", fill=(10, 30, 70), font=f_header)
    y += 50

    # Grid Table
    headers = ["Grid Point", "Component / Location", "Nominal (mm)", "2024 (mm)", "2025 (mm)", "Current 2026 (mm)", "Delta (mm)", "Status"]
    col_w = [200, 520, 220, 200, 200, 260, 200, 280]
    tx = 100

    # Table Header Row
    d1.rectangle([(tx, y), (tx + sum(col_w), y + 55)], fill=(20, 40, 75), outline=(10, 20, 40), width=2)
    cur_x = tx
    for i, h in enumerate(headers):
        d1.text((cur_x + 15, y + 15), h, fill="white", font=get_font(18, bold=True))
        cur_x += col_w[i]
    y += 55

    table_data = [
        ("C-1 (0°)",   "Top Hemispherical Head Center", "75.00", "74.82", "74.78", "74.74", "-0.04", "NOMINAL [PASS]"),
        ("C-1 (90°)",  "Top Head North Knuckle Radius", "75.00", "74.75", "74.70", "74.66", "-0.04", "NOMINAL [PASS]"),
        ("C-1 (180°)", "Top Head South Knuckle Radius", "75.00", "74.78", "74.74", "74.70", "-0.04", "NOMINAL [PASS]"),
        ("S-1 (0°)",   "Shell Course 1 (Inlet Zone)",   "75.00", "74.70", "74.65", "74.61", "-0.04", "NOMINAL [PASS]"),
        ("S-1 (180°)", "Shell Course 1 East Sector",    "75.00", "74.68", "74.63", "74.59", "-0.04", "NOMINAL [PASS]"),
        ("S-2 (0°)",   "Shell Course 2 (Bed 1 Zone)",   "75.00", "74.55", "74.50", "74.45", "-0.05", "NOMINAL [PASS]"),
        ("S-2 (90°)",  "Shell Course 2 North Weld Seam","75.00", "74.50", "74.46", "74.42", "-0.04", "NOMINAL [PASS]"),
        ("S-3 (0°)",   "Shell Course 3 (Bed 2 Zone)",   "75.00", "74.40", "74.35", "74.30", "-0.05", "NOMINAL [PASS]"),
        ("S-4 (0°)",   "Shell Course 4 (Bottom Shell)", "75.00", "74.25", "74.20", "74.15", "-0.05", "NOMINAL [PASS]"),
        ("N-1 (Neck)", "Feed Inlet Nozzle N-1 Neck",    "75.00", "74.10", "74.05", "74.00", "-0.05", "NOMINAL [PASS]"),
        ("N-2 (Weld)", "Effluent Nozzle N-2 Weld Toe",  "75.00", "72.92", "72.88", "72.84", "-0.04", "MINIMUM [PASS]"),
        ("C-2 (Sump)", "Bottom Discharge Sump Head",    "75.00", "73.80", "73.76", "73.71", "-0.05", "NOMINAL [PASS]"),
    ]

    for row_idx, r in enumerate(table_data):
        row_bg = (248, 250, 254) if row_idx % 2 == 0 else "white"
        if "MINIMUM" in r[7]:
            row_bg = (254, 243, 199) # Highlight minimum row in subtle amber
        d1.rectangle([(tx, y), (tx + sum(col_w), y + 46)], fill=row_bg, outline=(210, 220, 235), width=1)
        cur_x = tx
        for c_idx, val in enumerate(r):
            c_color = (180, 40, 20) if "MINIMUM" in val else (20, 30, 45)
            if c_idx == 7 and "NOMINAL" in val:
                c_color = (22, 101, 52)
            d1.text((cur_x + 15, y + 12), val, fill=c_color, font=get_font(17, bold=(c_idx in [0, 5, 7])))
            cur_x += col_w[c_idx]
        y += 46

    y += 50
    d1.text((100, y), "3. MATHEMATICAL CORROSION RATE & REMAINING LIFE VERIFICATION", fill=(10, 30, 70), font=f_header)
    y += 45
    calc_box = [(100, y), (page_w - 100, y + 260)]
    d1.rectangle(calc_box, fill=(245, 250, 255), outline=(59, 130, 246), width=2)
    calc_text = (
        "FORMULA 1: Corrosion Rate Calculation (API 510 Section 7.1.1):\n"
        "    Cr = (t_previous - t_actual) / Delta_t = (72.88 mm - 72.84 mm) / 1.0 year = 0.040 mm / year\n\n"
        "FORMULA 2: Remaining Useful Life (RL):\n"
        "    RL = (t_actual - t_minimum_retirement) / Cr\n"
        "    RL = (72.84 mm - 68.20 mm) / (0.040 mm/year) = 4.64 mm / 0.040 = 116.0 YEARS\n\n"
        "CONCLUSION: Reactor R-204 pressure boundary possesses extraordinary structural integrity.\n"
        "Vessel is certified fit for continuous service through turnaround cycle 2028."
    )
    d1.text((120, y + 25), calc_text, fill=(15, 23, 42), font=f_mono)

    # Sovereign Verification Seal
    y += 310
    seal_box = [(100, y), (page_w - 100, y + 160)]
    d1.rectangle(seal_box, fill=(240, 253, 244), outline=(34, 197, 94), width=3)
    d1.text((130, y + 25), "SOVEREIGN ENCLAVE DETERMINISTIC VERIFICATION SEAL", fill=(22, 101, 52), font=f_sub)
    d1.text((130, y + 70), "LEAD INSPECTOR: D. Mhatre, ASNT NDT Level III (#48102) / API 510 Inspector (#62914)", fill=(20, 30, 45), font=f_body_b)
    d1.text((130, y + 105), "CRYPTOGRAPHIC DIGEST: SHA256: 8f94cb021a88b512e03948da67bb1945e03290b21fa7", fill=(70, 85, 105), font=f_mono)

    # Save PDF
    ir_pdf_path = DEMO_DIR / "IR_2026_R204_Ultrasonic_Thickness_Survey.pdf"
    p1.save(ir_pdf_path, "PDF", resolution=300.0)
    print(f"Generated PDF: {ir_pdf_path}")

    # -------------------------------------------------------------------------
    # PDF 2: PID_Loop_200_Engineering_Drawing.pdf (High-DPI Landscape)
    # -------------------------------------------------------------------------
    pid_img = generate_pid_diagram(dark_theme=False) # crisp white CAD diagram
    pid_pdf_path = DEMO_DIR / "PID_Loop_200_Engineering_Drawing.pdf"
    pid_img.save(pid_pdf_path, "PDF", resolution=300.0)
    print(f"Generated PDF: {pid_pdf_path}")

    # -------------------------------------------------------------------------
    # PDF 3: SOP_R204_Reactor_Operating_Manual.pdf
    # -------------------------------------------------------------------------
    p_sop = Image.new("RGB", (page_w, page_h), "white")
    d_sop = ImageDraw.Draw(p_sop)
    draw_pdf_header(d_sop, "STANDARD OPERATING PROCEDURE & SAFETY DIRECTIVES", "SOP-ENG-204-REV-E", 1, 1)

    ys = 300
    d_sop.text((100, ys), "SECTION 1: OPERATING ENVELOPE & INTERLOCK TRIP SETPOINTS", fill=(10, 30, 70), font=f_header)
    ys += 50

    sop_summary = (
        "Normal Operating Pressure: 31.2 bar gauge (Monitored via Dual PT-204A/B and Local PI-204)\n"
        "Maximum Allowable Working Pressure (MAWP): 42.5 bar gauge\n"
        "High Pressure Alarm Setpoint: 33.5 bar gauge (Operator Attention Required)\n"
        "Emergency Shutdown High Trip (ESD-01): 35.0 bar gauge (Automated Loop Isolation)\n"
        "Mechanical Relief Valve Lift Setpoint (PRV-204): 42.5 bar gauge\n"
        "Secondary Quench Flow Baseline: 294 L/min (Minimum allowable: 260 L/min)\n"
        "Maximum Bed Temperature: 440.0 °C  |  Max Allowable Heating Ramp: 25.0 °C / hour"
    )
    d_sop.rectangle([(100, ys), (page_w - 100, ys + 240)], fill=(248, 250, 254), outline=(180, 195, 215), width=2)
    d_sop.text((130, ys + 25), sop_summary, fill=(20, 30, 45), font=f_mono)

    ys += 290
    d_sop.text((100, ys), "SECTION 2: MULTILINGUAL EMERGENCY DIRECTIVES / बहुभाषी आपातकालीन निर्देश / ಬಹುಭಾಷಾ ನಿರ್ದೇಶನಗಳು", fill=(10, 30, 70), font=f_header)
    ys += 50

    # Multi-lingual Callout Cards
    # English Card
    d_sop.rectangle([(100, ys), (page_w - 100, ys + 120)], fill=(240, 245, 255), outline=(59, 130, 246), width=2)
    d_sop.text((130, ys + 15), "[ENGLISH DIRECTIVE · CRITICAL SAFETY LIMIT]", fill=(30, 64, 175), font=f_body_b)
    d_sop.text((130, ys + 55), "Do not exceed 42.5 BAR operating pressure. Immediately isolate valve HV-204 and notify supervisor if pressure exceeds 42.8 BAR.", fill=(15, 23, 42), font=f_body)

    ys += 150
    # Hindi Card
    d_sop.rectangle([(100, ys), (page_w - 100, ys + 120)], fill=(254, 242, 242), outline=(239, 68, 68), width=2)
    d_sop.text((130, ys + 15), "[HINDI DIRECTIVE · महत्वपूर्ण सुरक्षा सीमा]", fill=(185, 28, 28), font=f_body_b)
    d_sop.text((130, ys + 55), "रिएक्टर परिचालन दबाव 42.5 BAR से अधिक न होने दें। यदि दबाव 42.8 BAR से अधिक हो जाए, तो तुरंत वाल्व HV-204 बंद करें।", fill=(15, 23, 42), font=f_indic)

    ys += 150
    # Kannada Card
    d_sop.rectangle([(100, ys), (page_w - 100, ys + 120)], fill=(240, 253, 244), outline=(34, 197, 94), width=2)
    d_sop.text((130, ys + 15), "[KANNADA DIRECTIVE · ನಿರ್ಣಾಯಕ ಸುರಕ್ಷತಾ ಮಿತಿ]", fill=(21, 128, 61), font=f_body_b)
    d_sop.text((130, ys + 55), "ರಿಯಾಕ್ಟರ್‌ ಕಾರ್ಯಾಚರಣೆಯ ಒತ್ತಡವು 42.5 BAR ಮೀರುವುದನ್ನು ತಡೆಯಿರಿ. ಒತ್ತಡವು 42.8 BAR ಮೀರಿದರೆ, ತಕ್ಷಣ ವಾಲ್ವ್‌ HV-204 ಅನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ.", fill=(15, 23, 42), font=f_indic)

    sop_pdf_path = DEMO_DIR / "SOP_R204_Reactor_Operating_Manual.pdf"
    p_sop.save(sop_pdf_path, "PDF", resolution=300.0)
    print(f"Generated PDF: {sop_pdf_path}")


# =========================================================================
# MAIN EXECUTION
# =========================================================================
if __name__ == "__main__":
    print("=== Generating FORGE Sovereign Industrial Synthetic Assets ===")
    generate_pid_diagram(dark_theme=True)
    generate_pressure_gauge(pressure_bar=33.0)
    generate_ndt_scan()
    generate_sop_markdowns()
    generate_industrial_pdfs()
    print("=== All synthetic industrial assets successfully created! ===")
