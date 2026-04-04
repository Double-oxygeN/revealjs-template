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

import Reveal from 'reveal.js';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealMath from 'reveal.js/plugin/math';
import RevealNotes from 'reveal.js/plugin/notes';
import mermaid from 'mermaid';
import { initCycleRings } from './components/cycle-ring.js';
import 'reveal.js/reset.css';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/white.css';
import 'reveal.js/plugin/highlight/monokai.css';
import './style.css';

const deck = new Reveal({
    width: 1440,
    height: 810,
    margin: 0,
    center: false,
    pdfSeparateFragments: false,
    progress: false,
    transition: 'none',
    katex: {
        local: 'node_modules/katex'
    },
    plugins: [RevealHighlight, RevealMath.KaTeX, RevealNotes],
});
mermaid.initialize({ startOnLoad: false, theme: 'default' });

deck.initialize().then(() => {
    initCycleRings();

    // Run Mermaid on the initial slide
    mermaid.run({ querySelector: '.present pre.mermaid' });

    // Re-run Mermaid whenever the slide changes so newly-visible diagrams render
    deck.on('slidechanged', () => {
        mermaid.run({ querySelector: '.present pre.mermaid' });
    });

    if (window.__screenshot__) window.__reveal__ = deck;
});
