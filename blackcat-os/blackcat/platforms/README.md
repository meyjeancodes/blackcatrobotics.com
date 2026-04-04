# Platform Definitions

This directory contains platform definition JSON files for known robot platforms.

Each file conforms to the TechMedix PlatformDefinition schema (see `docs/platform-definition-schema.md`).

## Included Platforms

| File | Platform | Manufacturer | Category |
| --- | --- | --- | --- |
| unitree_g1.json | Unitree G1 | Unitree Robotics | Humanoid |
| unitree_h1_2.json | Unitree H1-2 | Unitree Robotics | Humanoid |

## Contributing

See `docs/contributing-a-platform.md` for instructions on adding new platforms.

Validate your definition with:

```bash
blackcat platforms show your_platform.json
```
