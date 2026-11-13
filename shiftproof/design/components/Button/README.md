# Button

Button runs one action, and its label says which.

Use `sp-btn--primary` for the next step on a screen (Find gaps, Draft guide card, Ask question), and only once per step. Use plain `sp-btn` for secondary actions such as Save edits. Inside the granite header, use `sp-btn--on-granite`.

- The consumer provides the label (a verb, from the copy contract) and the handler.
- While the action runs, disable the button and change the label to the busy form ("Finding gaps...").
- Minimum height `control-min`. Never shrink it for density.
