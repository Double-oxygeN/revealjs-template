import Reveal from 'reveal.js';
import RevealHighlight from 'reveal.js/plugin/highlight';
import RevealMath from 'reveal.js/plugin/math';
import RevealNotes from 'reveal.js/plugin/notes';
import mermaid from 'mermaid';
import 'reveal.js/reset.css';
import 'reveal.js/reveal.css';
import 'reveal.js/theme/white.css';
import 'reveal.js/plugin/highlight/monokai.css';
import './style.css';

const deck = new Reveal({
    width: 1280,
    height: 720,
    margin: 0,
    progress: false,
    transition: 'none',
    katex: {
        local: 'node_modules/katex'
    },
    plugins: [RevealHighlight, RevealMath.KaTeX, RevealNotes],
});
mermaid.initialize({ startOnLoad: false, theme: 'default' });

deck.initialize().then(() => {
    // Run Mermaid on the initial slide
    mermaid.run({ querySelector: '.present pre.mermaid' });

    // Re-run Mermaid whenever the slide changes so newly-visible diagrams render
    deck.on('slidechanged', () => {
        mermaid.run({ querySelector: '.present pre.mermaid' });
    });

    if (window.__screenshot__) window.__reveal__ = deck;
});
