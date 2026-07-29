import bpy, math, mathutils, traceback

def _status(msg):
    with open("/tmp/build_status.txt", "a") as f:
        f.write(msg + "\n")

open("/tmp/build_status.txt", "w").write("START\n")

def build():
    # ---------- materials ----------
    def new_mat(name, color, rough=0.5, metal=0.05, emissive=0.0):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = rough
        bsdf.inputs["Metallic"].default_value = metal
        if emissive > 0:
            bsdf.inputs["Emission Color"].default_value = (*color, 1.0)
            bsdf.inputs["Emission Strength"].default_value = emissive
        return mat

    WHITE   = (0.88, 0.89, 0.92)
    DARK    = (0.16, 0.17, 0.19)
    JOINT   = (0.05, 0.05, 0.06)
    FIRE    = (0.91, 0.30, 0.10)
    GUN     = (0.20, 0.21, 0.23)
    GROUND  = (0.20, 0.21, 0.23)

    m_body  = new_mat("m_body",  WHITE, 0.45, 0.05)
    m_limb  = new_mat("m_limb",  DARK,  0.55, 0.10)
    m_joint = new_mat("m_joint", JOINT, 0.40, 0.10)
    m_fire  = new_mat("m_fire",  FIRE,  0.35, 0.10, 0.4)
    m_gun   = new_mat("m_gun",   GUN,   0.50, 0.15)
    m_acc   = new_mat("m_acc",   WHITE, 0.40, 0.05)
    m_ground= new_mat("m_ground",GROUND, 1.0,  0.0)

    def nm(s):
        return s.replace('.', 'd').replace('-', 'n').replace(' ', '_')

    def box(name, size, loc, mat=None, bevel=0.0):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=loc)
        o = bpy.context.active_object
        o.name = nm(name)
        o.scale = size
        if bevel > 0:
            bpy.ops.object.modifier_add(type='BEVEL')
            o.modifiers["Bevel"].width = bevel
            o.modifiers["Bevel"].segments = 2
        if mat:
            o.data.materials.append(mat)
        return o

    def tube(name, p1, p2, radius, mat):
        d = (p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2])
        length = math.sqrt(sum(v*v for v in d))
        mid = ((p1[0]+p2[0])/2, (p1[1]+p2[1])/2, (p1[2]+p2[2])/2)
        bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=length, vertices=20, location=mid)
        o = bpy.context.active_object
        o.name = nm(name)
        z_axis = mathutils.Vector((0,0,1))
        v = mathutils.Vector(d).normalized()
        q = z_axis.rotation_difference(v)
        o.rotation_euler = q.to_euler()
        if mat:
            o.data.materials.append(mat)
        bpy.ops.object.shade_smooth()
        return o

    def ball(name, radius, loc, mat):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=loc)
        o = bpy.context.active_object
        o.name = nm(name)
        if mat:
            o.data.materials.append(mat)
        bpy.ops.object.shade_smooth()
        return o

    def cyl(name, radius, depth, loc, rot=(0,0,0), mat=None):
        bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, vertices=24, location=loc, rotation=rot)
        o = bpy.context.active_object
        o.name = nm(name)
        if mat:
            o.data.materials.append(mat)
        bpy.ops.object.shade_smooth()
        return o

    # ---------- clear scene (keep camera + lights) ----------
    scene = bpy.context.scene
    for o in list(bpy.data.objects):
        if o.type == 'MESH':
            bpy.data.objects.remove(o, do_unlink=True)
    for c in list(bpy.data.collections):
        if c.name not in ('Camera', 'Light', 'SceneCollection'):
            try: bpy.data.collections.remove(c)
            except: pass
    _status("cleared")

    # ============================================================
    # UNITREE QUADRUPED  (Go1 / B1 style)  centered at x=-2.2
    # ============================================================
    QX = -2.2
    box("q_body", (1.15, 0.46, 0.34), (QX, 0, 0.52), m_body, bevel=0.05)
    box("q_accent_t", (0.95, 0.05, 0.03), (QX, 0.235, 0.71), m_fire)
    box("q_accent_b", (0.95, 0.05, 0.03), (QX, -0.235, 0.71), m_fire)
    box("q_head", (0.20, 0.32, 0.28), (QX-0.62, 0, 0.60), m_body, bevel=0.03)
    cyl("q_lidar", 0.075, 0.14, (QX-0.62, 0, 0.80), (0,0,0), m_fire)
    _status("dog_body")
    for lx, ly in [(QX-0.42, 0.26), (QX-0.42, -0.26), (QX+0.42, 0.26), (QX+0.42, -0.26)]:
        hip = (lx, ly, 0.42)
        knee = (lx, ly*1.25, 0.18)
        foot = (lx + (0.06 if lx > QX else -0.06), ly*1.25, 0.0)
        ball("q_hip_%s_%s" % (lx, ly), 0.075, hip, m_joint)
        tube("q_thigh_%s_%s" % (lx, ly), hip, knee, 0.06, m_limb)
        tube("q_shin_%s_%s" % (lx, ly), knee, foot, 0.05, m_limb)
        ball("q_ankle_%s_%s" % (lx, ly), 0.05, foot, m_joint)
    _status("dog_legs")

    # ============================================================
    # UNITREE HUMANOID  (H1 / G1 style)  centered at x=+2.2
    # ============================================================
    HX = 2.2
    _status("human_legs")
    for lx in [HX-0.16, HX+0.16]:
        hip = (lx, 0, 0.85); knee = (lx, 0, 0.45); ankle = (lx, 0, 0.07)
        ball("h_hip_%s" % lx, 0.09, hip, m_joint); _status("hl_hip_%s" % lx)
        tube("h_thigh_%s" % lx, hip, knee, 0.075, m_gun); _status("hl_thigh_%s" % lx)
        tube("h_shin_%s" % lx, knee, ankle, 0.065, m_gun); _status("hl_shin_%s" % lx)
        box("h_foot_%s" % lx, (0.18, 0.34, 0.07), (lx, 0.10, 0.035), m_acc, bevel=0.02); _status("hl_foot_%s" % lx)
    _status("human_legs_done")
    box("h_torso", (0.34, 0.20, 0.56), (HX, 0, 1.12), m_gun, bevel=0.03); _status("h_torso")
    box("h_chest", (0.22, 0.03, 0.30), (HX, 0.115, 1.12), m_fire); _status("h_chest")
    for sx in [HX-0.21, HX+0.21]:
        ball("h_sh_%s" % sx, 0.07, (sx, 0, 1.33), m_joint); _status("h_sh_%s" % sx)
        elbow = (sx + (0.08 if sx < HX else -0.08), 0, 1.04)
        hand  = (sx + (0.10 if sx < HX else -0.10), 0, 0.78)
        tube("h_upper_%s" % sx, (sx,0,1.33), elbow, 0.055, m_gun); _status("h_upper_%s" % sx)
        tube("h_fore_%s" % sx, elbow, hand, 0.05, m_gun); _status("h_fore_%s" % sx)
        ball("h_hand_%s" % sx, 0.05, hand, m_joint); _status("h_hand_%s" % sx)
    box("h_head", (0.20, 0.18, 0.22), (HX, 0, 1.50), m_acc, bevel=0.03); _status("h_head")
    box("h_face", (0.16, 0.03, 0.15), (HX, 0.105, 1.50), m_joint); _status("h_face")
    box("h_cam", (0.05, 0.05, 0.05), (HX, 0.0, 1.62), m_fire, bevel=0.01); _status("h_cam")
    _status("human_body")

    # ============================================================
    # ENVIRONMENT + LIGHTING
    # ============================================================
    bpy.ops.mesh.primitive_plane_add(size=40, location=(0,0,0))
    g = bpy.context.active_object
    g.name = "ground"
    g.data.materials.append(m_ground)

    world = bpy.data.worlds["World"]
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.06, 0.07, 0.09, 1.0)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0

    bpy.ops.object.light_add(type='SUN', location=(6, -7, 9))
    key = bpy.context.active_object; key.name = "key"
    key.data.energy = 3.2; key.data.color = (1.0, 0.95, 0.88)
    key.rotation_euler = (math.radians(55), 0, math.radians(40))

    bpy.ops.object.light_add(type='POINT', location=(-6, -4, 5))
    fill = bpy.context.active_object; fill.name = "fill"
    fill.data.energy = 450; fill.data.color = (0.82, 0.90, 1.0)

    bpy.ops.object.light_add(type='POINT', location=(0, 7, 6))
    rim = bpy.context.active_object; rim.name = "rim"
    rim.data.energy = 700; rim.data.color = (1.0, 1.0, 1.0)

    cam = scene.camera
    if cam is None:
        cam = bpy.data.objects.get("Camera")
    cam.location = (0, -6.8, 2.7)
    cam.data.lens = 35
    target = mathutils.Vector((0, 0, 0.85))
    cam.rotation_euler = (target - cam.location).to_track_quat('-Z', 'Y').to_euler()

    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.filepath = '/Users/megan/blackcatrobotics-repo/unitree_lineup.png'
    scene.render.image_settings.file_format = 'PNG'
    scene.frame_start, scene.frame_end, scene.render.fps = 1, 1, 24

    bpy.ops.wm.save_as_mainfile(filepath='/Users/megan/blackcatrobotics-repo/unitree_lineup.blend')
    _status("SAVED_BLEND")
    bpy.ops.render.render(write_still=True)
    _status("RENDERED")

    return len(bpy.data.objects)

try:
    n = build()
    print("BUILD_OK objects:", n)
except Exception as e:
    _status("ERROR " + str(e))
    traceback.print_exc()
    print("BUILD_ERROR", e)
