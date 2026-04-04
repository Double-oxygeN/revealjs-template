// Copyright 2026 Yuya Shiratori (template author)
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const NS = 'http://www.w3.org/2000/svg';

/**
 * Auto-generate SVG arrow arcs for every `.cycle-ring[data-autoarrow]` that
 * does not already contain a `.cycle-ring__arrows` element.
 *
 * Reads `--ring-size`, `--ring-r`, `--ring-node-size` from the container
 * and `--a` from each `.cycle-ring__node` to compute arc paths.
 *
 * Direction is controlled by the attribute value:
 *   data-autoarrow          → clockwise (default)
 *   data-autoarrow="cw"     → clockwise
 *   data-autoarrow="ccw"    → counter-clockwise
 */
export function initCycleRings() {
    document.querySelectorAll('.cycle-ring[data-autoarrow]').forEach((ring) => {
        if (ring.querySelector('.cycle-ring__arrows')) return;

        const nodes = ring.querySelectorAll(':scope > .cycle-ring__node');
        const n = nodes.length;
        if (n < 2) return;

        const ccw = ring.dataset.autoarrow === 'ccw';

        const cs = getComputedStyle(ring);
        const r = parseFloat(cs.getPropertyValue('--ring-r'));
        const nodeSize = parseFloat(cs.getPropertyValue('--ring-node-size'));
        const size = 2 * (r + nodeSize / 2);
        const cx = size / 2;
        const cy = size / 2;

        // Angular clearance past node edge (degrees) + small extra gap
        const offset = (Math.atan2(nodeSize / 2, r) * 180) / Math.PI + 2;

        const angles = [...nodes].map((nd) =>
            parseFloat(nd.style.getPropertyValue('--a'))
        );

        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'cycle-ring__arrows');
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        // Arrowhead marker (unique id per ring)
        const mid = `arw-${crypto.randomUUID().slice(0, 8)}`;
        const defs = document.createElementNS(NS, 'defs');
        const marker = document.createElementNS(NS, 'marker');
        for (const [k, v] of Object.entries({
            id: mid, viewBox: '0 0 10 10',
            refX: '9', refY: '5',
            markerWidth: '7', markerHeight: '7', orient: 'auto',
        })) marker.setAttribute(k, v);

        const mp = document.createElementNS(NS, 'path');
        mp.setAttribute('d', 'M0 1 L10 5 L0 9z');
        mp.style.fill = 'var(--ring-arrow)';
        marker.appendChild(mp);
        defs.appendChild(marker);
        svg.appendChild(defs);

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const sDeg = angles[i] + (ccw ? -offset : offset);
            const eDeg = angles[j] + (ccw ? offset : -offset);
            const sRad = (sDeg * Math.PI) / 180;
            const eRad = (eDeg * Math.PI) / 180;

            const sx = cx + r * Math.cos(sRad);
            const sy = cy + r * Math.sin(sRad);
            const ex = cx + r * Math.cos(eRad);
            const ey = cy + r * Math.sin(eRad);

            // Arc span in the sweep direction to decide large-arc-flag
            const span = ccw
                ? ((sDeg - eDeg) % 360 + 360) % 360
                : ((eDeg - sDeg) % 360 + 360) % 360;
            const large = span > 180 ? 1 : 0;
            const sweep = ccw ? 0 : 1;

            const p = document.createElementNS(NS, 'path');
            p.setAttribute('d',
                `M${Math.round(sx)},${Math.round(sy)} ` +
                `A${r},${r} 0 ${large},${sweep} ` +
                `${Math.round(ex)},${Math.round(ey)}`);
            p.style.fill = 'none';
            p.style.stroke = 'var(--ring-arrow)';
            p.style.strokeWidth = '2';
            p.setAttribute('marker-end', `url(#${mid})`);
            svg.appendChild(p);
        }

        ring.prepend(svg);
    });
}
