// import { StateEffect, StateField, RangeSetBuilder } from "@codemirror/state";
// import { Decoration, EditorView } from "@codemirror/view";

// export const addLineHighlight = StateEffect.define<number>();

// const lineHighlightMark = Decoration.line({
//   attributes: { style: "background-color: yellow" }
// });

// export const lineHighlightField = StateField.define({
//   create() {
//     return Decoration.none;
//   },
//   update(decorations, transaction) {
//     decorations = decorations.map(transaction.changes);
//     for (let effect of transaction.effects) {
//       if (effect.is(addLineHighlight)) {
//         // Clear previous highlights and add the new one
//         const builder = new RangeSetBuilder<Decoration>();
//         builder.add(effect.value, effect.value, lineHighlightMark);
//         decorations = builder.finish();
//       }
//     }
//     return decorations;
//   },
//   provide: f => EditorView.decorations.from(f)
// });

import { StateEffect, StateField, RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView } from "@codemirror/view";

// A decoration to highlight entire lines
const lineHighlightMark = Decoration.line({
  attributes: { style: "background-color: yellow" },
});

// Define a new effect for a range of lines
export const addLineHighlightRange = StateEffect.define<{
  fromLine: number;
  toLine: number;
}>();

// New effect to clear the highlight
export const clearLineHighlight = StateEffect.define<void>();

export const lineHighlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, transaction) {
    decorations = decorations.map(transaction.changes);
    for (let effect of transaction.effects) {
      if (effect.is(addLineHighlightRange)) {
        // Clear previous highlights
        let builder = new RangeSetBuilder<Decoration>();

        let { fromLine, toLine } = effect.value;
        // Ensure lines are within document bounds
        const doc = transaction.state.doc;
        fromLine = Math.max(1, Math.min(fromLine, doc.lines));
        toLine = Math.max(1, Math.min(toLine, doc.lines));

        // Add a line decoration for each line in the range
        for (let lineNo = fromLine; lineNo <= toLine; lineNo++) {
          let line = doc.line(lineNo);
          builder.add(line.from, line.from, lineHighlightMark);
        }
        decorations = builder.finish();
      } else if (effect.is(clearLineHighlight)) {
        // Clear all highlights
        decorations = Decoration.none;
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});
