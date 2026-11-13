# AnswerPanel

AnswerPanel shows the apprentice's answer from approved guidance, or the refusal.

In scope: an `accept` frame headed "Answer from approved guidance", the answer, the cited card with its InspectionTag, and the veteran's words in a SourceQuote. Out of scope: `sp-answer--out`, a dashed `reject` frame headed "No approved guidance", and the fixed refusal. The server decides which; the panel never upgrades a refusal.

- The consumer provides the API response: scope, answer, cited cards and cited quotes.
