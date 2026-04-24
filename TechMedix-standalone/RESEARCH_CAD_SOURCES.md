# CAD & 3D Model Sources for TechMedix Platform Cards

## Quick Summary

| Platform | Manufacturer | CAD Available | Source | Format | Notes |
|----------|-------------|---------------|--------|--------|-------|
| Unitree G1 | Unitree | ✅ Official | [unitree_ros](https://github.com/unitreerobotics/unitree_ros) | URDF + DAE/STL | Full meshes in `robots/g1_description/meshes/` |
| Unitree H1-2 | Unitree | ✅ Official | [unitree_ros](https://github.com/unitreerobotics/unitree_ros) | URDF + DAE/STL | `robots/h1_description/meshes/` |
| Unitree B2 | Unitree | ✅ Official | [unitree_ros](https://github.com/unitreerobotics/unitree_ros) | URDF + DAE/STL | `robots/b2_description/meshes/` |
| Figure 02 | Figure AI | ❌ No open CAD | — | — | Use press renders + technical drawings |
| Tesla Optimus Gen 3 | Tesla | ❌ No open CAD | — | — | Community models on GrabCAD/Thingiverse only |
| Digit V5 | Agility Robotics | ⚠️ Limited | [digit-interface](https://github.com/AgilityRobotics/digit-interface) | API/docs | No public meshes; contact for partnership CAD |
| Phantom Mk1 | Physical Intelligence | ❌ No open CAD | — | — | Too new; no public technical assets |
| Boston Dynamics Spot | Boston Dynamics | ✅ Official | [spot-sdk](https://github.com/boston-dynamics/spot-sdk) | URDF + STL | `spot_description/` package |
| Amazon Proteus AMR | Amazon Robotics | ❌ No public CAD | — | — | Internal Amazon only; use press images |
| reBot-DevArm | Seeed Studio | ✅ Full open source | [reBot-DevArm](https://github.com/Seeed-Projects/reBot-DevArm) | STEP/STL/3MF | Full BOM + 3D print files published |
| DJI Agras T50 | DJI | ⚠️ Partial | [DJI Developer](https://developer.dji.com/) | — | M300/M350 have dev CAD; T50 may need request |
| Skydio X10 | Skydio | ❌ No public CAD | — | — | Enterprise-only; contact for dev kit |
| Zipline P2 | Zipline | ❌ No public CAD | — | — | Contact for technical partnership materials |
| Serve RS2 | Serve Robotics | ❌ No public CAD | — | — | Use press images + spec sheets |
| Starship Gen 3 | Starship Tech | ❌ No public CAD | — | — | Use press images + spec sheets |
| Lime Gen 4 | Lime | ❌ No public CAD | — | — | Fleet hardware; no public technical assets |
| Bird Three | Bird | ❌ No public CAD | — | — | Fleet hardware; no public technical assets |
| RadCommercial | Rad Power | ❌ No public CAD | — | — | Use user manual diagrams |

---

## Download & Conversion Pipeline

### 1. Unitree Platforms (G1, H1, B2, B2W, Go2)

```bash
# Clone the official ROS repo
git clone https://github.com/unitreerobotics/unitree_ros.git
cd unitree_ros/robots/g1_description/meshes

# Files are .dae (Collada) and .stl
# To convert to SVG-friendly line art, use Blender Python scripting
# or use meshlabserver for batch conversion
```

**Blender script to render orthographic line drawing:**
```python
import bpy
bpy.ops.wm.read_factory_settings()
bpy.ops.import_mesh.stl(filepath="input.stl")
obj = bpy.context.selected_objects[0]
bpy.ops.object.shade_smooth()
# Set camera to orthographic, render as wireframe
```

### 2. Boston Dynamics Spot

```bash
# Spot SDK includes URDF
pip install bosdyn-client
# Or clone manually:
git clone https://github.com/boston-dynamics/spot-sdk.git
# Meshes are in spot_description/meshes/
```

### 3. reBot-DevArm

```bash
git clone https://github.com/Seeed-Projects/reBot-DevArm.git
# Look for 3D print files (.stl/.3mf) and STEP assemblies
# These are consumer-grade and ideal for exploded views
```

---

## Recommended Web Formats for TechMedix Cards

| Use Case | Format | Tooling |
|----------|--------|---------|
| Interactive SVG diagrams | SVG paths | Blender → SVG export, or manual trace from CAD |
| 3D preview (card thumbnail) | WebP/PNG render | Blender orthographic render |
| Full 3D explorer | Three.js + glTF | Blender → glTF export, load in react-three-fiber |
| Exploded view animation | glTF + keyframes | Blender animation → glTF |

---

## Immediate Action Items

1. **Download Unitree meshes** — highest value, official, compatible
2. **Set up Blender batch pipeline** — convert DAE/STL → orthographic SVG line art
3. **For closed platforms** — collect official press renders and technical drawings, manually trace key components in SVG
4. **Contact Figure AI, Agility, Tesla** — request technical partnership assets or CAD for service/repair use case
5. **reBot-DevArm** — ideal first candidate for full exploded-view CAD integration since it's fully open-source

---

## Asset Storage Plan

Store processed assets in:
```
public/cad/
  unitree-g1/
    chassis.svg        # orthographic line drawing
    exploded.svg       # exploded view
    parts/             # individual component SVGs
  spot/
    chassis.svg
  rebot-devarm/
    chassis.svg
    exploded.svg
```

Update `lib/platforms/parts-catalog.ts` to reference these new high-fidelity SVGs instead of the current simplified geometric paths.
