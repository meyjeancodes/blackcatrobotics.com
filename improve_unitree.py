import bpy, math, mathutils

open("/tmp/improve_status.txt", "w").write("START\n")
def st(m):
    open("/tmp/improve_status.txt","a").write(m+"\n")

bpy.ops.wm.open_mainfile(filepath='/Users/megan/blackcatrobotics-repo/unitree_lineup.blend')
st("opened")

scene = bpy.context.scene

# ---------- upgrade materials ----------
def mat(name):
    return bpy.data.materials.get(name)

mbody = mat('m_body'); mlimb = mat('m_limb'); mjoint = mat('m_joint')
mfire = mat('m_fire'); mgun = mat('m_gun'); macc = mat('m_acc')

# body: add clearcoat for a hard-plastic product look
if mbody:
    bsdf = mbody.node_tree.nodes["Principled BSDF"]
    if "Coat Weight" in bsdf.inputs: bsdf.inputs["Coat Weight"].default_value = 0.4
    if "Coat Roughness" in bsdf.inputs: bsdf.inputs["Coat Roughness"].default_value = 0.25
# joints: glossy dark
if mjoint:
    jb = mjoint.node_tree.nodes["Principled BSDF"]
    jb.inputs["Roughness"].default_value = 0.25
    jb.inputs["Metallic"].default_value = 0.2
# gunmetal limbs: more metal
if mgun:
    gb = mgun.node_tree.nodes["Principled BSDF"]
    gb.inputs["Metallic"].default_value = 0.45
    gb.inputs["Roughness"].default_value = 0.4
st("mats")

# ---------- remove old lights, build studio rig ----------
for o in list(bpy.data.objects):
    if o.type == 'LIGHT':
        bpy.data.objects.remove(o, do_unlink=True)
st("lights_cleared")

# soft AREA key (front, high)
bpy.ops.object.light_add(type='AREA', location=(3.5, -6.5, 5.5))
key = bpy.context.active_object; key.name = "key_area"
key.data.size = 6.0; key.data.energy = 350; key.data.color = (1.0, 0.96, 0.90)
key.rotation_euler = mathutils.Euler((math.radians(58), 0, math.radians(28)))
# sun rim from back
bpy.ops.object.light_add(type='SUN', location=(-5, 6, 7))
rim = bpy.context.active_object; rim.name = "rim_sun"
rim.data.energy = 2.0; rim.data.color = (0.9, 0.95, 1.0)
rim.rotation_euler = (math.radians(35), 0, math.radians(-120))
# soft fill (low, opposite)
bpy.ops.object.light_add(type='AREA', location=(-4, -3, 2.5))
fill = bpy.context.active_object; fill.name = "fill_area"
fill.data.size = 5.0; fill.data.energy = 120; fill.data.color = (0.75, 0.85, 1.0)
st("lights")

# ---------- studio backdrop sweep ----------
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 16, 14), rotation=(math.radians(-90),0,0))
back = bpy.context.active_object; back.name = "backdrop"
bmat = bpy.data.materials.new("m_back")
bmat.use_nodes = True
bmat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.10, 0.11, 0.13, 1.0)
bmat.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 1.0
back.data.materials.append(bmat)
# floor stays as shadow catcher-ish neutral (already receives shadow)
st("backdrop")

# ---------- camera ----------
cam = scene.camera
if cam is None:
    cam = bpy.data.objects.get("Camera")
if cam is None:
    bpy.ops.object.camera_add(location=(0, -7.2, 3.0))
    cam = bpy.context.active_object
    cam.name = "Camera"
scene.camera = cam
cam.location = (0, -7.2, 3.0)
cam.data.lens = 38
target = mathutils.Vector((0, 0, 0.8))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()
st("cam")

# ---------- render settings ----------
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 48
scene.cycles.use_denoising = True
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.filepath = '/Users/megan/blackcatrobotics-repo/unitree_lineup_v2.png'
scene.render.image_settings.file_format = 'PNG'
st("settings")

# save upgraded blend
bpy.ops.wm.save_as_mainfile(filepath='/Users/megan/blackcatrobotics-repo/unitree_lineup_v2.blend')
st("saved")

# ---- render still ----
bpy.ops.render.render(write_still=True)
st("STILL_DONE")

# ---- turntable: orbit camera around group center ----
FRAMES = 60
R = 7.4
center = mathutils.Vector((0, 0, 0.8))
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.fps = 30
scene.render.filepath = '/Users/megan/blackcatrobotics-repo/turntable/frame_'
import os
os.makedirs('/Users/megan/blackcatrobotics-repo/turntable', exist_ok=True)
for f in range(1, FRAMES+1):
    ang = 2*math.pi*(f-1)/(FRAMES)
    x = R*math.sin(ang)
    y = -R*math.cos(ang)
    cam.location = (x, y, 3.0)
    cam.rotation_euler = (center - cam.location).to_track_quat('-Z', 'Y').to_euler()
    cam.keyframe_insert(data_path="location", frame=f)
    cam.keyframe_insert(data_path="rotation_euler", frame=f)
st("TURNTABLE_KEYED")
bpy.ops.render.render(animation=True, write_still=False)
st("TURNTABLE_DONE")
print("IMPROVE_OK")
