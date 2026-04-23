"""
TechMedix Demo Reel v2 — Manim CE
1920x1080 @ 60fps, ~3 min, H.264
"""
from manim import *
import numpy as np
import random, os

# ── Colors ──
EMBER = "#e8601e"; MOSS = "#1db87a"; GOLD = "#c3a55b"
SURFACE = "#17181d"; BG = "#0d0e13"; SKY = "#38bdf8"
AMBER = "#f59e0b"; PANEL_BG = "#1a1b20"

# ── Fonts ──
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
TK  = "Playfair Display"
ST  = "Satoshi"
CK  = "Chakra Petch"
CKB = "Chakra Petch"
# Fonts installed to ~/Library/Fonts


def grid_bg():
    g = VGroup()
    for x in np.arange(-7.2, 7.3, 0.8):
        g.add(Line([x,-4.1,0],[x,4.1,0], stroke_width=0.5, stroke_color=WHITE, stroke_opacity=0.08))
    for y in np.arange(-4.1, 4.2, 0.8):
        g.add(Line([-7.2,y,0],[7.2,y,0], stroke_width=0.5, stroke_color=WHITE, stroke_opacity=0.08))
    return g


def panel(w=5.5, h=3.0, r=0.2, bc=EMBER, bo=0.35):
    return RoundedRectangle(corner_radius=r, width=w, height=h,
        fill_color=PANEL_BG, fill_opacity=1, stroke_color=bc, stroke_width=1.5, stroke_opacity=bo)


def cleanup(self):
    self.play(FadeOut(Group(*self.mobjects)), run_time=0.5)
    self.wait(0.3)


# ═══════════════════════════════════
# SCENE 1 — COLD OPEN (0-12s)
# ═══════════════════════════════════
class Scene1_ColdOpen(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        labels = ["G1-001","G1-002","H1-003","B2-004","OPT-005","DGT-006"]
        positions = [LEFT*4+UP*1.5, RIGHT*2+UP*2, LEFT*1+DOWN*1.5,
                     RIGHT*4+DOWN*0.5, LEFT*3+DOWN*0.5, RIGHT*0.5+UP*0.5]
        nodes, lbls = VGroup(), VGroup()
        for lb, pos in zip(labels, positions):
            glow = Circle(0.3, fill_color=MOSS, fill_opacity=0.15, stroke_width=0)
            dot = Circle(0.18, fill_color=MOSS, fill_opacity=0.9, stroke_width=0)
            n = VGroup(glow, dot).move_to(pos)
            t = Text(lb, font_size=11, font=CK, color=WHITE, opacity=0.6).next_to(n, DOWN, buff=0.1)
            nodes.add(n); lbls.add(t)

        self.play(LaggedStart(*[GrowFromCenter(n) for n in nodes], lag_ratio=0.3), run_time=2.5)
        self.play(FadeIn(lbls), run_time=0.8)

        edges = [(0,1),(0,3),(1,4),(2,3),(3,5),(4,5),(1,5),(0,2),(2,4),(1,3),(0,5),(2,5)]
        lines = VGroup()
        for i,j in edges:
            lines.add(Line(nodes[i].get_center(), nodes[j].get_center(),
                           stroke_color=EMBER, stroke_opacity=0.18, stroke_width=1.2))
        self.play(LaggedStart(*[Create(l) for l in lines], lag_ratio=0.08), run_time=1.5)
        self.wait(0.5)

        title = Text("TECHMEDIX", font_size=72, font=TK, color=EMBER)
        sub = Text("FLEET INTELLIGENCE PLATFORM", font_size=14, font=CK, color=WHITE, opacity=0.45)
        sub.next_to(title, DOWN, buff=0.2)
        self.play(Write(title), run_time=2.0)
        self.play(FadeIn(sub, shift=UP*0.1), run_time=0.8)
        self.wait(1.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 2 — THE PROBLEM (12-35s)
# ═══════════════════════════════════
class Scene2_TheProblem(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        # Counter animation
        tracker = ValueTracker(0)
        dollar = Text("$", font_size=90, font=TK, color=EMBER).shift(LEFT*1.2+UP*1.0)
        counter = always_redraw(lambda: Text(
            f"{int(tracker.get_value()):,}", font_size=110, font=TK, color=EMBER
        ).next_to(dollar, RIGHT, buff=0.05))
        group = VGroup(dollar, counter)

        label = Text("per hour of unplanned robot downtime",
                     font_size=28, font=ST, color=WHITE, opacity=0.75)
        label.next_to(group, DOWN, buff=0.3)

        self.play(FadeIn(dollar), run_time=0.4)
        self.add(counter)
        self.play(tracker.animate.set_value(260000), run_time=2.5, rate_func=rush_from)
        self.play(FadeIn(label), run_time=0.8)
        self.wait(4.0)

        # Fade up stat, bring timeline
        self.play(group.animate.shift(UP*1.5).scale(0.5), label.animate.shift(UP*1.5).scale(0.5).set_opacity(0.3), run_time=0.8)

        # Timeline bar
        bar_y = DOWN*0.3
        segments = VGroup()
        seg_data = [("NORMAL OPERATION", 5.0, MOSS, 0.6),
                    ("FAULT DEVELOPS", 2.5, AMBER, 0.7),
                    ("FAILURE", 2.0, EMBER, 0.8)]
        x_start = -6.0
        for name, w, col, op in seg_data:
            seg = Rectangle(width=w, height=0.35, fill_color=col, fill_opacity=op,
                            stroke_width=0).move_to([x_start+w/2, bar_y[1], 0])
            lbl = Text(name, font_size=10, font=CK, color=WHITE, opacity=0.5).next_to(seg, UP, buff=0.15)
            segments.add(VGroup(seg, lbl))
            x_start += w

        segments.move_to(ORIGIN + DOWN*0.5)
        self.play(FadeIn(segments), run_time=1.0)
        self.wait(1.5)

        # Cursor sweep
        cursor = Line(segments.get_left()+LEFT*0.1, segments.get_left()+LEFT*0.1+UP*1.0,
                      stroke_color=WHITE, stroke_width=2, stroke_opacity=0.8)
        self.add(cursor)
        self.play(cursor.animate.shift(RIGHT*segments.width+RIGHT*0.2), run_time=4, rate_func=linear)
        self.wait(0.5)

        # Callout panel
        callout = panel(w=3.5, h=1.5, r=0.15, bc=EMBER, bo=0.35)
        callout_text = VGroup(
            Text("WAVEFORM ANOMALY", font_size=11, font=CK, color=AMBER),
            Text("Joint Shoulder_R", font_size=11, font=CK, color=WHITE, opacity=0.7),
            Text("48hr prediction window", font_size=10, font=CK, color=WHITE, opacity=0.5),
        ).arrange(DOWN, buff=0.1, aligned_edge=LEFT).move_to(callout)
        callout_group = VGroup(callout, callout_text).shift(UP*0.8+RIGHT*2)

        self.play(FadeIn(callout_group, shift=LEFT*0.3), run_time=0.8)

        # Bottom caption
        caption = Text(
            "Most systems find out when the robot stops. TechMedix finds out 48 hours earlier.",
            font_size=22, font=ST, color=WHITE, opacity=0.70
        ).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(caption), run_time=1.0)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 3 — PLATFORM ROLL (35-55s)
# ═══════════════════════════════════
class Scene3_PlatformRoll(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        header = Text("LAYER 1 — PHYSICAL / PLATFORM CATALOG",
                      font_size=11, font=CK, color=WHITE, opacity=0.38).to_edge(UP, buff=0.4)

        platforms = [
            ("HUMANOID", "Unitree G1", "43 DOF"),
            ("HUMANOID", "Figure 02", "22 DOF Hands"),
            ("HUMANOID", "Tesla Optimus Gen 3", "FSD Stack"),
            ("HUMANOID", "Agility Digit V5", "LIDAR + Stereo"),
            ("AERIAL", "DJI Agras T50", "50L Sprayer"),
            ("AERIAL", "Skydio X10", "Autonomous Nav"),
        ]

        cards = VGroup()
        for kicker, name, spec in platforms:
            bg = RoundedRectangle(corner_radius=0.2, width=3.8, height=1.5,
                fill_color=SURFACE, fill_opacity=1, stroke_color=WHITE, stroke_width=1, stroke_opacity=0.08)
            k = Text(kicker, font_size=9, font=CK, color=WHITE, opacity=0.4).move_to(bg).shift(UP*0.45+LEFT*1.4)
            n = Text(name, font_size=22, font=TK, color=WHITE).move_to(bg).shift(UP*0.05+LEFT*0.5)
            s = Text(spec, font_size=11, font=CK, color=EMBER).move_to(bg).shift(DOWN*0.35+LEFT*0.8)
            dot = Circle(0.06, fill_color=MOSS, fill_opacity=1, stroke_width=0).next_to(s, RIGHT, buff=0.15)
            status = Text("Monitored", font_size=9, font=CK, color=MOSS, opacity=0.7).next_to(dot, RIGHT, buff=0.08)
            card = VGroup(bg, k, n, s, dot, status)
            cards.add(card)

        cards.arrange_in_grid(rows=2, cols=3, buff=0.35)
        cards.move_to(DOWN*0.2)

        self.play(FadeIn(header), run_time=0.5)
        self.wait(1.0)
        self.play(LaggedStart(*[FadeIn(c, shift=UP*0.4) for c in cards], lag_ratio=0.15), run_time=2.0)
        self.wait(5.5)

        # Scan line
        scan = Line(cards.get_top()+UP*0.1, cards.get_top()+UP*0.1,
                    stroke_width=2.5, stroke_color=EMBER, stroke_opacity=0.4)
        scan.width = cards.width + 0.3
        scan.move_to(cards.get_top()+UP*0.1)
        self.play(scan.animate.move_to(cards.get_bottom()+DOWN*0.1), run_time=0.8, rate_func=linear)
        self.play(FadeOut(scan), run_time=0.3)
        self.wait(2.0)

        caption = Text("Every platform. Every failure signature. One unified intelligence layer.",
                       font_size=20, font=ST, color=WHITE, opacity=0.65).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(caption), run_time=0.8)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 4 — PREDICT (55-80s)
# ═══════════════════════════════════
class Scene4_Predict(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        # LEFT: Waveform
        axes = Axes(
            x_range=[0, 10, 1], y_range=[-1.5, 1.5, 0.5],
            x_length=6, y_length=3,
            axis_config={"stroke_color": WHITE, "stroke_opacity": 0.15, "stroke_width": 1},
            tips=False,
        ).shift(LEFT*3.2 + DOWN*0.3)

        # Healthy portion (0-6)
        healthy = axes.plot(lambda x: np.sin(2*x)*0.8, x_range=[0, 6], color=MOSS, stroke_width=2.5)

        # Anomaly portion (6-10) with noise
        random.seed(42)
        anomaly_points = []
        for x in np.linspace(6, 10, 80):
            noise = 0.15 * np.sin(8*x) + 0.08 * random.uniform(-1, 1)
            amp = 0.8 + 0.4 * ((x-6)/4)
            y = np.sin(2*x) * amp + noise
            anomaly_points.append(axes.c2p(x, y))

        anomaly = VMobject(stroke_width=2.5)
        anomaly.set_points_smoothly(anomaly_points)
        anomaly.set_color(AMBER)
        # Gradient from amber to ember via submobjects
        for i, p in enumerate(anomaly_points):
            t = i / len(anomaly_points)
            # Simple approach: just color the whole thing transition color
        anomaly.set_color(EMBER)

        # Transition marker
        marker_x = axes.c2p(6, 0)
        marker = DashedLine(axes.c2p(6, -1.5), axes.c2p(6, 1.5), color=AMBER, stroke_opacity=0.6)
        marker_label = Text("ANOMALY ONSET", font_size=10, font=CK, color=AMBER).next_to(marker, UP, buff=0.1)

        self.play(Create(axes), run_time=0.8)
        self.wait(1.0)
        self.play(Create(healthy), run_time=2.0)
        self.wait(1.5)
        self.play(Create(marker), FadeIn(marker_label), run_time=0.5)
        self.wait(1.0)
        self.play(Create(anomaly), run_time=2.0)
        self.wait(4.0)

        # RIGHT: Alert panel
        alert_lines = [
            ("PREDICTIVE ALERT", EMBER, 13, True),
            ("─"*24, WHITE, 10, False),
            ("Platform   Unitree G1-004", WHITE, 12, False),
            ("Component  Joint Shoulder_R", WHITE, 12, False),
            ("Signature  Harmonic drive backlash", WHITE, 12, False),
            ("Severity   WARNING", AMBER, 12, False),
            ("Prediction 47.3 hr to failure", WHITE, 12, False),
            ("─"*24, WHITE, 10, False),
            ("Action     DISPATCH QUEUED", MOSS, 12, True),
        ]

        p = panel(w=4.5, h=3.5, r=0.15, bc=EMBER, bo=0.3).shift(RIGHT*3.2+DOWN*0.3)
        text_group = VGroup()
        y_off = 1.35
        for txt, col, fs, bold in alert_lines:
            t = Text(txt, font_size=fs, font=CKB if bold else CK, color=col)
            t.move_to(p).shift(UP*y_off).align_to(p, LEFT).shift(RIGHT*0.3)
            text_group.add(t)
            y_off -= 0.38

        self.play(FadeIn(p), run_time=0.5)
        for t in text_group:
            self.play(FadeIn(t, shift=RIGHT*0.2), run_time=0.15)
        self.wait(2.0)

        caption = Text(
            "TechMedix detects the failure signature. 47 hours before the unit goes down.",
            font_size=22, font=ST, color=WHITE, opacity=0.70
        ).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(caption), run_time=0.8)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 5 — DISPATCH (80-105s)
# ═══════════════════════════════════
class Scene5_Dispatch(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        # Abstract map region
        land = Polygon(
            [-5,-2,0], [-3,-3,0], [0,-2.5,0], [2,-3,0], [4,-1.5,0],
            [3,0,0], [1,1,0], [-2,0.5,0], [-4,-0.5,0],
            fill_color="#1e1f26", fill_opacity=0.8, stroke_color=WHITE, stroke_width=1, stroke_opacity=0.08,
        ).scale(1.2).shift(LEFT*1.5+DOWN*0.3)

        self.play(FadeIn(land), run_time=0.8)

        # Robot location pins
        pin_positions = [LEFT*4+UP*1, LEFT*1.5+UP*0.5, RIGHT*0.5+DOWN*0.5,
                         RIGHT*2.5+UP*1.5, LEFT*3+DOWN*1.5]
        pin_labels = ["G1-001","G1-002","G1-003","G1-004","G1-005"]
        pins = VGroup()
        for pos, lbl in zip(pin_positions, pin_labels):
            diamond = Square(0.15, fill_color=EMBER, fill_opacity=0.9, stroke_width=0).rotate(PI/4).move_to(pos)
            ring = Circle(0.25, stroke_color=EMBER, stroke_width=1.5, stroke_opacity=0.4, fill_opacity=0).move_to(pos)
            label = Text(lbl, font_size=9, font=CK, color=WHITE, opacity=0.5).next_to(diamond, DOWN, buff=0.1)
            pins.add(VGroup(diamond, ring, label))

        self.play(LaggedStart(*[FadeIn(p, scale=0.5) for p in pins], lag_ratio=0.2), run_time=1.5)
        self.wait(2.0)

        # G1-004 fails (index 3)
        fail_ring = Circle(0.35, stroke_color=AMBER, stroke_width=2, fill_opacity=0).move_to(pin_positions[3])
        self.play(FadeIn(fail_ring), run_time=0.3)
        self.play(fail_ring.animate.scale(1.5).set_stroke(opacity=0), run_time=1.0)
        self.remove(fail_ring)

        # Technician pin
        tech_pos = DOWN*3 + RIGHT*3
        tech_dot = Circle(0.15, fill_color=MOSS, fill_opacity=1, stroke_width=0).move_to(tech_pos)
        tech_label = Text("TEC · Martinez · L2", font_size=9, font=CK, color=MOSS, opacity=0.8).next_to(tech_dot, DOWN, buff=0.1)
        self.play(FadeIn(tech_dot), FadeIn(tech_label), run_time=0.5)

        # Animated path
        path = ArcBetweenPoints(tech_pos, pin_positions[3], angle=-PI/3,
                                stroke_color=EMBER, stroke_width=2, stroke_opacity=0.7)
        dashed_path = DashedVMobject(path, num_dashes=20)
        self.play(Create(dashed_path), run_time=1.5)
        self.wait(1.5)

        # ETA tag
        eta_panel = panel(w=2.2, h=1.0, r=0.1, bc=EMBER, bo=0.3)
        eta_text = VGroup(
            Text("ETA 23 MIN", font_size=11, font=CKB, color=EMBER),
            Text("Job #4821", font_size=9, font=CK, color=WHITE, opacity=0.5),
            Text("Shoulder_R replacement", font_size=9, font=CK, color=WHITE, opacity=0.5),
        ).arrange(DOWN, buff=0.08, aligned_edge=LEFT).move_to(eta_panel)
        eta_group = VGroup(eta_panel, eta_text).move_to(
            (np.array(tech_pos) + np.array(pin_positions[3]))/2 + UP*0.5
        )
        self.play(FadeIn(eta_group, shift=LEFT*0.2), run_time=0.6)
        self.wait(1.5)

        # Dispatch card (right side)
        dispatch_card = panel(w=3.5, h=3.0, r=0.15, bc=EMBER, bo=0.3).to_edge(RIGHT, buff=0.5)
        dispatch_lines = [
            ("DISPATCH ISSUED", EMBER, 14, True),
            ("─"*20, WHITE, 10, False),
            ("Technician  J. Martinez", WHITE, 12, False),
            ("Cert Level  L2", WHITE, 12, False),
            ("ETA         23 min", WHITE, 12, False),
            ("Job Value   $520", WHITE, 12, False),
            ("─"*20, WHITE, 10, False),
            ("Status      EN ROUTE", MOSS, 12, True),
        ]
        dtext = VGroup()
        y = 1.15
        for txt, col, fs, bold in dispatch_lines:
            t = Text(txt, font_size=fs, font=CKB if bold else CK, color=col)
            t.move_to(dispatch_card).shift(UP*y).align_to(dispatch_card, LEFT).shift(RIGHT*0.3)
            dtext.add(t); y -= 0.35

        self.play(FadeIn(dispatch_card), run_time=0.5)
        for t in dtext:
            self.play(FadeIn(t, shift=RIGHT*0.15), run_time=0.12)
        self.wait(2.5)

        caption = Text("Certified technician. Right platform expertise. Dispatched automatically.",
                       font_size=22, font=ST, color=WHITE, opacity=0.70).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(caption), run_time=0.8)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 6 — AR MODE (105-130s)
# ═══════════════════════════════════
class Scene6_ARMode(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        # Divider
        divider = Line(UP*3.5, DOWN*3.5, stroke_color=WHITE, stroke_width=1, stroke_opacity=0.25)
        self.play(Create(divider), run_time=0.5)

        # LEFT PANEL
        left_title = Text("FIELD TECHNICIAN — AR VIEW", font_size=11, font=CK, color=EMBER, opacity=0.8)
        left_title.to_corner(UL, buff=0.6).shift(RIGHT*0.3)

        # Stick figure
        head = Circle(0.25, stroke_color=WHITE, stroke_width=1.5, stroke_opacity=0.6).shift(LEFT*3.5+UP*0.8)
        body = Line(head.get_bottom(), head.get_bottom()+DOWN*1.2, stroke_color=WHITE, stroke_width=1.5, stroke_opacity=0.6)
        l_arm = Line(body.get_top()+DOWN*0.2, body.get_top()+DOWN*0.2+LEFT*0.6+DOWN*0.5, stroke_color=WHITE, stroke_width=1.5, stroke_opacity=0.6)
        r_arm = Line(body.get_top()+DOWN*0.2, body.get_top()+DOWN*0.2+RIGHT*0.6+DOWN*0.5, stroke_color=WHITE, stroke_width=1.5, stroke_opacity=0.6)
        l_leg = Line(body.get_bottom(), body.get_bottom()+LEFT*0.3+DOWN*0.8, stroke_color=WHITE, stroke_width=1.5, stroke_opacity=0.6)
        r_leg = Line(body.get_bottom(), body.get_bottom()+RIGHT*0.3+DOWN*0.8, stroke_color=WHITE, stroke_width=1.5, stroke_opacity=0.6)
        figure = VGroup(head, body, l_arm, r_arm, l_leg, r_leg)

        # Highlighted shoulder
        shoulder = Circle(0.2, fill_color=AMBER, fill_opacity=0.5, stroke_color=AMBER, stroke_width=2).move_to(r_arm.get_top())
        connector = DashedLine(shoulder.get_right(), shoulder.get_right()+RIGHT*0.8+UP*0.5, color=AMBER, stroke_opacity=0.7)

        callout = panel(w=2.5, h=1.5, r=0.1, bc=AMBER, bo=0.3).next_to(connector, RIGHT, buff=0.1)
        callout_text = VGroup(
            Text("Component   Shoulder_R", font_size=10, font=CK, color=WHITE, opacity=0.8),
            Text("Step 3 / 7   Remove actuator", font_size=10, font=CK, color=WHITE, opacity=0.8),
            Text("Torque spec  14.2 Nm", font_size=10, font=CK, color=WHITE, opacity=0.8),
            Text("Status       AR GUIDED", font_size=10, font=CKB, color=AMBER),
        ).arrange(DOWN, buff=0.08, aligned_edge=LEFT).move_to(callout)

        # AR crosshair
        cross_size = 0.4
        crosshair = VGroup(
            Line(UP*cross_size, UP*cross_size*0.3, stroke_color=EMBER, stroke_width=2),
            Line(DOWN*cross_size, DOWN*cross_size*0.3, stroke_color=EMBER, stroke_width=2),
            Line(LEFT*cross_size, LEFT*cross_size*0.3, stroke_color=EMBER, stroke_width=2),
            Line(RIGHT*cross_size, RIGHT*cross_size*0.3, stroke_color=EMBER, stroke_width=2),
        ).move_to(shoulder)

        self.play(FadeIn(left_title), Create(figure), run_time=1.5)
        self.wait(1.5)
        self.play(FadeIn(shoulder), Create(crosshair), run_time=0.8)
        self.play(Create(connector), FadeIn(callout), FadeIn(callout_text), run_time=1.0)
        self.wait(3.0)

        # RIGHT PANEL
        right_title = Text("REMOTE EXPERT — HQ", font_size=11, font=CK, color=SKY, opacity=0.8)
        right_title.move_to(RIGHT*3.5+UP*3.0)

        # Duplicate figure (smaller)
        fig2 = figure.copy().scale(0.7).shift(RIGHT*3.5+DOWN*0.3)
        self.play(FadeIn(right_title), FadeIn(fig2), run_time=1.0)
        self.wait(1.5)

        # Annotation markers
        annotations = VGroup()
        for i, pos in enumerate([fig2.get_top()+DOWN*0.5, fig2.get_center()+LEFT*0.5, fig2.get_center()+RIGHT*0.3]):
            circle = Circle(0.18, fill_color=SKY, fill_opacity=0.3, stroke_color=SKY, stroke_width=1.5)
            num = Text(str(i+1), font_size=12, font=CKB, color=SKY).move_to(circle)
            annotations.add(VGroup(circle, num).move_to(pos))
        self.play(LaggedStart(*[FadeIn(a, scale=0.5) for a in annotations], lag_ratio=0.2), run_time=1.0)
        self.wait(2.0)

        # Expert info
        info_lines = [
            "Live feed    Connected",
            "Annotations  3 active",
            "Guide mode   Active",
            "Expert       Dr. Chen · L5",
        ]
        info = VGroup(*[Text(l, font_size=10, font=CK, color=WHITE, opacity=0.6) for l in info_lines])
        info.arrange(DOWN, buff=0.12, aligned_edge=LEFT).next_to(fig2, DOWN, buff=0.4).align_to(fig2, LEFT)
        self.play(FadeIn(info), run_time=0.8)

        # Data stream dots along divider
        dots = VGroup()
        for i in range(5):
            d = Dot(radius=0.04, color=SKY).move_to(divider).shift(UP*(2.5 - i*1.2))
            dots.add(d)
        self.play(LaggedStart(*[d.animate.shift(DOWN*0.5).set_opacity(0) for d in dots], lag_ratio=0.15), run_time=1.5)

        caption = Text("The expert sees exactly what the technician sees. Real-time. Annotated. Guided.",
                       font_size=22, font=ST, color=WHITE, opacity=0.70).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(caption), run_time=0.8)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 7 — CERTIFICATIONS (130-150s)
# ═══════════════════════════════════
class Scene7_Certifications(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        header = Text("LAYER 3 — HUMAN / CERTIFICATION PROGRAM",
                      font_size=11, font=CK, color=WHITE, opacity=0.38).to_edge(UP, buff=0.4)

        certs = [
            ("L1 — OPERATOR", 280, 350, 1.0),
            ("L2 — TECHNICIAN", 450, 650, 0.75),
            ("L3 — SPECIALIST", 800, 1100, 0.5),
            ("L4 — SYSTEMS ENG.", 1200, 1800, 0.35),
            ("L5 — ARCHITECT", 2200, 3500, 0.2),
        ]

        bars = VGroup()
        max_width = 7.0
        for i, (label, low, high, frac) in enumerate(certs):
            y = UP * (1.5 - i * 0.7)
            lbl = Text(label, font_size=12, font=CK, color=WHITE).move_to(LEFT*5.5 + y)
            bar_bg = Rectangle(width=max_width, height=0.35,
                               fill_color=WHITE, fill_opacity=0.05, stroke_width=0).next_to(lbl, RIGHT, buff=0.3)
            bar_fill = Rectangle(width=max_width*frac, height=0.35,
                                 fill_color=EMBER, fill_opacity=0.8, stroke_width=0).align_to(bar_bg, LEFT)
            val = Text(f"${low:,}–${high:,}/job", font_size=11, font=CK, color=MOSS).next_to(bar_bg, RIGHT, buff=0.2)
            row = VGroup(lbl, bar_bg, bar_fill, val)
            bars.add(row)

        self.play(FadeIn(header), run_time=0.5)
        self.wait(1.0)
        for i, row in enumerate(bars):
            self.play(
                FadeIn(row[0]), FadeIn(row[1]),
                GrowFromEdge(row[2], LEFT),
                FadeIn(row[3]),
                run_time=0.6
            )
        self.wait(3.0)

        # Bracket on left
        bracket = Brace(VGroup(*[b[0] for b in bars]), LEFT, color=WHITE, stroke_opacity=0.3)
        bracket_label = Text("TECHMEDIX CERTIFIED", font_size=10, font=CK, color=WHITE, opacity=0.4)
        bracket_label.next_to(bracket, LEFT, buff=0.15)
        self.play(FadeIn(bracket), FadeIn(bracket_label), run_time=0.8)
        self.wait(4.0)

        # Counter
        counter_tracker = ValueTracker(1100)
        counter = always_redraw(lambda: Text(
            f"{int(counter_tracker.get_value()):,}+ certified technicians",
            font_size=16, font=CK, color=MOSS, opacity=0.7
        ).to_corner(UR, buff=0.6))
        self.add(counter)
        self.play(counter_tracker.animate.set_value(1200), run_time=1.5, rate_func=smooth)
        self.wait(1.5)

        caption = Text("Five certification levels. AI-evaluated exams. Platform-specific dispatch eligibility.",
                       font_size=22, font=ST, color=WHITE, opacity=0.70).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(caption), run_time=0.8)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 8 — PRODUCT CLOSE-UP (150-165s)
# ═══════════════════════════════════
class Scene8_ProductCloseup(MovingCameraScene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg(); self.add(g)

        panels_data = [
            ("FLEET HEALTH", "95%", WHITE, "Average health score across active robots.", "⚙"),
            ("CRITICAL ALERTS", "0", MOSS, "No active critical events.", "✓"),
            ("OPEN JOBS", "7", WHITE, "Dispatch jobs in progress.", "→"),
        ]

        all_panels = VGroup()
        for kicker, value, val_color, detail, icon in panels_data:
            p = panel(w=4.0, h=2.2, r=0.2, bc=WHITE, bo=0.08)
            k = Text(kicker, font_size=10, font=CK, color=WHITE, opacity=0.38).move_to(p).shift(UP*0.7+LEFT*1.3)
            v = Text(value, font_size=64, font=TK, color=val_color).move_to(p).shift(LEFT*0.3+DOWN*0.1)
            d = Text(detail, font_size=13, font=ST, color=WHITE, opacity=0.5).move_to(p).shift(DOWN*0.7)
            ic = Text(icon, font_size=28, color=EMBER, opacity=0.6).move_to(p).shift(RIGHT*1.5+UP*0.5)
            all_panels.add(VGroup(p, k, v, d, ic))

        all_panels.arrange(RIGHT, buff=0.4).move_to(ORIGIN)

        self.play(LaggedStart(*[FadeIn(p, shift=RIGHT*0.5) for p in all_panels], lag_ratio=0.25), run_time=2.0)
        self.wait(3.0)

        # Zoom in
        self.play(self.camera.frame.animate.scale(0.95), run_time=1.5, rate_func=smooth)
        self.wait(3.0)

        caption = Text("Real-time. Unified. Operational from day one.",
                       font_size=22, font=ST, color=WHITE, opacity=0.70).to_edge(DOWN, buff=0.4)
        self.play(FadeIn(caption), run_time=0.8)
        self.wait(4.0)
        cleanup(self)


# ═══════════════════════════════════
# SCENE 9 — CTA (165-180s)
# ═══════════════════════════════════
class Scene9_CTA(Scene):
    def construct(self):
        self.camera.background_color = BG
        g = grid_bg()
        for line in g:
            line.set_stroke(opacity=0.12)
        self.add(g)

        title = Text("TechMedix.", font_size=80, font=TK, color=EMBER)
        tagline = Text("Predict. Dispatch. Repair.", font_size=18, font=CK, color=WHITE, opacity=0.65)
        tagline.next_to(title, DOWN, buff=0.3)

        email = Text("blackcatrobotics.ai@gmail.com", font_size=13, font=CK, color=WHITE, opacity=0.38)
        email.next_to(tagline, DOWN, buff=0.6)

        url = Text("dashboard.blackcatrobotics.com", font_size=11, font=CK, color=WHITE, opacity=0.28,
                   t2s={"dashboard.blackcatrobotics.com": ITALIC})
        url.next_to(email, DOWN, buff=0.2)

        self.play(Write(title), run_time=2.0)
        self.wait(0.5)
        self.play(FadeIn(tagline), run_time=1.0)
        self.wait(1.0)
        self.play(FadeIn(email), run_time=0.8)
        self.wait(0.5)
        self.play(FadeIn(url), run_time=0.8)
        self.wait(2.0)

        # Fleet nodes reappear
        labels = ["G1-001","G1-002","H1-003","B2-004","OPT-005","DGT-006"]
        positions = [LEFT*4+UP*1.5, RIGHT*2+UP*2, LEFT*1+DOWN*1.5,
                     RIGHT*4+DOWN*0.5, LEFT*3+DOWN*0.5, RIGHT*0.5+UP*0.5]
        nodes = VGroup()
        for pos in positions:
            glow = Circle(0.3, fill_color=MOSS, fill_opacity=0.15, stroke_width=0).move_to(pos)
            dot = Circle(0.18, fill_color=MOSS, fill_opacity=0.9, stroke_width=0).move_to(pos)
            nodes.add(VGroup(glow, dot))

        self.play(
            LaggedStart(*[FadeIn(n, scale=0.5) for n in nodes], lag_ratio=0.15),
            title.animate.set_opacity(0.3),
            tagline.animate.set_opacity(0.2),
            email.animate.set_opacity(0.1),
            url.animate.set_opacity(0.08),
            run_time=2.0,
        )

        # Pulse animation
        for n in nodes:
            self.play(n[0].animate.scale(1.3).set_opacity(0.05), run_time=0.5, rate_func=there_and_back)

        # Fade to black
        everything = Group(*self.mobjects)
        self.play(everything.animate.set_opacity(0), run_time=2.0)
        self.wait(0.5)


# ═══════════════════════════════════
# FULL REEL — All scenes stitched
# ═══════════════════════════════════
class TechMedixReel(Scene):
    """Render all 9 scenes as one continuous video."""
    def construct(self):
        # This class is for reference. Render individual scenes and stitch with ffmpeg.
        pass
