from pydantic import BaseModel, Field

from ibm_watsonx_orchestrate.flow_builder.flows import END, Flow, START, flow


class AskInput(BaseModel):
    question: str = Field(description="The apprentice's question, as they asked it.")


class AskOutput(BaseModel):
    reply: str = Field(description="The text to show the apprentice, unchanged.")


@flow(
    name="ask_approved_guidance_flow",
    display_name="Ask approved guidance",
    description=(
        "Asks the ShiftProof app a question about work instruction WI-114 Rev C "
        "and returns the app's reply text unchanged."
    ),
    input_schema=AskInput,
    output_schema=AskOutput,
    suppress_agent_summarization=True,
)
def build_ask_flow(aflow: Flow) -> Flow:
    ask = aflow.tool("ask_approved_guidance")
    ask.map_input(input_variable="question", expression="flow.input.question")
    aflow.map_output(output_variable="reply", expression="flow.ask_approved_guidance.output.reply")
    aflow.sequence(START, ask, END)
    return aflow
