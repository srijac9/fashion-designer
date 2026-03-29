"""
Minimal procedural GLB exporter for generated shirt meshes.

This exporter writes a simple valid GLB 2.0 file using only the Python
standard library. The geometry is intentionally simple and deterministic:
it turns the procedural blueprint into a shirt-like mesh that can later be
refined or replaced by a more advanced garment builder.
"""

from __future__ import annotations

import json
import math
import struct
from pathlib import Path
from typing import Any


class ShirtGlbExporter:
    """Exports a simple generated shirt mesh as GLB."""

    def export(self, spec: dict[str, Any], blueprint: dict[str, Any], output_path: Path) -> dict[str, Any]:
        mesh = self._build_mesh(blueprint)
        glb_bytes = self._build_glb(mesh, spec)
        output_path.write_bytes(glb_bytes)
        return {
            "vertexCount": len(mesh["positions"]) // 3,
            "triangleCount": len(mesh["indices"]) // 3,
            "fileSizeBytes": len(glb_bytes),
        }

    def _build_mesh(self, blueprint: dict[str, Any]) -> dict[str, list[float] | list[int]]:
        family = blueprint["family"]
        m = blueprint["measurements"]
        scale = 0.01

        chest = m["chestWidth"] * scale
        waist = m["waistWidth"] * scale
        hem = m["hemWidth"] * scale
        body_length = m["bodyLength"] * scale
        shoulder = m["shoulderWidth"] * scale
        neck_width = m["necklineWidth"] * scale
        front_neck_depth = m["necklineDepth"] * scale
        back_neck_depth = max(0.025, front_neck_depth * 0.38)
        thickness = 0.06
        half_thickness = thickness / 2
        hip = waist * 0.52 + hem * 0.48
        hem_y = 0.0
        hip_y = body_length * 0.18
        waist_y = body_length * 0.42
        chest_y = body_length * 0.63
        underarm_y = body_length * 0.79
        shoulder_y = body_length * 0.955
        neck_top_y = body_length
        front_neck_y = max(neck_top_y - front_neck_depth, body_length * 0.78)
        back_neck_y = max(neck_top_y - back_neck_depth, body_length * 0.88)

        front = {
            "hemL": (-hem / 2, hem_y, half_thickness),
            "hipL": (-hip / 2, hip_y, half_thickness),
            "waistL": (-waist / 2, waist_y, half_thickness),
            "chestL": (-chest / 2, chest_y, half_thickness),
            "underarmL": (-chest * 0.56, underarm_y, half_thickness),
            "shoulderL": (-shoulder / 2, shoulder_y, half_thickness),
            "neckOuterL": (-neck_width * 0.58, neck_top_y - front_neck_depth * 0.08, half_thickness),
            "neckMidL": (-neck_width * 0.32, neck_top_y - front_neck_depth * 0.36, half_thickness),
            "neckC": (0.0, front_neck_y, half_thickness),
            "neckMidR": (neck_width * 0.32, neck_top_y - front_neck_depth * 0.36, half_thickness),
            "neckOuterR": (neck_width * 0.58, neck_top_y - front_neck_depth * 0.08, half_thickness),
            "shoulderR": (shoulder / 2, shoulder_y, half_thickness),
            "underarmR": (chest * 0.56, underarm_y, half_thickness),
            "chestR": (chest / 2, chest_y, half_thickness),
            "waistR": (waist / 2, waist_y, half_thickness),
            "hipR": (hip / 2, hip_y, half_thickness),
            "hemR": (hem / 2, hem_y, half_thickness),
        }

        back = {
            "hemL": (-hem / 2, hem_y, -half_thickness),
            "hipL": (-hip / 2, hip_y, -half_thickness),
            "waistL": (-waist / 2, waist_y, -half_thickness),
            "chestL": (-chest / 2, chest_y, -half_thickness),
            "underarmL": (-chest * 0.55, underarm_y, -half_thickness),
            "shoulderL": (-shoulder / 2, shoulder_y, -half_thickness),
            "neckOuterL": (-neck_width * 0.6, neck_top_y - back_neck_depth * 0.06, -half_thickness),
            "neckMidL": (-neck_width * 0.34, neck_top_y - back_neck_depth * 0.28, -half_thickness),
            "neckC": (0.0, back_neck_y, -half_thickness),
            "neckMidR": (neck_width * 0.34, neck_top_y - back_neck_depth * 0.28, -half_thickness),
            "neckOuterR": (neck_width * 0.6, neck_top_y - back_neck_depth * 0.06, -half_thickness),
            "shoulderR": (shoulder / 2, shoulder_y, -half_thickness),
            "underarmR": (chest * 0.55, underarm_y, -half_thickness),
            "chestR": (chest / 2, chest_y, -half_thickness),
            "waistR": (waist / 2, waist_y, -half_thickness),
            "hipR": (hip / 2, hip_y, -half_thickness),
            "hemR": (hem / 2, hem_y, -half_thickness),
        }

        positions: list[float] = []
        indices: list[int] = []

        def add_vertex(point: tuple[float, float, float]) -> int:
            positions.extend(point)
            return len(positions) // 3 - 1

        front_idx = {key: add_vertex(value) for key, value in front.items()}
        back_idx = {key: add_vertex(value) for key, value in back.items()}

        def tri(a: int, b: int, c: int) -> None:
            indices.extend([a, b, c])

        def quad(a: int, b: int, c: int, d: int) -> None:
            tri(a, b, c)
            tri(a, c, d)

        lower_rows = ["hem", "hip", "waist", "chest", "underarm"]
        for i in range(len(lower_rows) - 1):
            lower = lower_rows[i]
            upper = lower_rows[i + 1]
            quad(
                front_idx[f"{lower}L"],
                front_idx[f"{lower}R"],
                front_idx[f"{upper}R"],
                front_idx[f"{upper}L"],
            )
            quad(
                back_idx[f"{lower}L"],
                back_idx[f"{upper}L"],
                back_idx[f"{upper}R"],
                back_idx[f"{lower}R"],
            )

        front_upper_center = add_vertex((0.0, body_length * 0.78, half_thickness))
        back_upper_center = add_vertex((0.0, body_length * 0.8, -half_thickness))

        front_top_chain = [
            front_idx["underarmL"],
            front_idx["shoulderL"],
            front_idx["neckOuterL"],
            front_idx["neckMidL"],
            front_idx["neckC"],
            front_idx["neckMidR"],
            front_idx["neckOuterR"],
            front_idx["shoulderR"],
            front_idx["underarmR"],
        ]
        back_top_chain = [
            back_idx["underarmL"],
            back_idx["shoulderL"],
            back_idx["neckOuterL"],
            back_idx["neckMidL"],
            back_idx["neckC"],
            back_idx["neckMidR"],
            back_idx["neckOuterR"],
            back_idx["shoulderR"],
            back_idx["underarmR"],
        ]

        for i in range(len(front_top_chain) - 1):
            tri(front_top_chain[i], front_top_chain[i + 1], front_upper_center)
            tri(back_top_chain[i + 1], back_top_chain[i], back_upper_center)

        # Side walls / perimeter shell
        front_loop = [
            front_idx["hemL"],
            front_idx["hipL"],
            front_idx["waistL"],
            front_idx["chestL"],
            front_idx["underarmL"],
            front_idx["shoulderL"],
            front_idx["neckOuterL"],
            front_idx["neckMidL"],
            front_idx["neckC"],
            front_idx["neckMidR"],
            front_idx["neckOuterR"],
            front_idx["shoulderR"],
            front_idx["underarmR"],
            front_idx["chestR"],
            front_idx["waistR"],
            front_idx["hipR"],
            front_idx["hemR"],
        ]
        back_loop = [
            back_idx["hemL"],
            back_idx["hipL"],
            back_idx["waistL"],
            back_idx["chestL"],
            back_idx["underarmL"],
            back_idx["shoulderL"],
            back_idx["neckOuterL"],
            back_idx["neckMidL"],
            back_idx["neckC"],
            back_idx["neckMidR"],
            back_idx["neckOuterR"],
            back_idx["shoulderR"],
            back_idx["underarmR"],
            back_idx["chestR"],
            back_idx["waistR"],
            back_idx["hipR"],
            back_idx["hemR"],
        ]

        for i in range(len(front_loop) - 1):
            quad(front_loop[i], front_loop[i + 1], back_loop[i + 1], back_loop[i])

        # Hem cap
        quad(front_idx["hemL"], front_idx["hemR"], back_idx["hemR"], back_idx["hemL"])

        # Sleeves as attached boxes
        sleeve_length = m["sleeveLength"] * scale
        if family != "tank" and sleeve_length > 0.05:
            sleeve_drop = 0.035 if family == "tee" else 0.055
            sleeve_height = 0.16 if family == "tee" else 0.14
            opening = max(0.08, m["sleeveOpeningWidth"] * scale)
            self._append_sleeve(
                positions,
                indices,
                side="left",
                shoulder_outer=(-shoulder / 2, shoulder_y - 0.012, 0.0),
                sleeve_length=sleeve_length,
                sleeve_height=sleeve_height,
                sleeve_opening=opening,
                half_thickness=half_thickness,
                sleeve_drop=sleeve_drop,
            )
            self._append_sleeve(
                positions,
                indices,
                side="right",
                shoulder_outer=(shoulder / 2, shoulder_y - 0.012, 0.0),
                sleeve_length=sleeve_length,
                sleeve_height=sleeve_height,
                sleeve_opening=opening,
                half_thickness=half_thickness,
                sleeve_drop=sleeve_drop,
            )

        normals = self._compute_vertex_normals(positions, indices)
        return {"positions": positions, "indices": indices, "normals": normals}

    def _append_sleeve(
        self,
        positions: list[float],
        indices: list[int],
        side: str,
        shoulder_outer: tuple[float, float, float],
        sleeve_length: float,
        sleeve_height: float,
        sleeve_opening: float,
        half_thickness: float,
        sleeve_drop: float,
    ) -> None:
        sign = -1 if side == "left" else 1
        x0, y0, _ = shoulder_outer
        x1 = x0 + sign * sleeve_length * 0.96
        y1 = y0 - sleeve_drop - sleeve_length * 0.08
        root_radius_y = sleeve_height * 0.52
        root_radius_z = half_thickness * 1.55
        cuff_radius_y = max(sleeve_opening * 0.46, sleeve_height * 0.28)
        cuff_radius_z = half_thickness * 1.22
        segments = 10

        root_ring: list[int] = []
        cuff_ring: list[int] = []
        for i in range(segments):
            angle = (math.pi * 2 * i) / segments
            cos_a = math.cos(angle)
            sin_a = math.sin(angle)
            root_ring.append(len(positions) // 3)
            positions.extend((x0, y0 + cos_a * root_radius_y, sin_a * root_radius_z))
            cuff_ring.append(len(positions) // 3)
            positions.extend((x1, y1 + cos_a * cuff_radius_y, sin_a * cuff_radius_z))

        for i in range(segments):
            nxt = (i + 1) % segments
            a = root_ring[i]
            b = root_ring[nxt]
            c = cuff_ring[nxt]
            d = cuff_ring[i]
            indices.extend([a, b, c, a, c, d])

        cuff_center = len(positions) // 3
        positions.extend((x1, y1, 0.0))
        for i in range(segments):
            nxt = (i + 1) % segments
            if side == "left":
                indices.extend([cuff_center, cuff_ring[i], cuff_ring[nxt]])
            else:
                indices.extend([cuff_center, cuff_ring[nxt], cuff_ring[i]])

    def _compute_vertex_normals(self, positions: list[float], indices: list[int]) -> list[float]:
        normals = [0.0] * len(positions)
        for i in range(0, len(indices), 3):
            ia, ib, ic = indices[i], indices[i + 1], indices[i + 2]
            ax, ay, az = positions[ia * 3 : ia * 3 + 3]
            bx, by, bz = positions[ib * 3 : ib * 3 + 3]
            cx, cy, cz = positions[ic * 3 : ic * 3 + 3]

            ux, uy, uz = bx - ax, by - ay, bz - az
            vx, vy, vz = cx - ax, cy - ay, cz - az

            nx = uy * vz - uz * vy
            ny = uz * vx - ux * vz
            nz = ux * vy - uy * vx

            for vertex_index in (ia, ib, ic):
                normals[vertex_index * 3] += nx
                normals[vertex_index * 3 + 1] += ny
                normals[vertex_index * 3 + 2] += nz

        for i in range(0, len(normals), 3):
            nx, ny, nz = normals[i], normals[i + 1], normals[i + 2]
            length = math.sqrt(nx * nx + ny * ny + nz * nz) or 1.0
            normals[i] = nx / length
            normals[i + 1] = ny / length
            normals[i + 2] = nz / length

        return normals

    def _build_glb(self, mesh: dict[str, list[float] | list[int]], spec: dict[str, Any]) -> bytes:
        positions = mesh["positions"]
        normals = mesh["normals"]
        indices = mesh["indices"]

        index_format = "H" if len(positions) // 3 < 65535 else "I"
        index_component_type = 5123 if index_format == "H" else 5125

        position_bytes = struct.pack(f"<{len(positions)}f", *positions)
        normal_bytes = struct.pack(f"<{len(normals)}f", *normals)
        index_bytes = struct.pack(f"<{len(indices)}{index_format}", *indices)

        position_offset = 0
        normal_offset = self._pad_to_four(len(position_bytes))
        index_offset = normal_offset + self._pad_to_four(len(normal_bytes))

        bin_blob = bytearray()
        bin_blob.extend(position_bytes)
        bin_blob.extend(b"\x00" * (normal_offset - len(bin_blob)))
        bin_blob.extend(normal_bytes)
        bin_blob.extend(b"\x00" * (index_offset - len(bin_blob)))
        bin_blob.extend(index_bytes)
        while len(bin_blob) % 4:
            bin_blob.extend(b"\x00")

        color = self._hex_to_rgba(spec.get("baseColor", "#FFFFFF"))
        vertex_count = len(positions) // 3
        bounds = self._bounds(positions)

        gltf = {
            "asset": {"version": "2.0", "generator": "fashion-designer procedural shirt builder"},
            "scene": 0,
            "scenes": [{"nodes": [0]}],
            "nodes": [{"mesh": 0, "name": spec.get("id", "generated-shirt")}],
            "materials": [
                {
                    "name": "fabric",
                    "pbrMetallicRoughness": {
                        "baseColorFactor": color,
                        "metallicFactor": 0.0,
                        "roughnessFactor": 1.0,
                    },
                    "doubleSided": True,
                }
            ],
            "buffers": [{"byteLength": len(bin_blob)}],
            "bufferViews": [
                {
                    "buffer": 0,
                    "byteOffset": position_offset,
                    "byteLength": len(position_bytes),
                    "target": 34962,
                },
                {
                    "buffer": 0,
                    "byteOffset": normal_offset,
                    "byteLength": len(normal_bytes),
                    "target": 34962,
                },
                {
                    "buffer": 0,
                    "byteOffset": index_offset,
                    "byteLength": len(index_bytes),
                    "target": 34963,
                },
            ],
            "accessors": [
                {
                    "bufferView": 0,
                    "componentType": 5126,
                    "count": vertex_count,
                    "type": "VEC3",
                    "min": [bounds["minX"], bounds["minY"], bounds["minZ"]],
                    "max": [bounds["maxX"], bounds["maxY"], bounds["maxZ"]],
                },
                {
                    "bufferView": 1,
                    "componentType": 5126,
                    "count": vertex_count,
                    "type": "VEC3",
                },
                {
                    "bufferView": 2,
                    "componentType": index_component_type,
                    "count": len(indices),
                    "type": "SCALAR",
                },
            ],
            "meshes": [
                {
                    "name": "generated-shirt",
                    "primitives": [
                        {
                            "attributes": {"POSITION": 0, "NORMAL": 1},
                            "indices": 2,
                            "material": 0,
                        }
                    ],
                }
            ],
        }

        json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
        while len(json_bytes) % 4:
            json_bytes += b" "

        total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_blob)
        glb = bytearray()
        glb.extend(struct.pack("<4sII", b"glTF", 2, total_length))
        glb.extend(struct.pack("<I4s", len(json_bytes), b"JSON"))
        glb.extend(json_bytes)
        glb.extend(struct.pack("<I4s", len(bin_blob), b"BIN\x00"))
        glb.extend(bin_blob)
        return bytes(glb)

    def _hex_to_rgba(self, color: str) -> list[float]:
        normalized = color.lstrip("#")
        if len(normalized) != 6:
            return [1.0, 1.0, 1.0, 1.0]
        return [
            int(normalized[0:2], 16) / 255,
            int(normalized[2:4], 16) / 255,
            int(normalized[4:6], 16) / 255,
            1.0,
        ]

    def _bounds(self, positions: list[float]) -> dict[str, float]:
        xs = positions[0::3]
        ys = positions[1::3]
        zs = positions[2::3]
        return {
            "minX": min(xs),
            "maxX": max(xs),
            "minY": min(ys),
            "maxY": max(ys),
            "minZ": min(zs),
            "maxZ": max(zs),
        }

    def _pad_to_four(self, length: int) -> int:
        return (length + 3) & ~3
