# VerifyStamp

VerifyStamp shows whether the app found a quote word for word in its source.

It reports the app's check from `lib/verify.ts`, never the model's claim. The failed stamp is dashed so it reads in greyscale too. Always show the words with the glyph.

- The consumer provides the boolean result. Labels are fixed: "verified in source" and "quote not found in source".
