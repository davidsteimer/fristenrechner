#!/usr/bin/env python3
# SPDX-License-Identifier: AGPL-3.0-only

"""Erzeugt die metadatafreien Teams-Symbole des Fristenrechners."""

from __future__ import annotations

import binascii
from pathlib import Path
import struct
import zlib


RGBA = tuple[int, int, int, int]
TRANSPARENT: RGBA = (0, 0, 0, 0)
NAVY: RGBA = (18, 44, 64, 255)
TEAL: RGBA = (47, 111, 115, 255)
COPPER: RGBA = (196, 106, 58, 255)
SNOW: RGBA = (246, 247, 245, 255)
WHITE: RGBA = (255, 255, 255, 255)


class Canvas:
    def __init__(self, width: int, height: int) -> None:
        self.width = width
        self.height = height
        self.pixels = bytearray(TRANSPARENT * (width * height))

    def set_pixel(self, x: int, y: int, colour: RGBA) -> None:
        if 0 <= x < self.width and 0 <= y < self.height:
            offset = (y * self.width + x) * 4
            self.pixels[offset:offset + 4] = bytes(colour)

    def fill_rectangle(
        self,
        left: int,
        top: int,
        right: int,
        bottom: int,
        colour: RGBA,
    ) -> None:
        for y in range(top, bottom + 1):
            for x in range(left, right + 1):
                self.set_pixel(x, y, colour)

    def fill_circle(self, centre_x: int, centre_y: int, radius: int, colour: RGBA) -> None:
        radius_squared = radius * radius
        for y in range(centre_y - radius, centre_y + radius + 1):
            for x in range(centre_x - radius, centre_x + radius + 1):
                if (x - centre_x) ** 2 + (y - centre_y) ** 2 <= radius_squared:
                    self.set_pixel(x, y, colour)

    def fill_rounded_rectangle(
        self,
        left: int,
        top: int,
        right: int,
        bottom: int,
        radius: int,
        colour: RGBA,
    ) -> None:
        radius_squared = radius * radius
        for y in range(top, bottom + 1):
            for x in range(left, right + 1):
                nearest_x = min(max(x, left + radius), right - radius)
                nearest_y = min(max(y, top + radius), bottom - radius)
                if (x - nearest_x) ** 2 + (y - nearest_y) ** 2 <= radius_squared:
                    self.set_pixel(x, y, colour)

    def draw_line(
        self,
        start_x: int,
        start_y: int,
        end_x: int,
        end_y: int,
        width: int,
        colour: RGBA,
    ) -> None:
        steps = max(abs(end_x - start_x), abs(end_y - start_y), 1)
        radius = max(0, width // 2)
        for step in range(steps + 1):
            x = round(start_x + (end_x - start_x) * step / steps)
            y = round(start_y + (end_y - start_y) * step / steps)
            self.fill_circle(x, y, radius, colour)


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    checksum = binascii.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", checksum)


def write_png(path: Path, canvas: Canvas) -> None:
    header = struct.pack(">IIBBBBB", canvas.width, canvas.height, 8, 6, 0, 0, 0)
    scanlines = b"".join(
        b"\x00" + bytes(canvas.pixels[y * canvas.width * 4:(y + 1) * canvas.width * 4])
        for y in range(canvas.height)
    )
    payload = (
        b"\x89PNG\r\n\x1a\n"
        + png_chunk(b"IHDR", header)
        + png_chunk(b"IDAT", zlib.compress(scanlines, level=9))
        + png_chunk(b"IEND", b"")
    )
    path.write_bytes(payload)


def colour_icon() -> Canvas:
    icon = Canvas(192, 192)
    icon.fill_rounded_rectangle(18, 18, 173, 173, 32, NAVY)
    icon.fill_rounded_rectangle(42, 48, 150, 153, 13, SNOW)
    icon.fill_rounded_rectangle(42, 48, 150, 84, 13, TEAL)
    icon.fill_rectangle(42, 70, 150, 84, TEAL)
    icon.fill_rounded_rectangle(61, 36, 73, 60, 6, COPPER)
    icon.fill_rounded_rectangle(119, 36, 131, 60, 6, COPPER)
    icon.draw_line(62, 103, 131, 103, 4, NAVY)
    icon.draw_line(62, 125, 105, 125, 4, NAVY)
    icon.draw_line(113, 129, 122, 138, 5, COPPER)
    icon.draw_line(122, 138, 140, 115, 5, COPPER)
    return icon


def outline_icon() -> Canvas:
    icon = Canvas(32, 32)
    icon.fill_rounded_rectangle(3, 5, 28, 29, 5, WHITE)
    icon.fill_rounded_rectangle(6, 8, 25, 26, 2, TRANSPARENT)
    icon.fill_rectangle(6, 11, 25, 13, WHITE)
    icon.fill_rounded_rectangle(8, 2, 11, 9, 2, WHITE)
    icon.fill_rounded_rectangle(20, 2, 23, 9, 2, WHITE)
    icon.draw_line(10, 20, 14, 24, 2, WHITE)
    icon.draw_line(14, 24, 22, 16, 2, WHITE)
    return icon


def main() -> None:
    target = Path(__file__).resolve().parents[1] / "teams"
    target.mkdir(parents=True, exist_ok=True)
    component_id = "596c7f1c-4d3e-4da8-a7be-27a96024f37c"
    write_png(target / f"{component_id}_color.png", colour_icon())
    write_png(target / f"{component_id}_outline.png", outline_icon())


if __name__ == "__main__":
    main()
