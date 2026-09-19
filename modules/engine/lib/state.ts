import { Annotation } from "@langchain/langgraph";

/** Data flowing between canvas nodes */
export const WorkflowState = Annotation.Root({
  item: Annotation<any>({
    reducer: (_prev, next) => next ?? _prev,
    default: () => ({}),
  }),
  /** Branch id for IF / Switch nodes (e.g. "true", "false", "a") */
  branch: Annotation<string>({
    reducer: (_prev, next) => next ?? _prev,
    default: () => "",
  }),
  /** Output snapshot per node id */
  nodeResults: Annotation<Record<string, any>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),
});

export type WorkflowStateType = typeof WorkflowState.State;
