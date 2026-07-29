import bpy, mathutils

bpy.ops.wm.open_mainfile(filepath='/Users/megan/blackcatrobotics-repo/unitree_lineup.blend')

def world_bbox(obj):
    corners = [mathutils.Vector(c) for c in obj.bound_box]
    # bound_box is in local space; transform by world matrix
    m = obj.matrix_world
    pts = [m @ c for c in corners]
    xs=[p.x for p in pts]; ys=[p.y for p in pts]; zs=[p.z for p in pts]
    return (min(xs),max(xs),min(ys),max(ys),min(zs),max(zs))

for prefix in ['q_', 'h_']:
    objs = [o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(prefix)]
    gx0,gx1,gy0,gy1,gz0,gz1 = [1e9,-1e9,1e9,-1e9,1e9,-1e9]
    for o in objs:
        x0,x1,y0,y1,z0,z1 = world_bbox(o)
        gx0=min(gx0,x0); gx1=max(gx1,x1); gy0=min(gy0,y0); gy1=max(gy1,y1); gz0=min(gz0,z0); gz1=max(gz1,z1)
    print(f"{prefix} ROBOT  W={gx1-gx0:.2f}  D={gy1-gy0:.2f}  H={gz1-gz0:.2f}  z[{gz0:.2f},{gz1:.2f}]  x[{gx0:.2f},{gx1:.2f}]")

print("\nground z:", world_bbox(bpy.data.objects['ground'])[4])
# camera
cam = bpy.context.scene.camera
print("cam loc", [round(v,2) for v in cam.location])
print("total mesh objs", len([o for o in bpy.data.objects if o.type=='MESH']))
